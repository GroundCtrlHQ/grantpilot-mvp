"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DocumentAnalyzerProps {
  applicationId: string
  onAnalysisComplete?: (analysis: any) => void
}

interface ChecklistRequirement {
  id: string
  text: string
  category: string
  completed: boolean
  matched_content?: string
  confidence?: number
  suggestions?: string
}

export function DocumentAnalyzer({ applicationId, onAnalysisComplete }: DocumentAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [documentText, setDocumentText] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [checklist, setChecklist] = useState<ChecklistRequirement[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const { toast } = useToast()

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)

      // Read file content
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setDocumentText(content)
      }
      reader.readAsText(file)
    }
  }, [])

  const analyzeDocument = async () => {
    if (!documentText.trim()) {
      toast({
        title: "No content to analyze",
        description: "Please upload a document or enter text to analyze.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          documentText,
          grantRequirements: "Standard federal grant requirements",
        }),
      })

      const result = await response.json()

      if (result.success) {
        setChecklist(result.analysis.requirements)
        setAnalysis(result.analysis)
        onAnalysisComplete?.(result.analysis)

        toast({
          title: "Analysis complete!",
          description: `Found ${result.analysis.requirements.length} requirements to check.`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis failed",
        description: "Failed to analyze document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getCompletionStats = () => {
    if (checklist.length === 0) return { completed: 0, total: 0, percentage: 0 }

    const completed = checklist.filter((req) => req.completed).length
    const total = checklist.length
    const percentage = Math.round((completed / total) * 100)

    return { completed, total, percentage }
  }

  const stats = getCompletionStats()

  return (
    <div className="space-y-6">
      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Document Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Upload Document</label>
              <div className="flex items-center gap-4">
                <Input type="file" accept=".txt,.doc,.docx,.pdf" onChange={handleFileUpload} className="flex-1" />
                <Button
                  onClick={analyzeDocument}
                  disabled={isAnalyzing || !documentText.trim()}
                  className="flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Or paste text directly</label>
              <Textarea
                placeholder="Paste your grant application text here..."
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Completion Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.completed} of {stats.total} requirements met
                  </span>
                </div>
                <Progress value={stats.percentage} className="h-2" />
              </div>
              <Badge
                variant={stats.percentage >= 80 ? "default" : stats.percentage >= 50 ? "secondary" : "destructive"}
              >
                {stats.percentage}%
              </Badge>
            </div>

            {analysis.overall_analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                  <ul className="text-sm space-y-1">
                    {analysis.overall_analysis.strengths?.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-orange-600 mb-2">Areas for Improvement</h4>
                  <ul className="text-sm space-y-1">
                    {analysis.overall_analysis.areas_for_improvement?.map((area: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Requirements Checklist */}
      {checklist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Requirements Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checklist.map((requirement) => (
                <div
                  key={requirement.id}
                  className={`p-4 rounded-lg border ${
                    requirement.completed ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {requirement.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{requirement.text}</h4>
                        <Badge variant="outline" className="text-xs">
                          {requirement.category}
                        </Badge>
                        {requirement.confidence && (
                          <Badge variant="secondary" className="text-xs">
                            {requirement.confidence}% match
                          </Badge>
                        )}
                      </div>
                      {requirement.matched_content && (
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Found:</strong> "{requirement.matched_content.substring(0, 100)}..."
                        </p>
                      )}
                      {requirement.suggestions && (
                        <p className="text-sm text-orange-700">
                          <strong>Suggestion:</strong> {requirement.suggestions}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
