"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UpgradeModal } from "@/components/upgrade-modal"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Crown, Sparkles, Lock, Heart, Calendar, DollarSign, Building } from "lucide-react"
import { getUser, getGrants, isUserPro } from "@/lib/storage"
import { fetchGrantsFromRSS } from "@/lib/grants-api"
import type { Grant } from "@/lib/storage"
import Link from "next/link"

export function OnboardingSuccess() {
  const [matchingGrants, setMatchingGrants] = useState<Grant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPro, setIsPro] = useState(isUserPro())
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    const loadMatchingGrants = async () => {
      try {
        const user = getUser()

        // Load grants if not already loaded
        let grants = getGrants()
        if (grants.length === 0) {
          grants = await fetchGrantsFromRSS()
        }

        // Filter grants based on user's focus areas
        const userFocusAreas = user?.focusAreas || []
        const matched = grants
          .filter((grant) => {
            // Simple matching based on category and description
            const grantText = `${grant.category} ${grant.description} ${grant.title}`.toLowerCase()
            return userFocusAreas.some(
              (area) =>
                grantText.includes(area.toLowerCase().split(" ")[0]) ||
                grantText.includes(area.toLowerCase().split(" ")[1]) ||
                grantText.includes(area.toLowerCase()),
            )
          })
          .slice(0, 6) // Show top 6 matches

        setMatchingGrants(matched)
      } catch (error) {
        console.error("Error loading grants:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMatchingGrants()
  }, []) // Removed user dependency to prevent infinite loop

  const handleUpgradeComplete = () => {
    setIsPro(true)
    // Force re-render to show Pro features
    window.location.reload()
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Finding perfect grants for you...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const user = getUser()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold text-foreground">Perfect Matches Found!</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-4">
            Based on your profile, we found {matchingGrants.length} grants that match your focus areas
          </p>
          <Badge variant="secondary" className="mb-6">
            {user?.focusAreas?.join(", ")} • {user?.organizationType}
          </Badge>
        </div>

        {/* Pro Upgrade Banner for Free Users */}
        {!isPro && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Unlock Full Grant Details</h3>
                    <p className="text-muted-foreground">
                      Get full access to grant details, save grants, track applications, and AI-powered writing assistance.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard">Continue with Free</Link>
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80" onClick={() => setShowUpgradeModal(true)}>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro - $29/month
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Matching Grants Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Recommended Grants
            </CardTitle>
            <p className="text-muted-foreground">
              {isPro 
                ? "Grants that match your organization's focus areas" 
                : "Preview grants that match your profile (upgrade to Pro for full details)"
              }
            </p>
          </CardHeader>
          <CardContent>
            {matchingGrants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchingGrants.map((grant) => (
                  <Card key={grant.id} className={`relative ${!isPro ? 'opacity-75' : ''}`}>
                    {!isPro && (
                      <div className="absolute top-3 right-3 z-10">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className={`font-medium text-sm leading-tight ${!isPro ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {isPro ? grant.title : `${grant.title.substring(0, 60)}...`}
                        </h3>
                        <Button variant="ghost" size="sm" className="ml-2 p-1 h-auto" disabled={!isPro}>
                          <Heart className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {isPro ? grant.agency : "Agency details available with Pro"}
                      </p>
                      <div className="space-y-2 mb-3">
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {isPro ? `Closes ${new Date(grant.closeDate).toLocaleDateString()}` : "Deadline: Pro only"}
                        </Badge>
                        {grant.awardCeiling && grant.awardFloor && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {isPro
                              ? `$${(grant.awardFloor / 1000).toFixed(0)}K - $${(grant.awardCeiling / 1000).toFixed(0)}K`
                              : "Award range: Pro only"}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs mb-4 line-clamp-2 ${!isPro ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                        {isPro ? grant.description : "Full description and details available with Pro subscription..."}
                      </p>
                      <div className="flex gap-2">
                        {isPro ? (
                          <Button asChild size="sm" className="flex-1">
                            <Link href={`/grants/${grant.opportunityNumber}`}>View Details</Link>
                          </Button>
                        ) : (
                          <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-primary/80" onClick={() => setShowUpgradeModal(true)}>
                            <Crown className="w-3 h-3 mr-1" />
                            Upgrade for Details
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">No matching grants found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We couldn't find grants that match your current focus areas. Try expanding your search criteria.
                </p>
                <Button asChild>
                  <Link href="/grants">Search All Grants</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeComplete={handleUpgradeComplete}
      />
    </DashboardLayout>
  )
}
