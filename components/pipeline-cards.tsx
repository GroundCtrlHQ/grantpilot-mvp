"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Application } from "@/lib/storage"

interface PipelineCardsProps {
  applications: Application[]
}

export function PipelineCards({ applications }: PipelineCardsProps) {
  const stats = {
    draft: applications.filter((app) => app.status === "draft").length,
    submitted: applications.filter((app) => app.status === "submitted").length,
    under_review: applications.filter((app) => app.status === "under_review").length,
    awarded: {
      count: applications.filter((app) => app.status === "awarded").length,
      total: applications
        .filter((app) => app.status === "awarded")
        .reduce((sum, app) => sum + (app.awardAmount || 0), 0),
    },
    rejected: applications.filter((app) => app.status === "rejected").length,
  }

  const cards = [
    {
      title: "Draft",
      value: stats.draft,
      description: "Applications in progress",
      color: "text-muted-foreground",
    },
    {
      title: "Submitted",
      value: stats.submitted,
      description: "Awaiting review",
      color: "text-primary",
    },
    {
      title: "Under Review",
      value: stats.under_review,
      description: "Being evaluated",
      color: "text-warning",
    },
    {
      title: "Awarded",
      value: stats.awarded.count,
      description: stats.awarded.total > 0 ? `$${stats.awarded.total.toLocaleString()} total` : "No awards yet",
      color: "text-success",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      description: "Not selected",
      color: "text-destructive",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
