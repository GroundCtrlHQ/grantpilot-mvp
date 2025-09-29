"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Trash2 } from "lucide-react"
import type { SavedGrant, Grant } from "@/lib/storage"
import { getDeadlineUrgency, getDeadlineText } from "@/lib/date-utils"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { useToast } from "@/hooks/use-toast"

interface SavedGrantsSectionProps {
  savedGrants: SavedGrant[]
  grants: Grant[]
  onGrantDeleted?: () => void
}

export function SavedGrantsSection({ savedGrants, grants, onGrantDeleted }: SavedGrantsSectionProps) {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    grant: SavedGrant | null
    isLoading: boolean
  }>({
    isOpen: false,
    grant: null,
    isLoading: false
  })
  const { toast } = useToast()

  // Ensure savedGrants is an array
  const safeSavedGrants = Array.isArray(savedGrants) ? savedGrants : []
  
  const recentSaved = safeSavedGrants
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
    .slice(0, 5)

  const getGrantById = (grantId: string) => {
    // grantId is actually the opportunity number, so match by opportunityNumber
    return grants.find((g) => g.opportunityNumber === grantId)
  }

  const handleDeleteClick = (grant: SavedGrant) => {
    setDeleteModal({
      isOpen: true,
      grant,
      isLoading: false
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.grant) return

    setDeleteModal(prev => ({ ...prev, isLoading: true }))

    try {
      console.log('Attempting to delete grant:', deleteModal.grant.grantId)
      const response = await fetch(`/api/saved-grants/${deleteModal.grant.grantId}/delete`, {
        method: 'DELETE'
      })

      console.log('Delete response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Delete result:', result)
        
        toast({
          title: "Grant removed",
          description: "The grant has been removed from your saved grants.",
        })
        
        // Call the callback to refresh the data
        if (onGrantDeleted) {
          onGrantDeleted()
        }
      } else {
        const errorData = await response.json()
        console.error('Delete failed with response:', errorData)
        throw new Error(`Failed to delete saved grant: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting saved grant:', error)
      toast({
        title: "Delete failed",
        description: `Failed to remove the grant from your saved grants: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setDeleteModal({
        isOpen: false,
        grant: null,
        isLoading: false
      })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      grant: null,
      isLoading: false
    })
  }

  if (recentSaved.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Grants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">No saved grants yet</p>
            <Button asChild>
              <Link href="/grants">Browse Grants</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Saved Grants</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/grants" className="text-primary">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentSaved.map((saved) => {
            const grant = getGrantById(saved.grantId)
            if (!grant) return null

            const urgency = getDeadlineUrgency(grant.closeDate)
            const deadlineText = getDeadlineText(grant.closeDate)
            const urgencyVariant = urgency === "urgent" ? "urgent" : urgency === "warning" ? "warning" : "success"

            return (
              <div key={saved.id} className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/grants/${grant.opportunityNumber}`} className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground line-clamp-1 mb-1">{grant.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{grant.agency}</p>
                    <Badge variant={urgencyVariant} className="text-xs">
                      {deadlineText}
                    </Badge>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteClick(saved)
                    }}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Remove Saved Grant"
        description={`Are you sure you want to remove "${deleteModal.grant ? getGrantById(deleteModal.grant.grantId)?.title : ''}" from your saved grants? This action cannot be undone.`}
        itemName="Grant"
        isLoading={deleteModal.isLoading}
      />
    </>
  )
}
