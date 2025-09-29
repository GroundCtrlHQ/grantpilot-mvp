"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ExternalLink, FileText, Search, CheckCircle, AlertCircle, Info } from "lucide-react"
import { getGrants, isGrantSaved, saveGrant, unsaveGrant, createApplication } from "@/lib/storage"
import type { Grant } from "@/lib/storage"
import { getDeadlineUrgency, getDeadlineText, formatDate } from "@/lib/date-utils"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function GrantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [grant, setGrant] = useState<Grant | null>(null)
  const [saved, setSaved] = useState(false)
  const [isResearching, setIsResearching] = useState(false)
  const [researchData, setResearchData] = useState<any>(null)
  const [isScraping, setIsScraping] = useState(false)
  const [scrapedDetails, setScrapedDetails] = useState<any>(null)

  useEffect(() => {
    const initializeGrant = async () => {
      try {
        // Load grants from database API
        const response = await fetch('/api/grants/database?query=&limit=100')
        if (response.ok) {
          const data = await response.json()
          const grants = data.grants || []
          const foundGrant = grants.find((g: Grant) => g.opportunityNumber === params.oppNumber)

          if (foundGrant) {
            setGrant(foundGrant)
            try {
              const saved = await isGrantSaved(foundGrant.id)
              setSaved(saved)
            } catch (error) {
              console.error("Error checking if grant is saved:", error)
            }
          }
        } else {
          // Fallback to localStorage if API fails
          const grants = getGrants()
          const foundGrant = grants.find((g) => g.opportunityNumber === params.oppNumber)
          if (foundGrant) {
            setGrant(foundGrant)
            try {
              const saved = await isGrantSaved(foundGrant.id)
              setSaved(saved)
            } catch (error) {
              console.error("Error checking if grant is saved:", error)
            }
          }
        }
      } catch (error) {
        console.error("Error loading grants:", error)
        // Fallback to localStorage
        const grants = getGrants()
        const foundGrant = grants.find((g) => g.opportunityNumber === params.oppNumber)
        if (foundGrant) {
          setGrant(foundGrant)
          try {
            const saved = await isGrantSaved(foundGrant.id)
            setSaved(saved)
          } catch (error) {
            console.error("Error checking if grant is saved:", error)
          }
        }
      }
    }

    initializeGrant()
  }, [params.oppNumber])

  const handleSaveToggle = async () => {
    if (!grant) return

    try {
      if (saved) {
        await unsaveGrant(grant.id)
        setSaved(false)
        toast({
          title: "Grant removed",
          description: "Grant removed from your saved list.",
        })
      } else {
        await saveGrant(grant.id)
        setSaved(true)
        toast({
          title: "Grant saved",
          description: "Grant added to your saved list.",
        })
      }
    } catch (error) {
      console.error("Error saving grant:", error)
      toast({
        title: "Error",
        description: "Failed to save grant. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleScrapeGrantDetails = async () => {
    if (!grant?.detailsUrl) return;

    setIsScraping(true);

    try {
      const scrapeResponse = await fetch('/api/scrape-grant-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grantUrl: grant.detailsUrl,
          opportunityNumber: grant.opportunityNumber
        })
      });

      if (scrapeResponse.ok) {
        const scrapeResult = await scrapeResponse.json();
        setScrapedDetails(scrapeResult.grantDetails);

        toast({
          title: "Grant details scraped",
          description: "Latest information has been retrieved from the grant website.",
        });
      } else {
        console.error("Scraping failed");
        toast({
          title: "Scraping failed",
          description: "Unable to retrieve additional grant details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error scraping grant details:", error);
      toast({
        title: "Scraping failed",
        description: "Unable to retrieve additional grant details.",
        variant: "destructive",
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleStartApplication = async () => {
    if (!grant) return

    setIsResearching(true)
    
    try {
      // First, conduct research about the grant
      const researchResponse = await fetch('/api/grant-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grantTitle: grant.title,
          grantAgency: grant.agency,
          grantDescription: grant.description,
          opportunityNumber: grant.opportunityNumber
        })
      })

      if (researchResponse.ok) {
        const researchResult = await researchResponse.json()
        setResearchData(researchResult.research)
        
        toast({
          title: "Research completed",
          description: "Grant information has been gathered to help with your application.",
        })
      } else {
        console.error("Research failed, proceeding without research data")
      }
    } catch (error) {
      console.error("Error conducting research:", error)
      toast({
        title: "Research failed",
        description: "Proceeding without research data.",
        variant: "destructive",
      })
    } finally {
      setIsResearching(false)
      
      // Create application and redirect
      const application = createApplication(grant.id)
      toast({
        title: "Application started",
        description: "Your application draft has been created with research insights.",
      })
      router.push(`/applications/${application.id}/write`)
    }
  }

  if (!grant) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">Grant not found</h3>
          <p className="text-muted-foreground mb-4">
            The grant you're looking for doesn't exist or hasn't been loaded yet.
          </p>
          <Button onClick={() => router.push("/grants")}>Back to Grants</Button>
        </div>
      </DashboardLayout>
    )
  }

  const urgency = getDeadlineUrgency(grant.closeDate)
  const deadlineText = getDeadlineText(grant.closeDate)
  const urgencyVariant = urgency === "urgent" ? "urgent" : urgency === "warning" ? "warning" : "success"

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-foreground text-balance">{grant.title}</h1>
              <p className="text-lg text-muted-foreground mt-2">{grant.agency}</p>
            </div>
            <div className="flex gap-2">
              <Button variant={saved ? "default" : "outline"} onClick={handleSaveToggle} className="shrink-0">
                <Heart className={cn("h-4 w-4 mr-2", saved ? "fill-current" : "")} />
                {saved ? "Saved" : "Save Grant"}
              </Button>
              {grant.detailsUrl && (
                <Button 
                  onClick={handleScrapeGrantDetails} 
                  disabled={isScraping}
                  variant="outline"
                  className="shrink-0"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isScraping ? "Scraping..." : "Get Latest Details"}
                </Button>
              )}
              <Button 
                onClick={handleStartApplication} 
                disabled={isResearching}
                className="shrink-0"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isResearching ? "Researching Grant..." : "Start Application"}
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={urgencyVariant}>{deadlineText}</Badge>
            {grant.awardFloor && grant.awardCeiling && (
              <Badge variant="outline">
                ${(grant.awardFloor / 1000).toFixed(0)}K - ${(grant.awardCeiling / 1000).toFixed(0)}K
              </Badge>
            )}
            {grant.category && <Badge variant="secondary">{grant.category}</Badge>}
          </div>
        </div>

        {/* Details */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-1">Opportunity Number</h3>
                  <p className="text-muted-foreground">{grant.opportunityNumber}</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Posted Date</h3>
                  <p className="text-muted-foreground">{formatDate(grant.postedDate)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Close Date</h3>
                  <p className="text-muted-foreground">{formatDate(grant.closeDate)}</p>
                </div>
              </div>
              <div className="space-y-4">
                {grant.awardFloor && grant.awardCeiling && (
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Award Range</h3>
                    <p className="text-muted-foreground">
                      ${grant.awardFloor.toLocaleString()} - ${grant.awardCeiling.toLocaleString()}
                    </p>
                  </div>
                )}
                {grant.category && (
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Category</h3>
                    <p className="text-muted-foreground">{grant.category}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-foreground mb-1">Agency</h3>
                  <p className="text-muted-foreground">{grant.agency}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{grant.description}</p>
            </div>

            <div className="pt-4 border-t border-border">
              <Button variant="outline" asChild>
                <a href={grant.detailsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Grants.gov
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Research Results Section */}
        {researchData && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Grant Research Insights</h3>
                <Badge variant="secondary">AI-Powered Research</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Eligibility Requirements */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Eligibility Requirements
                  </h4>
                  <ul className="space-y-1">
                    {researchData.researchData.eligibilityRequirements.map((req: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Application Process */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    Application Process
                  </h4>
                  <ul className="space-y-1">
                    {researchData.researchData.applicationProcess.map((step: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">{index + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Required Documents */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    Required Documents
                  </h4>
                  <ul className="space-y-1">
                    {researchData.researchData.requiredDocuments.map((doc: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Application Tips */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Application Tips
                  </h4>
                  <ul className="space-y-1">
                    {researchData.researchData.applicationTips.map((tip: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contact Information */}
              {researchData.researchData.contactInfo && (
                <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Contact Information</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Program Manager:</strong> {researchData.researchData.contactInfo.programManager}</p>
                    <p><strong>Email:</strong> {researchData.researchData.contactInfo.email}</p>
                    <p><strong>Phone:</strong> {researchData.researchData.contactInfo.phone}</p>
                    <p><strong>Office Hours:</strong> {researchData.researchData.contactInfo.officeHours}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Scraped Grant Details */}
        {scrapedDetails && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Latest Grant Details</h3>
                <Badge variant="secondary">Live Data</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    Grant Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Title:</strong> {scrapedDetails.title}</p>
                    <p><strong>Agency:</strong> {scrapedDetails.agency}</p>
                    <p><strong>Opportunity Number:</strong> {scrapedDetails.opportunityNumber}</p>
                    <p><strong>Deadline:</strong> {scrapedDetails.deadline}</p>
                    <p><strong>Funding Amount:</strong> {scrapedDetails.fundingAmount}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    Description
                  </h4>
                  <p className="text-sm text-muted-foreground">{scrapedDetails.description}</p>
                </div>

                {/* Eligibility Requirements */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Eligibility Requirements
                  </h4>
                  <ul className="space-y-1">
                    {scrapedDetails.eligibility.map((req: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Required Documents */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    Required Documents
                  </h4>
                  <ul className="space-y-1">
                    {scrapedDetails.requirements.map((doc: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Source Information */}
              <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Source Information</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Source URL:</strong> <a href={scrapedDetails.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{scrapedDetails.sourceUrl}</a></p>
                  <p><strong>Scraped At:</strong> {new Date(scrapedDetails.scrapedAt).toLocaleString()}</p>
                  <p><strong>Status:</strong> {scrapedDetails.scraped ? "Successfully scraped" : "Fallback data"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
