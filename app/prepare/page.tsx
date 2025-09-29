"use client"

import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock,
  Target,
  Award,
  Phone,
  ExternalLink,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { createApplication } from "@/lib/storage"

interface PreparationItem {
  id: string
  title: string
  description: string
  category: 'documents' | 'research' | 'planning' | 'writing'
  completed: boolean
  required: boolean
}

export default function PreparePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [grantInfo, setGrantInfo] = useState<any>(null)
  const [grantDetails, setGrantDetails] = useState<any>(null)
  const [preparationItems, setPreparationItems] = useState<PreparationItem[]>([])
  const [isCreatingApplication, setIsCreatingApplication] = useState(false)

  useEffect(() => {
    // Parse grant information from URL params
    const grantId = searchParams.get('grantId')
    const oppNumber = searchParams.get('oppNumber')
    const title = searchParams.get('title')
    const agency = searchParams.get('agency')
    const matchPercentage = searchParams.get('matchPercentage')
    const grantDetailsParam = searchParams.get('grantDetails')

    if (grantId && oppNumber && title && agency) {
      setGrantInfo({
        id: grantId,
        oppNumber,
        title,
        agency,
        matchPercentage: matchPercentage ? parseInt(matchPercentage) : 0
      })

      if (grantDetailsParam) {
        try {
          const parsedDetails = JSON.parse(grantDetailsParam)
          setGrantDetails(parsedDetails)
          generatePreparationChecklist(parsedDetails)
        } catch (error) {
          console.error('Error parsing grant details:', error)
          generateMockPreparationChecklist()
        }
      } else {
        generateMockPreparationChecklist()
      }
    } else {
      // If no grant info, redirect to grants page
      router.push('/grants')
    }
  }, [searchParams, router])

  const generatePreparationChecklist = (details: any) => {
    const items: PreparationItem[] = [
      // Document Requirements
      ...(details.requirements || []).map((req: string, index: number) => ({
        id: `doc-${index}`,
        title: `Prepare ${req}`,
        description: `Gather and prepare the required document: ${req}`,
        category: 'documents' as const,
        completed: false,
        required: true
      })),
      
      // Research Items
      {
        id: 'research-1',
        title: 'Research Granting Agency',
        description: `Learn about ${grantInfo?.agency}'s priorities, past funded projects, and evaluation criteria`,
        category: 'research' as const,
        completed: false,
        required: true
      },
      {
        id: 'research-2',
        title: 'Study Similar Funded Projects',
        description: 'Research previously funded projects to understand what works',
        category: 'research' as const,
        completed: false,
        required: true
      },
      {
        id: 'research-3',
        title: 'Contact Program Officer',
        description: 'Reach out to discuss your project idea and get feedback',
        category: 'research' as const,
        completed: false,
        required: false
      },

      // Planning Items
      {
        id: 'planning-1',
        title: 'Define Project Objectives',
        description: 'Clearly articulate what you want to achieve with this grant',
        category: 'planning' as const,
        completed: false,
        required: true
      },
      {
        id: 'planning-2',
        title: 'Develop Project Timeline',
        description: 'Create a realistic timeline for project implementation',
        category: 'planning' as const,
        completed: false,
        required: true
      },
      {
        id: 'planning-3',
        title: 'Prepare Budget Breakdown',
        description: 'Detail all project costs and justify each expense',
        category: 'planning' as const,
        completed: false,
        required: true
      },
      {
        id: 'planning-4',
        title: 'Identify Key Personnel',
        description: 'List team members and their qualifications for this project',
        category: 'planning' as const,
        completed: false,
        required: true
      },

      // Writing Items
      {
        id: 'writing-1',
        title: 'Draft Project Narrative',
        description: 'Write compelling project description and methodology',
        category: 'writing' as const,
        completed: false,
        required: true
      },
      {
        id: 'writing-2',
        title: 'Prepare Executive Summary',
        description: 'Create a concise overview of your project and its impact',
        category: 'writing' as const,
        completed: false,
        required: true
      },
      {
        id: 'writing-3',
        title: 'Review and Edit Application',
        description: 'Proofread and refine all written components',
        category: 'writing' as const,
        completed: false,
        required: true
      }
    ]

    setPreparationItems(items)
  }

  const generateMockPreparationChecklist = () => {
    const items: PreparationItem[] = [
      // Document Requirements
      {
        id: 'doc-1',
        title: 'Prepare Project Proposal',
        description: 'Draft a comprehensive project proposal outlining objectives and methodology',
        category: 'documents',
        completed: false,
        required: true
      },
      {
        id: 'doc-2',
        title: 'Gather Financial Statements',
        description: 'Collect audited financial statements and budget documentation',
        category: 'documents',
        completed: false,
        required: true
      },
      {
        id: 'doc-3',
        title: 'Prepare Organization Profile',
        description: 'Create detailed information about your organization and its mission',
        category: 'documents',
        completed: false,
        required: true
      },
      {
        id: 'doc-4',
        title: 'Collect Letters of Support',
        description: 'Gather letters from partners, stakeholders, and community members',
        category: 'documents',
        completed: false,
        required: true
      },
      
      // Research Items
      {
        id: 'research-1',
        title: 'Research Granting Agency',
        description: `Learn about ${grantInfo?.agency}'s priorities, past funded projects, and evaluation criteria`,
        category: 'research',
        completed: false,
        required: true
      },
      {
        id: 'research-2',
        title: 'Study Similar Funded Projects',
        description: 'Research previously funded projects to understand what works',
        category: 'research',
        completed: false,
        required: true
      },
      {
        id: 'research-3',
        title: 'Contact Program Officer',
        description: 'Reach out to discuss your project idea and get feedback',
        category: 'research',
        completed: false,
        required: false
      },

      // Planning Items
      {
        id: 'planning-1',
        title: 'Define Project Objectives',
        description: 'Clearly articulate what you want to achieve with this grant',
        category: 'planning',
        completed: false,
        required: true
      },
      {
        id: 'planning-2',
        title: 'Develop Project Timeline',
        description: 'Create a realistic timeline for project implementation',
        category: 'planning',
        completed: false,
        required: true
      },
      {
        id: 'planning-3',
        title: 'Prepare Budget Breakdown',
        description: 'Detail all project costs and justify each expense',
        category: 'planning',
        completed: false,
        required: true
      },
      {
        id: 'planning-4',
        title: 'Identify Key Personnel',
        description: 'List team members and their qualifications for this project',
        category: 'planning',
        completed: false,
        required: true
      },

      // Writing Items
      {
        id: 'writing-1',
        title: 'Draft Project Narrative',
        description: 'Write compelling project description and methodology',
        category: 'writing',
        completed: false,
        required: true
      },
      {
        id: 'writing-2',
        title: 'Prepare Executive Summary',
        description: 'Create a concise overview of your project and its impact',
        category: 'writing',
        completed: false,
        required: true
      },
      {
        id: 'writing-3',
        title: 'Review and Edit Application',
        description: 'Proofread and refine all written components',
        category: 'writing',
        completed: false,
        required: true
      }
    ]

    setPreparationItems(items)
  }

  const toggleItem = (itemId: string) => {
    setPreparationItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const getCompletedCount = () => {
    return preparationItems.filter(item => item.completed).length
  }

  const getRequiredCompletedCount = () => {
    return preparationItems.filter(item => item.completed && item.required).length
  }

  const getRequiredCount = () => {
    return preparationItems.filter(item => item.required).length
  }

  const getProgressPercentage = () => {
    if (preparationItems.length === 0) return 0
    return Math.round((getCompletedCount() / preparationItems.length) * 100)
  }

  const getRequiredProgressPercentage = () => {
    if (getRequiredCount() === 0) return 0
    return Math.round((getRequiredCompletedCount() / getRequiredCount()) * 100)
  }

  const handleStartApplication = async () => {
    setIsCreatingApplication(true)
    
    try {
      // Create application using localStorage (since that's what the app uses)
      const application = createApplication(grantInfo?.id || '')
      
      // Store preparation checklist in localStorage for reference
      localStorage.setItem(`preparation_${application.id}`, JSON.stringify({
        grantInfo,
        grantDetails,
        preparationItems,
        completedItems: preparationItems.filter(item => item.completed).length,
        totalItems: preparationItems.length
      }))
      
      toast({
        title: "Application Created",
        description: "Your grant application has been created with preparation checklist.",
      })
      
      router.push(`/applications/${application.id}/write`)
    } catch (error) {
      console.error('Error creating application:', error)
      toast({
        title: "Error",
        description: "Failed to create application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingApplication(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documents': return <FileText className="h-4 w-4" />
      case 'research': return <Target className="h-4 w-4" />
      case 'planning': return <Calendar className="h-4 w-4" />
      case 'writing': return <Award className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const canStartApplication = getRequiredProgressPercentage() >= 50

  if (!grantInfo) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium">Loading grant information...</h2>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Prepare Your Application</h1>
            <p className="text-muted-foreground mt-1">
              Get ready to apply for this grant opportunity
            </p>
          </div>
        </div>

        {/* Grant Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Grant Opportunity Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">{grantInfo.title}</h3>
                  <p className="text-sm text-muted-foreground">{grantInfo.agency}</p>
                  <p className="text-xs text-muted-foreground">Opportunity: {grantInfo.oppNumber}</p>
                </div>
                
                {grantInfo.matchPercentage > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {grantInfo.matchPercentage}% Match
                    </Badge>
                  </div>
                )}
              </div>

              {grantDetails && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Deadline</p>
                        <p className="text-muted-foreground">{grantDetails.deadline}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Funding</p>
                        <p className="text-muted-foreground">{grantDetails.fundingAmount}</p>
                      </div>
                    </div>
                  </div>
                  
                  {grantDetails.sourceUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={grantDetails.sourceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Original
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {grantDetails?.description && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{grantDetails.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preparation Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Preparation Checklist
              </span>
              <Badge variant="outline">
                {getCompletedCount()} / {preparationItems.length} Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{getProgressPercentage()}%</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Required Items</span>
                  <span className="text-sm text-muted-foreground">
                    {getRequiredCompletedCount()} / {getRequiredCount()} Complete
                  </span>
                </div>
                <Progress value={getRequiredProgressPercentage()} className="h-2" />
              </div>
            </div>

            <Separator />

            {/* Preparation Items */}
            <div className="space-y-4">
              {['documents', 'research', 'planning', 'writing'].map(category => {
                const categoryItems = preparationItems.filter(item => item.category === category)
                if (categoryItems.length === 0) return null

                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <h4 className="font-medium capitalize">{category} ({categoryItems.length})</h4>
                    </div>
                    
                    <div className="space-y-2 ml-6">
                      {categoryItems.map(item => (
                        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border">
                          <Checkbox
                            id={item.id}
                            checked={item.completed}
                            onCheckedChange={() => toggleItem(item.id)}
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <label 
                                htmlFor={item.id}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {item.title}
                              </label>
                              {item.required && (
                                <Badge variant="destructive" className="text-xs text-white">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Start Application Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {canStartApplication ? (
                <>
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Ready to Start Writing!</span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    You've completed enough preparation items to begin your application. 
                    You can always come back to complete more items later.
                  </p>
                  <Button 
                    onClick={handleStartApplication}
                    disabled={isCreatingApplication}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isCreatingApplication ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Creating Application...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Start Writing Application
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 text-yellow-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">More Preparation Needed</span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Complete at least 50% of the required preparation items before starting your application.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>Required Progress: {getRequiredProgressPercentage()}%</span>
                    <span>•</span>
                    <span>Target: 50%</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
