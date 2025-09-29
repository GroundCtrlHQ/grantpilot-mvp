"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Upload, Brain, Calendar, DollarSign, Users, CheckCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PDFGrantAnalyzerProps {
  applicationId: string
  onAnalysisComplete?: (analysis: any) => void
}

interface GrantInfo {
  program_name: string
  funding_agency: string
  deadline: string
  funding_amount: string
  eligibility: string[]
  required_components: string[]
  evaluation_criteria: string[]
}

interface ApplicationRequirement {
  section: string
  description: string
  page_limit?: string
  formatting?: string
}

export function PDFGrantAnalyzer({ applicationId, onAnalysisComplete }: PDFGrantAnalyzerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [grantInfo, setGrantInfo] = useState<GrantInfo | null>(null)
  const [requirements, setRequirements] = useState<ApplicationRequirement[]>([])
  const [extractedText, setExtractedText] = useState("")
  const { toast } = useToast()

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        if (file.type !== "application/pdf") {
          toast({
            title: "Invalid file type",
            description: "Please upload a PDF file.",
            variant: "destructive",
          })
          return
        }
        setUploadedFile(file)
      }
    },
    [toast],
  )

  const processPDF = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to analyze.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("file", uploadedFile)
      formData.append("applicationId", applicationId)

      const response = await fetch("/api/process-pdf", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setGrantInfo(result.analysis.grant_info)
        setRequirements(result.analysis.application_requirements)
        setExtractedText(result.analysis.extracted_text)

        onAnalysisComplete?.(result.analysis)

        toast({
          title: "PDF processed successfully!",
          description: `Analyzed ${result.filename} and extracted grant requirements.`,
        })

        setTimeout(() => {
          generateApplicationChecklist()
        }, 1000)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("PDF processing error:", error)
      toast({
        title: "Processing failed",
        description: "Failed to process PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const generateApplicationChecklist = async () => {
    if (!extractedText) return

    try {
      const response = await fetch("/api/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          documentText: extractedText,
          grantRequirements: `Grant Program: ${grantInfo?.program_name}\nFunding Agency: ${grantInfo?.funding_agency}\nRequired Components: ${grantInfo?.required_components.join(", ")}`,
        }),
      })

      const result = await response.json()
      if (result.success) {
        toast({
          title: "Checklist generated!",
          description: "Your personalized application checklist is ready.",
        })
      }
    } catch (error) {
      console.error("Checklist generation error:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* PDF Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Grant Application PDF Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-medium">Upload Grant Application PDF</h3>
                <p className="text-sm text-muted-foreground">
                  Upload the official grant application PDF to extract requirements and deadlines
                </p>
              </div>
              <div className="flex items-center gap-4 justify-center">
                <Input type="file" accept=".pdf" onChange={handleFileUpload} className="max-w-xs" />
                <Button
                  onClick={processPDF}
                  disabled={isProcessing || !uploadedFile}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Brain className="h-4 w-4 animate-pulse" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Analyze PDF
                    </>
                  )}
                </Button>
              </div>
              {uploadedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grant Information */}
      {grantInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Grant Program Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">{grantInfo.program_name}</p>
                    <p className="text-sm text-muted-foreground">{grantInfo.funding_agency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium">Deadline</p>
                    <p className="text-sm text-muted-foreground">{grantInfo.deadline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Funding Amount</p>
                    <p className="text-sm text-muted-foreground">{grantInfo.funding_amount}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <p className="font-medium">Eligibility Requirements</p>
                  </div>
                  <div className="space-y-1">
                    {grantInfo.eligibility.map((req, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Required Application Components</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {grantInfo.required_components.map((component, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{component}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Evaluation Criteria</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {grantInfo.evaluation_criteria.map((criteria, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">{criteria}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Button to generate checklist is removed as it's now automatic */}
          </CardContent>
        </Card>
      )}

      {/* Detailed Requirements */}
      {requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Application Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requirements.map((req, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{req.section}</h4>
                    {req.page_limit && <Badge variant="secondary">{req.page_limit}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{req.description}</p>
                  {req.formatting && (
                    <p className="text-xs text-blue-600">
                      <strong>Formatting:</strong> {req.formatting}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
