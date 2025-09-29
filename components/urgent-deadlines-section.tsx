"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ArrowRight } from "lucide-react"
import type { SavedGrant, Grant } from "@/lib/storage"
import { getDeadlineUrgency, getDeadlineText } from "@/lib/date-utils"
import { differenceInDays } from "date-fns"

interface UrgentDeadlinesSectionProps {
  savedGrants: SavedGrant[]
  grants: Grant[]
}

export function UrgentDeadlinesSection({ savedGrants, grants }: UrgentDeadlinesSectionProps) {
  // Ensure savedGrants is an array
  const safeSavedGrants = Array.isArray(savedGrants) ? savedGrants : []
  
  const urgentGrants = safeSavedGrants
    .map((saved) => {
      // Match by opportunity number instead of ID
      const grant = grants.find((g) => g.opportunityNumber === saved.grantId)
      return grant ? { saved, grant } : null
    })
    .filter(Boolean)
    .filter(({ grant }) => {
      const daysUntil = differenceInDays(new Date(grant.closeDate), new Date())
      return daysUntil <= 14 && daysUntil >= 0 // Show grants closing within 14 days
    })
    .sort(({ grant: a }, { grant: b }) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime())

  if (urgentGrants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">No urgent deadlines in your saved grants</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Upcoming Deadlines
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/grants" className="text-primary">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {urgentGrants.map(({ saved, grant }) => {
          const urgency = getDeadlineUrgency(grant.closeDate)
          const deadlineText = getDeadlineText(grant.closeDate)
          const urgencyVariant = urgency === "urgent" ? "urgent" : urgency === "warning" ? "warning" : "success"

          return (
            <Link key={saved.id} href={`/grants/${grant.opportunityNumber}`}>
              <div className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <h4 className="font-medium text-foreground line-clamp-1 mb-1">{grant.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{grant.agency}</p>
                <Badge variant={urgencyVariant} className="text-xs">
                  {deadlineText}
                </Badge>
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
