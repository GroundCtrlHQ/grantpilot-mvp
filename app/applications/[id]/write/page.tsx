"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { WritingEditor } from "@/components/writing-editor"
import { ScorePanel } from "@/components/score-panel"
import { SmartChecklist } from "@/components/smart-checklist"
import { LiveFeedbackPanel } from "@/components/live-feedback-panel"
import { Save, Zap } from "lucide-react"
import { getApplication, getGrants, updateApplication } from "@/lib/storage"
import type { Application, Grant } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

interface ScoreData {
  totalScore: number
  breakdown: {
    clarity: number
    specificity: number
    alignment: number
    completeness: number
  }
  recommendations: string[]
}

export default function WriteApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [application, setApplication] = useState<Application | null>(null)
  const [grant, setGrant] = useState<Grant | null>(null)
  const [score, setScore] = useState<ScoreData | null>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [content, setContent] = useState({
    projectTitle: "",
    projectSummary: "",
    narrativeText: "",
  })
  const [checklistRequirements, setChecklistRequirements] = useState<any[]>([])

  useEffect(() => {
    const app = getApplication(params.id as string)
    if (app) {
      setApplication(app)
      setContent({
        projectTitle: app.projectTitle || "",
        projectSummary: app.projectSummary || "",
        narrativeText: app.narrativeText || "",
      })

      const grants = getGrants()
      const foundGrant = grants.find((g) => g.id === app.grantId)
      setGrant(foundGrant || null)
    }
  }, [params.id])

  const handleSaveDraft = () => {
    if (!application) return

    updateApplication(application.id, {
      projectTitle: content.projectTitle,
      projectSummary: content.projectSummary,
      narrativeText: content.narrativeText,
    })

    toast({
      title: "Draft saved",
      description: "Your application has been saved successfully.",
    })
  }

  const handleCheckScore = async () => {
    if (!application || !grant) return

    setIsScoring(true)
    setScore(null)

    try {
      const response = await fetch("/api/ai/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: application.id,
          projectTitle: content.projectTitle,
          projectSummary: content.projectSummary,
          narrativeText: content.narrativeText,
          grantContext: {
            agency: grant.agency,
            category: grant.category,
            awardRange:
              grant.awardFloor && grant.awardCeiling
                ? `$${grant.awardFloor.toLocaleString()} - $${grant.awardCeiling.toLocaleString()}`
                : "Not specified",
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to score application")
      }

      const scoreData = await response.json()
      setScore(scoreData)

      toast({
        title: "Score updated",
        description: "Your application has been analyzed by AI.",
      })
    } catch (error) {
      console.error("Scoring error:", error)
      toast({
        title: "Scoring failed",
        description: "Unable to score your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScoring(false)
    }
  }

  const handleRequirementUpdate = (requirementId: string, completed: boolean, confidence: number) => {
    console.log(`[v0] Requirement ${requirementId} updated: ${completed} (${confidence}% confidence)`)
    // Update local state for real-time feedback
    setChecklistRequirements((prev) =>
      prev.map((req) => (req.id === requirementId ? { ...req, completed, confidence } : req)),
    )
  }

  const handleFeedbackUpdate = (feedback: any) => {
    // Update requirements based on live feedback
    if (feedback.requirement_updates) {
      setChecklistRequirements((prev) => {
        const updated = [...prev]
        feedback.requirement_updates.forEach((update: any) => {
          const index = updated.findIndex((req) => req.id === update.id)
          if (index !== -1) {
            updated[index] = { ...updated[index], ...update }
          }
        })
        return updated
      })
    }
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">Application not found</h3>
          <p className="text-muted-foreground mb-4">The application you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/applications")}>Back to Applications</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground">Write Application</h1>
          <p className="text-muted-foreground">{grant?.title || "Unknown Grant"}</p>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor (Left - 60%) */}
          <div className="lg:col-span-2 space-y-6">
            <WritingEditor application={application} onContentChange={setContent} />

            {/* Action Buttons */}
            <div className="flex gap-3 pb-6">
              <Button onClick={handleSaveDraft} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleCheckScore} disabled={isScoring}>
                <Zap className="h-4 w-4 mr-2" />
                {isScoring ? "Analyzing..." : "Check My Score"}
              </Button>
            </div>
          </div>

          {/* Right Panel - Live Feedback + Checklist + Score */}
          <div className="lg:col-span-1 space-y-6">
            <LiveFeedbackPanel
              content={content}
              requirements={checklistRequirements}
              grantContext={grant}
              onFeedbackUpdate={handleFeedbackUpdate}
            />

            <SmartChecklist
              applicationId={application?.id || ""}
              content={content}
              onRequirementUpdate={handleRequirementUpdate}
            />

            <ScorePanel score={score} isLoading={isScoring} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
