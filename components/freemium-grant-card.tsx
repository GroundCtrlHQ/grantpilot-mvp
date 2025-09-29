"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Lock, Crown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Grant } from "@/lib/storage"
import { isUserPro, saveGrant, unsaveGrant, isGrantSaved } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { UpgradeModal } from "@/components/upgrade-modal"
import Link from "next/link"

interface FreemiumGrantCardProps {
  grant: Grant
  isMatched?: boolean
}

export function FreemiumGrantCard({ grant, isMatched = false }: FreemiumGrantCardProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isPro, setIsPro] = useState(isUserPro())
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { toast } = useToast()

  const closeDate = new Date(grant.closeDate)
  const daysUntilClose = Math.ceil((closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const getUrgencyColor = () => {
    if (daysUntilClose <= 7) return "destructive"
    if (daysUntilClose <= 14) return "warning"
    return "success"
  }

  useEffect(() => {
    const checkSaved = async () => {
      try {
        const saved = await isGrantSaved(grant.id)
        setIsSaved(saved)
      } catch (error) {
        console.error("Error checking if grant is saved:", error)
      }
    }
    checkSaved()
  }, [grant.id])

  const handleSaveToggle = async () => {
    if (!isPro) {
      setShowUpgradeModal(true)
      return
    }

    try {
      if (isSaved) {
        await unsaveGrant(grant.id)
        setIsSaved(false)
        toast({ title: "Grant removed from saved" })
      } else {
        await saveGrant(grant.id)
        setIsSaved(true)
        toast({ title: "Grant saved successfully" })
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

  const handleViewDetails = () => {
    if (!isPro) {
      setShowUpgradeModal(true)
      return
    }
  }

  const handleUpgradeComplete = () => {
    setIsPro(true)
    // Force re-render to show Pro features
    window.location.reload()
  }

  return (
    <>
      <Card
        className={`relative transition-all hover:shadow-md ${
          isMatched ? "ring-2 ring-primary ring-opacity-50" : ""
        } ${!isPro ? "opacity-75" : ""}`}
      >
        {isMatched && (
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
            Match
          </div>
        )}

        {!isPro && (
          <div className="absolute top-3 right-3 z-10">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-medium text-sm leading-tight mb-2 ${
                  !isPro ? "text-muted-foreground" : "text-foreground"
                }`}
              >
                {isPro ? grant.title : `${grant.title.substring(0, 60)}...`}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                {isPro ? grant.agency : "Agency details available with Pro"}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSaveToggle} className="ml-2 p-1 h-auto" disabled={!isPro}>
              <Heart
                className={`w-4 h-4 ${isSaved && isPro ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
              />
            </Button>
          </div>

          <div className="space-y-2 mb-3">
            <Badge variant={getUrgencyColor()} className="text-xs">
              {isPro ? `Closes ${formatDistanceToNow(closeDate, { addSuffix: true })}` : "Deadline: Pro only"}
            </Badge>

            {grant.awardCeiling && grant.awardFloor && (
              <Badge variant="outline" className="text-xs">
                {isPro
                  ? `$${(grant.awardFloor / 1000).toFixed(0)}K - $${(grant.awardCeiling / 1000).toFixed(0)}K`
                  : "Award range: Pro only"}
              </Badge>
            )}

            {grant.category && (
              <Badge variant="secondary" className="text-xs">
                {isPro ? grant.category : "Category: Pro only"}
              </Badge>
            )}
          </div>

          <p className={`text-xs mb-4 line-clamp-2 ${!isPro ? "text-muted-foreground" : "text-muted-foreground"}`}>
            {isPro ? grant.description : "Full description and details available with Pro subscription..."}
          </p>

          <div className="flex gap-2">
            {isPro ? (
              <Button asChild size="sm" className="flex-1">
                <Link href={`/grants/${grant.opportunityNumber}`}>View Details</Link>
              </Button>
            ) : (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                onClick={handleViewDetails}
              >
                <Crown className="w-3 h-3 mr-1" />
                Upgrade for Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeComplete={handleUpgradeComplete}
      />
    </>
  )
}
