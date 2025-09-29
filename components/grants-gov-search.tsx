"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink, Calendar, DollarSign, Building, Globe, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { isGrantSaved, saveGrant, unsaveGrant } from "@/lib/storage"
import { cn } from "@/lib/utils"
import type { Grant } from "@/lib/storage"
import { ExploreGrantModal } from "@/components/explore-grant-modal"

interface GrantsGovSearchProps {
  onGrantsFound?: (grants: Grant[]) => void
}

export function GrantsGovSearch({ onGrantsFound }: GrantsGovSearchProps) {
  const [searchQuery, setSearchQuery] = useState("artificial intelligence")
  const [isSearching, setIsSearching] = useState(false)
  const [foundGrants, setFoundGrants] = useState<Grant[]>([])
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [loadingStages, setLoadingStages] = useState<LoadingStage[]>([])
  const [searchProgress, setSearchProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [totalPages, setTotalPages] = useState(1)
  const [savedGrants, setSavedGrants] = useState<Set<string>>(new Set())
  const [showExploreModal, setShowExploreModal] = useState(false)
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)
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
          if (await isGrantSaved(grant.id)) {
            savedSet.add(grant.id)
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

  const handleSaveToggle = async (grantId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (savedGrants.has(grantId)) {
        await unsaveGrant(grantId)
        setSavedGrants(prev => {
          const newSet = new Set(prev)
          newSet.delete(grantId)
          return newSet
        })
        toast({
          title: "Grant removed",
          description: "Grant removed from your saved list.",
        })
      } else {
        await saveGrant(grantId)
        setSavedGrants(prev => new Set(prev).add(grantId))
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter keywords to search for grants.",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    setFoundGrants([])
    setSearchPerformed(false)
    setSearchProgress(0)

    const stages: LoadingStage[] = [
      { stage: "analyzing", message: "Analyzing your search criteria...", completed: false },
      { stage: "searching", message: "Searching federal grant databases...", completed: false },
      { stage: "parsing", message: "Extracting grant details and links...", completed: false },
      { stage: "organizing", message: "Organizing results...", completed: false },
      { stage: "complete", message: "Search complete!", completed: false },
    ]
    setLoadingStages(stages)

    try {
      // Progressive loading with visual feedback
      for (let i = 0; i < stages.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 600))
        setLoadingStages((prev) => prev.map((stage, index) => (index === i ? { ...stage, completed: true } : stage)))
        setSearchProgress(((i + 1) / stages.length) * 100)
      }

      const response = await fetch(`/api/grants/search?query=${encodeURIComponent(searchQuery)}&limit=50&pages=3`)
      const result = await response.json()

      if (result.success) {
        setFoundGrants(result.grants)
        setSearchPerformed(true)
        onGrantsFound?.(result.grants)

        toast({
          title: "Search complete!",
          description: `Found ${result.grants.length} grants from ${result.source}`,
        })
      } else {
        throw new Error(result.error || "Search failed")
      }
    } catch (error) {
      console.error("[v0] Search error:", error)
      toast({
        title: "Search failed",
        description: "Failed to search grants.gov. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
      setLoadingStages([])
      setSearchProgress(0)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Not specified"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const getDaysUntilDeadline = (closeDate: string) => {
    try {
      const deadline = new Date(closeDate)
      const now = new Date()
      const diffTime = deadline.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Search Grants.gov
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., artificial intelligence, STEM education, environmental justice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isSearching && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-pulse" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Search the official grants.gov database for federal funding opportunities.</p>
          </div>
        </CardContent>
      </Card>

      {/* Loading Progress */}
      {isSearching && loadingStages.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 animate-pulse text-blue-600" />
                <span className="font-medium">Searching Grants.gov</span>
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
                    width: `${searchProgress}%`,
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
                ? `Found ${foundGrants.length} Grants${totalPages > 1 ? ` (Page ${currentPage} of ${totalPages})` : ''}`
                : "No Grants Found"
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPageGrants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No grants match your search</p>
                <p className="text-sm">Try different keywords or check back later for new opportunities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPageGrants.map((grant) => {
                  const daysLeft = getDaysUntilDeadline(grant.closeDate)
                  const isUrgent = daysLeft !== null && daysLeft <= 7
                  const isWarning = daysLeft !== null && daysLeft <= 30 && daysLeft > 7

                  return (
                    <div key={grant.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{grant.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Building className="h-4 w-4" />
                              <span>{grant.agency}</span>
                              <span>•</span>
                              <span>{grant.opportunityNumber}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant="secondary" className="text-xs">
                              grants.gov
                            </Badge>
                            {isUrgent && (
                              <Badge variant="destructive" className="text-xs text-white">
                                Urgent
                              </Badge>
                            )}
                            {isWarning && (
                              <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                                Soon
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="shrink-0 p-1 h-8 w-8"
                              onClick={(e) => handleSaveToggle(grant.id, e)}
                            >
                              <Heart
                                className={cn(
                                  "h-4 w-4 transition-colors",
                                  savedGrants.has(grant.id) ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500",
                                )}
                              />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">{grant.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Funding:</span>
                            <span>
                              {grant.awardFloor && grant.awardCeiling
                                ? `${formatCurrency(grant.awardFloor)} - ${formatCurrency(grant.awardCeiling)}`
                                : grant.awardCeiling
                                  ? `Up to ${formatCurrency(grant.awardCeiling)}`
                                  : "Amount varies"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">Deadline:</span>
                            <span>{formatDate(grant.closeDate)}</span>
                            {daysLeft !== null && (
                              <span
                                className={`text-xs ${isUrgent ? "text-red-600" : isWarning ? "text-orange-600" : "text-muted-foreground"}`}
                              >
                                ({daysLeft} days)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-transparent"
                              onClick={() => window.open(grant.detailsUrl, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Source
                            </Button>
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
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination for Search Results */}
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
          grant={selectedGrant}
          userProfile={{
            focusAreas: ["technology", "education"],
            organizationType: "nonprofit",
            organizationSize: "small"
          }}
        />
      )}
    </div>
  )
}
