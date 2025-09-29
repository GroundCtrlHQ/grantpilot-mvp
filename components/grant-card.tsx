"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import type { Grant } from "@/lib/storage"
import { isGrantSaved, saveGrant, unsaveGrant } from "@/lib/storage"
import { getDeadlineUrgency, getDeadlineText } from "@/lib/date-utils"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ExploreGrantModal } from "@/components/explore-grant-modal"
import { Search } from "lucide-react"

interface GrantCardProps {
  grant: Grant
  userProfile?: {
    focusAreas?: string[]
    organizationType?: string
    organizationSize?: string
  }
}

export function GrantCard({ grant, userProfile }: GrantCardProps) {
  const [saved, setSaved] = useState(false)
  const [showExploreModal, setShowExploreModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkSaved = async () => {
      try {
        const saved = await isGrantSaved(grant.opportunityNumber)
        setSaved(saved)
      } catch (error) {
        console.error("Error checking if grant is saved:", error)
      }
    }
    checkSaved()
  }, [grant.opportunityNumber])

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (saved) {
        await unsaveGrant(grant.opportunityNumber)
        setSaved(false)
        toast({
          title: "Grant removed",
          description: "Grant removed from your saved list.",
        })
      } else {
        await saveGrant(grant.opportunityNumber, "", {
          title: grant.title,
          agency: grant.agency,
          description: grant.description,
          closeDate: grant.closeDate,
          awardCeiling: grant.awardCeiling,
          detailsUrl: grant.detailsUrl
        })
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

  const urgency = getDeadlineUrgency(grant.closeDate)
  const deadlineText = getDeadlineText(grant.closeDate)

  const urgencyVariant = urgency === "urgent" ? "urgent" : urgency === "warning" ? "warning" : "success"

  return (
    <>
      <Link href={`/grants/${grant.opportunityNumber}`}>
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {grant.title}
            </h3>
            <Button variant="ghost" size="sm" className="shrink-0 p-1 h-8 w-8" onClick={handleSaveToggle}>
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  saved ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500",
                )}
              />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{grant.agency}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={urgencyVariant} className="text-xs">
              {deadlineText}
            </Badge>
            {grant.awardFloor && grant.awardCeiling && (
              <Badge variant="outline" className="text-xs">
                ${(grant.awardFloor / 1000).toFixed(0)}K - ${(grant.awardCeiling / 1000).toFixed(0)}K
              </Badge>
            )}
            {grant.category && (
              <Badge variant="secondary" className="text-xs">
                {grant.category}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">{grant.description}</p>
          
          {/* Explore Button */}
          {grant.detailsUrl && grant.detailsUrl !== `#grant-${grant.id}` && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowExploreModal(true)
              }}
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              Explore in Detail
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
    
    {/* Explore Modal */}
    <ExploreGrantModal
      isOpen={showExploreModal}
      onClose={() => setShowExploreModal(false)}
      grant={grant}
      userProfile={userProfile}
    />
  </>
  )
}
