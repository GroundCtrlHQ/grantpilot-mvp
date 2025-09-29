"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { PDFGrantAnalyzer } from "@/components/pdf-grant-analyzer"
import { DocumentAnalyzer } from "@/components/document-analyzer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, Upload } from "lucide-react"
import { getApplication, getGrants } from "@/lib/storage"
import type { Application, Grant } from "@/lib/storage"

export default function AnalyzeApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [grant, setGrant] = useState<Grant | null>(null)

  useEffect(() => {
    const app = getApplication(params.id as string)
    if (app) {
      setApplication(app)
      const grants = getGrants()
      const foundGrant = grants.find((g) => g.id === app.grantId)
      setGrant(foundGrant || null)
    }
  }, [params.id])

  const handleAnalysisComplete = (analysis: any) => {
    // Navigate to write page after analysis is complete
    router.push(`/applications/${params.id}/write`)
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-foreground">Analyze Grant Requirements</h1>
            <p className="text-muted-foreground">{grant?.title || "Unknown Grant"}</p>
          </div>
        </div>

        {/* Analysis Tabs */}
        <Tabs defaultValue="pdf" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Grant PDF
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Analyze Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="mt-6">
            <PDFGrantAnalyzer applicationId={application.id} onAnalysisComplete={handleAnalysisComplete} />
          </TabsContent>

          <TabsContent value="text" className="mt-6">
            <DocumentAnalyzer applicationId={application.id} onAnalysisComplete={handleAnalysisComplete} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
