"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, RefreshCw, Brain, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ChecklistRequirement {
  id: string
  text: string
  category: string
  completed: boolean
  matched_content?: string
  confidence?: number
  suggestions?: string
  keywords?: string[]
}

interface SmartChecklistProps {
  applicationId: string
  content: {
    projectTitle: string
    projectSummary: string
    narrativeText: string
  }
  onRequirementUpdate?: (requirementId: string, completed: boolean, confidence: number) => void
}

export function SmartChecklist({ applicationId, content, onRequirementUpdate }: SmartChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistRequirement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastAnalyzed, setLastAnalyzed] = useState<string>("")
  const { toast } = useToast()

  // Combine all content for analysis
  const fullContent = useMemo(() => {
    return `${content.projectTitle}\n\n${content.projectSummary}\n\n${content.narrativeText}`.trim()
  }, [content])

  // Real-time content analysis
  useEffect(() => {
    if (checklist.length === 0 || fullContent === lastAnalyzed) return

    const analyzeContent = () => {
      const updatedChecklist = checklist.map((requirement) => {
        const { completed, confidence, matchedContent } = analyzeRequirement(requirement, fullContent)

        if (completed !== requirement.completed) {
          onRequirementUpdate?.(requirement.id, completed, confidence)
        }

        return {
          ...requirement,
          completed,
          confidence,
          matched_content: matchedContent,
        }
      })

      setChecklist(updatedChecklist)
    }

    // Debounce the analysis
    const timeoutId = setTimeout(analyzeContent, 1000)
    return () => clearTimeout(timeoutId)
  }, [fullContent, checklist, lastAnalyzed, onRequirementUpdate])

  // Analyze individual requirement against content
  const analyzeRequirement = (requirement: ChecklistRequirement, content: string) => {
    const keywords = requirement.keywords || extractKeywords(requirement.text)
    const contentLower = content.toLowerCase()
    const requirementLower = requirement.text.toLowerCase()

    let matchScore = 0
    let matchedContent = ""

    // Keyword matching
    const keywordMatches = keywords.filter((keyword) => contentLower.includes(keyword.toLowerCase()))
    matchScore += (keywordMatches.length / keywords.length) * 40

    // Semantic matching (simplified)
    if (contentLower.includes(requirementLower.split(" ")[0])) matchScore += 20
    if (contentLower.includes(requirementLower.split(" ")[1])) matchScore += 20

    // Content length consideration
    if (content.length > 100) matchScore += 10
    if (content.length > 500) matchScore += 10

    // Find best matching sentence
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20)
    let bestMatch = ""
    let bestMatchScore = 0

    sentences.forEach((sentence) => {
      const sentenceScore = keywordMatches.reduce((score, keyword) => {
        return sentence.toLowerCase().includes(keyword.toLowerCase()) ? score + 1 : score
      }, 0)

      if (sentenceScore > bestMatchScore) {
        bestMatchScore = sentenceScore
        bestMatch = sentence.trim()
      }
    })

    if (bestMatch) {
      matchedContent = bestMatch.substring(0, 150) + (bestMatch.length > 150 ? "..." : "")
    }

    const confidence = Math.min(Math.round(matchScore), 100)
    const completed = confidence >= 60

    return { completed, confidence, matchedContent }
  }

  // Extract keywords from requirement text
  const extractKeywords = (text: string): string[] => {
    const commonWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
    ]

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !commonWords.includes(word))
      .slice(0, 5) // Top 5 keywords
  }

  // Load initial checklist
  const loadChecklist = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/checklist/${applicationId}`)
      if (response.ok) {
        const data = await response.json()
        setChecklist(data.requirements || [])
      }
    } catch (error) {
      console.error("Failed to load checklist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate new checklist
  const generateChecklist = async () => {
    if (!fullContent.trim()) {
      toast({
        title: "No content to analyze",
        description: "Please write some content first before generating a checklist.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          documentText: fullContent,
          grantRequirements: "Standard federal grant requirements",
        }),
      })

      const result = await response.json()

      if (result.success) {
        const requirementsWithKeywords = result.analysis.requirements.map((req: ChecklistRequirement) => ({
          ...req,
          keywords: extractKeywords(req.text),
        }))

        setChecklist(requirementsWithKeywords)
        setLastAnalyzed(fullContent)

        toast({
          title: "Checklist generated!",
          description: `Created ${result.analysis.requirements.length} requirements to track.`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Generation error:", error)
      toast({
        title: "Generation failed",
        description: "Failed to generate checklist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load checklist on mount
  useEffect(() => {
    loadChecklist()
  }, [applicationId])

  const getCompletionStats = () => {
    if (checklist.length === 0) return { completed: 0, total: 0, percentage: 0 }

    const completed = checklist.filter((req) => req.completed).length
    const total = checklist.length
    const percentage = Math.round((completed / total) * 100)

    return { completed, total, percentage }
  }

  const stats = getCompletionStats()

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Smart Checklist
          </CardTitle>
          <Button variant="outline" size="sm" onClick={generateChecklist} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            {checklist.length === 0 ? "Generate" : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {checklist.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No checklist generated yet</p>
            <p className="text-sm">Write some content and click Generate to create an AI-powered checklist</p>
          </div>
        ) : (
          <>
            {/* Progress Overview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className="text-muted-foreground">
                  {stats.completed} of {stats.total} complete
                </span>
              </div>
              <Progress value={stats.percentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <Badge
                  variant={stats.percentage >= 80 ? "default" : stats.percentage >= 50 ? "secondary" : "destructive"}
                >
                  {stats.percentage}%
                </Badge>
                <span>100%</span>
              </div>
            </div>

            {/* Requirements List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {checklist.map((requirement) => (
                <div
                  key={requirement.id}
                  className={`p-3 rounded-lg border transition-all ${
                    requirement.completed
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                      : "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {requirement.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium leading-tight">{requirement.text}</p>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {requirement.category}
                        </Badge>
                        {requirement.confidence !== undefined && (
                          <Badge
                            variant={
                              requirement.confidence >= 80
                                ? "default"
                                : requirement.confidence >= 60
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {requirement.confidence}% match
                          </Badge>
                        )}
                      </div>
                      {requirement.matched_content && (
                        <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded border">
                          <strong>Found:</strong> "{requirement.matched_content}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
