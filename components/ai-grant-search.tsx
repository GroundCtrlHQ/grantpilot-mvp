"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Search, Brain, ExternalLink, Calendar, DollarSign, Building, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { isGrantSaved, saveGrant, unsaveGrant } from "@/lib/storage"
import { cn } from "@/lib/utils"
import { ExploreGrantModal } from "@/components/explore-grant-modal"

interface FoundGrant {
  opp_number: string
  title: string
  agency: string
  description: string
  eligibility: string
  funding_amount: string
  deadline: string
  categories: string[]
  source: string
  grant_url?: string
}

interface AIGrantSearchProps {
  onGrantsFound?: (grants: FoundGrant[]) => void
}

export function AIGrantSearch({ onGrantsFound }: AIGrantSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [focusAreas, setFocusAreas] = useState("")
  const [organizationType, setOrganizationType] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [foundGrants, setFoundGrants] = useState<FoundGrant[]>([])
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [loadingStages, setLoadingStages] = useState<LoadingStage[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [totalPages, setTotalPages] = useState(1)
  const [savedGrants, setSavedGrants] = useState<Set<string>>(new Set())
  const [showExploreModal, setShowExploreModal] = useState(false)
  const [selectedGrant, setSelectedGrant] = useState<FoundGrant | null>(null)
  const { toast } = useToast()

  interface LoadingStage {
    stage: string
    message: string
    completed: boolean
  }

  // Calculate current page grants
  const currentPageGrants = foundGrants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setTotalPages(Math.ceil(foundGrants.length / itemsPerPage))
    setCurrentPage(1) // Reset to first page when new search results arrive

    // Update saved state for all grants
    const updateSavedState = async () => {
      const savedSet = new Set<string>()
      for (const grant of foundGrants) {
        try {
          if (await isGrantSaved(grant.opp_number)) {
            savedSet.add(grant.opp_number)
          }
        } catch (error) {
          console.error("Error checking if grant is saved:", error)
        }
      }
      setSavedGrants(savedSet)
    }

    if (foundGrants.length > 0) {
      updateSavedState()
    }
  }, [foundGrants, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveToggle = async (grantOppNumber: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (savedGrants.has(grantOppNumber)) {
        // Find the grant by opp_number and get its ID
        const grant = foundGrants.find(g => g.opp_number === grantOppNumber)
        if (grant) {
          await unsaveGrant(grant.opp_number)
          setSavedGrants(prev => {
            const newSet = new Set(prev)
            newSet.delete(grantOppNumber)
            return newSet
          })
          toast({
            title: "Grant removed",
            description: "Grant removed from your saved list.",
          })
        }
      } else {
        // Find the grant by opp_number and get its ID
        const grant = foundGrants.find(g => g.opp_number === grantOppNumber)
        if (grant) {
          await saveGrant(grant.opp_number)
          setSavedGrants(prev => new Set(prev).add(grantOppNumber))
          toast({
            title: "Grant saved",
            description: "Grant added to your saved list.",
          })
        }
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter what type of grants you're looking for.",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    setFoundGrants([])
    setSearchPerformed(false)

    const stages: LoadingStage[] = [
      { stage: "analyzing", message: "Analyzing your search criteria...", completed: false },
      { stage: "searching", message: "Searching federal grant databases...", completed: false },
      { stage: "filtering", message: "Filtering relevant opportunities...", completed: false },
      { stage: "parsing", message: "Extracting grant details and links...", completed: false },
      { stage: "complete", message: "Search complete!", completed: false },
    ]
    setLoadingStages(stages)

    try {
      for (let i = 0; i < stages.length - 1; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        setLoadingStages((prev) => prev.map((stage, index) => (index === i ? { ...stage, completed: true } : stage)))
      }

      const response = await fetch("/api/search-grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          focusAreas: focusAreas
            .split(",")
            .map((area) => area.trim())
            .filter(Boolean),
          organizationType: organizationType || "nonprofit organization",
        }),
      })

      const result = await response.json()

      setLoadingStages((prev) =>
        prev.map((stage, index) => (index === stages.length - 1 ? { ...stage, completed: true } : stage)),
      )

      if (!response.ok || !result.success) {
        setSearchPerformed(true)

        let errorMessage = "Failed to search for grants. Please try again."
        let errorDetails = ""

        if (result.error) {
          if (result.error.includes("Perplexity API key not configured")) {
            errorMessage = "AI search service not configured"
            errorDetails = "The Perplexity API integration needs to be set up. Please contact support."
          } else if (result.error.includes("Perplexity API failed")) {
            errorMessage = "AI search service unavailable"
            errorDetails =
              "The AI grant search service is currently unavailable. Please try the manual grants.gov search instead."
          } else if (result.error.includes("No grants found in AI response")) {
            errorMessage = "No matching grants found"
            errorDetails =
              "The AI couldn't find any grants matching your criteria. Try broader search terms or check back later."
          } else {
            errorMessage = result.error
            errorDetails = result.details || ""
          }
        }

        toast({
          title: errorMessage,
          description: errorDetails,
          variant: "destructive",
        })
        return
      }

      setFoundGrants(result.grants)
      setSearchPerformed(true)
      onGrantsFound?.(result.grants)

      toast({
        title: "Search complete!",
        description: result.message,
      })
    } catch (error) {
      console.error("Search error:", error)
      setSearchPerformed(true)

      toast({
        title: "Network error",
        description: "Unable to connect to the search service. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
      setLoadingStages([])
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Grant Discovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">What are you looking for?</label>
              <Textarea
                placeholder="e.g., STEM education programs for underserved communities, environmental justice initiatives, healthcare innovation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Focus Areas (optional)</label>
                <Input
                  placeholder="e.g., education, environment, health"
                  value={focusAreas}
                  onChange={(e) => setFocusAreas(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Organization Type (optional)</label>
                <Input
                  placeholder="e.g., nonprofit, university, community organization"
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} className="w-full">
              {isSearching ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Searching latest opportunities...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Find Relevant Grants
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isSearching && loadingStages.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 animate-pulse text-blue-600" />
                <span className="font-medium">AI Grant Discovery in Progress</span>
              </div>

              <div className="space-y-3">
                {loadingStages.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        stage.completed
                          ? "bg-green-500 border-green-500"
                          : index === loadingStages.findIndex((s) => !s.completed)
                            ? "border-blue-500 animate-pulse"
                            : "border-gray-300"
                      }`}
                    >
                      {stage.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span
                      className={`text-sm ${stage.completed ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                    >
                      {stage.message}
                    </span>
                  </div>
                ))}
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(loadingStages.filter((s) => s.completed).length / loadingStages.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchPerformed && (
        <Card>
          <CardHeader>
            <CardTitle>
              {foundGrants.length > 0
                ? `Found ${foundGrants.length} Relevant Grants${totalPages > 1 ? ` (Page ${currentPage} of ${totalPages})` : ''}`
                : "No Grants Found"
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPageGrants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No grants match your search criteria</p>
                <p className="text-sm">Try adjusting your search terms or focus areas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPageGrants.map((grant, index) => (
                  <div
                    key={`${grant.opp_number}-${index}`}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{grant.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Building className="h-4 w-4" />
                            <span>{grant.agency}</span>
                            {grant.opp_number && (
                              <>
                                <span>•</span>
                                <span>{grant.opp_number}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge variant="secondary" className="text-xs">
                            {grant.source}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 p-1 h-8 w-8"
                            onClick={(e) => handleSaveToggle(grant.opp_number, e)}
                          >
                            <Heart
                              className={cn(
                                "h-4 w-4 transition-colors",
                                savedGrants.has(grant.opp_number) ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500",
                              )}
                            />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">{grant.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {grant.categories.map((category) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                        {grant.funding_amount && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Funding:</span>
                            <span>{grant.funding_amount}</span>
                          </div>
                        )}

                        {grant.deadline && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">Deadline:</span>
                            <span>{formatDate(grant.deadline)}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {grant.grant_url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-transparent"
                              onClick={() => window.open(grant.grant_url, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Source
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-transparent"
                              onClick={() =>
                                window.open(`https://grants.gov/search-results-detail/${grant.opp_number}`, "_blank")
                              }
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Source
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-transparent"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedGrant(grant)
                              setShowExploreModal(true)
                            }}
                          >
                            <Search className="h-3 w-3 mr-1" />
                            Explore in Detail
                          </Button>
                        </div>
                      </div>

                      {grant.eligibility && (
                        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                          <strong>Eligibility:</strong> {grant.eligibility}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination for AI Search Results */}
            {foundGrants.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, foundGrants.length)} of {foundGrants.length} grants
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber
                      if (totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i
                      } else {
                        pageNumber = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          className="min-w-[2.5rem]"
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Explore Grant Modal */}
      {selectedGrant && (
        <ExploreGrantModal
          isOpen={showExploreModal}
          onClose={() => {
            setShowExploreModal(false)
            setSelectedGrant(null)
          }}
          grant={{
            id: selectedGrant.opp_number,
            opportunityNumber: selectedGrant.opp_number,
            title: selectedGrant.title,
            agency: selectedGrant.agency,
            description: selectedGrant.description,
            closeDate: selectedGrant.deadline,
            awardCeiling: null,
            awardFloor: null,
            fundingAmount: selectedGrant.funding_amount,
            postedDate: new Date().toISOString(),
            category: "AI Search Result",
            status: "Open",
            detailsUrl: selectedGrant.grant_url || `https://grants.gov/search-results-detail/${selectedGrant.opp_number}`
          }}
          userProfile={{
            focusAreas: focusAreas.split(',').map(area => area.trim()).filter(Boolean),
            organizationType,
            organizationSize: "small"
          }}
        />
      )}
    </div>
  )
}
