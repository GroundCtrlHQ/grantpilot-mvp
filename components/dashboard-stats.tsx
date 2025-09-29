"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Application, SavedGrant } from "@/lib/storage"

interface DashboardStatsProps {
  savedGrants: SavedGrant[]
  applications: Application[]
}

export function DashboardStats({ savedGrants, applications }: DashboardStatsProps) {
  const activeApplications = applications.filter((app) =>
    ["draft", "submitted", "under_review"].includes(app.status),
  ).length

  const totalAwarded = applications
    .filter((app) => app.status === "awarded")
    .reduce((sum, app) => sum + (app.awardAmount || 0), 0)

  const stats = [
    {
      title: "Saved Grants",
      value: savedGrants.length,
      description: "Grants you're tracking",
      color: "text-primary",
    },
    {
      title: "Active Applications",
      value: activeApplications,
      description: "In progress or under review",
      color: "text-primary",
    },
    {
      title: "Total Awarded",
      value: `$${totalAwarded.toLocaleString()}`,
      description: totalAwarded > 0 ? "Congratulations!" : "Keep applying!",
      color: "text-success",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
