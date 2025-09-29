"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  Target,
  Award,
  Phone,
  Rocket
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExploreGrantModalProps {
  isOpen: boolean
  onClose: () => void
  grant: {
    id: string
    title: string
    agency: string
    opportunityNumber: string
    detailsUrl?: string
  }
  userProfile?: {
    focusAreas?: string[]
    organizationType?: string
    organizationSize?: string
  }
}

export function ExploreGrantModal({ isOpen, onClose, grant, userProfile }: ExploreGrantModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState<string>("")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [grantDetails, setGrantDetails] = useState<any>(null)
  const [matchPercentage, setMatchPercentage] = useState<number | null>(null)
  const { toast } = useToast()

  const handleExplore = async () => {
    if (!grant.detailsUrl) {
      toast({
        title: "No details available",
        description: "This grant doesn't have a details URL to explore.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setLoadingProgress(0)
    setLoadingStep("Initializing...")
    
    // Simulate progress steps
    const progressSteps = [
      { step: "Connecting to grant website...", progress: 10 },
      { step: "Scraping grant content...", progress: 30 },
      { step: "Analyzing grant details...", progress: 50 },
      { step: "Extracting structured data...", progress: 70 },
      { step: "Calculating match percentage...", progress: 90 },
      { step: "Finalizing results...", progress: 100 }
    ]

    try {
      // Start the progress simulation
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const currentStep = progressSteps.find(step => step.progress > prev)
          if (currentStep) {
            setLoadingStep(currentStep.step)
            return Math.min(prev + 2, currentStep.progress)
          }
          return prev
        })
      }, 500)

      const response = await fetch('/api/explore-grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grantUrl: grant.detailsUrl,
          userProfile: userProfile || {}
        })
      })

      clearInterval(progressInterval)
      setLoadingProgress(100)
      setLoadingStep("Complete!")

      if (response.ok) {
        const result = await response.json()
        setGrantDetails(result.grantDetails)
        setMatchPercentage(result.matchPercentage)
        
        toast({
          title: "Grant explored successfully",
          description: `Found detailed information for "${result.grantDetails.title}".`,
        })
      } else {
        throw new Error('Failed to explore grant')
      }
    } catch (error) {
      console.error('Error exploring grant:', error)
      toast({
        title: "Exploration failed",
        description: "Unable to retrieve detailed grant information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setLoadingStep("")
      setLoadingProgress(0)
    }
  }

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getMatchLabel = (percentage: number) => {
    if (percentage >= 80) return "Excellent Match"
    if (percentage >= 60) return "Good Match"
    if (percentage >= 40) return "Fair Match"
    return "Low Match"
  }

  const handleStartApplication = () => {
    // Close the modal first
    onClose()
    
    // Navigate to preparation page with grant details
    const params = new URLSearchParams({
      grantId: grant.id,
      oppNumber: grant.opportunityNumber,
      title: grant.title,
      agency: grant.agency,
      matchPercentage: matchPercentage?.toString() || "0",
      grantDetails: JSON.stringify(grantDetails)
    })
    
    router.push(`/prepare?${params.toString()}`)
    
    toast({
      title: "Starting Application",
      description: "Let's prepare your application for this grant opportunity.",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Explore Grant Details
          </DialogTitle>
          <DialogDescription>
            Get detailed information about this grant opportunity and see how well it matches your profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Grant Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{grant.title}</h3>
                  <p className="text-sm text-muted-foreground">{grant.agency}</p>
                  <p className="text-xs text-muted-foreground">Opportunity: {grant.opportunityNumber}</p>
                </div>
                {grant.detailsUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExplore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Explore in Detail
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Match Percentage */}
          {matchPercentage !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Profile Match
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Match Score</span>
                    <span className={`text-2xl font-bold ${getMatchColor(matchPercentage)}`}>
                      {matchPercentage}%
                    </span>
                  </div>
                  <Progress value={matchPercentage} className="h-2" />
                  <p className={`text-sm font-medium ${getMatchColor(matchPercentage)}`}>
                    {getMatchLabel(matchPercentage)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grant Details */}
          {grantDetails && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Grant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">Deadline</p>
                        <p className="text-sm text-foreground break-words">{grantDetails.deadline}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">Funding Amount</p>
                        <p className="text-sm text-foreground break-words">{grantDetails.fundingAmount}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 lg:col-span-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">Contact</p>
                        <p className="text-sm text-foreground break-words">{grantDetails.contactInfo}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 lg:col-span-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">Source</p>
                        <a 
                          href={grantDetails.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-words"
                        >
                          View Original
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description - Full Width */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed">{grantDetails.description}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Eligibility Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Eligibility Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {grantDetails.eligibility.map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm text-foreground leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Required Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                    Required Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {grantDetails.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm text-foreground leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Application Process */}
              {grantDetails.applicationProcess && grantDetails.applicationProcess.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-500" />
                      Application Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {grantDetails.applicationProcess.map((step: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                          <span className="text-sm text-foreground leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Evaluation Criteria */}
              {grantDetails.evaluationCriteria && grantDetails.evaluationCriteria.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-indigo-500" />
                      Evaluation Criteria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {grantDetails.evaluationCriteria.map((criteria: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-sm text-foreground leading-relaxed">{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Start Application Button - Show when grant details are loaded */}
          {grantDetails && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Ready to Start Your Application?</span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    You've explored the grant details. Now let's prepare your application with a comprehensive checklist to ensure you have everything needed.
                  </p>
                  <Button 
                    onClick={handleStartApplication}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Rocket className="h-4 w-4 mr-2" />
                    Start Application with This Grant
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Exploring Grant Details</h3>
                  <p className="text-muted-foreground mb-4">{loadingStep}</p>
                  <div className="space-y-2">
                    <Progress value={loadingProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground">{loadingProgress}% complete</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    This may take 15-20 seconds as we analyze the grant website...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Details State */}
          {!grantDetails && !isLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Explore</h3>
                  <p className="text-muted-foreground mb-4">
                    Click "Explore in Detail" to get comprehensive information about this grant opportunity.
                  </p>
                  {!grant.detailsUrl && (
                    <p className="text-sm text-muted-foreground">
                      This grant doesn't have a details URL available for exploration.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
