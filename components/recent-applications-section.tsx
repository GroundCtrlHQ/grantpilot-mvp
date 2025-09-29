"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { ArrowRight } from "lucide-react"
import type { Application, Grant } from "@/lib/storage"
import { formatRelativeTime } from "@/lib/date-utils"

interface RecentApplicationsSectionProps {
  applications: Application[]
  grants: Grant[]
}

export function RecentApplicationsSection({ applications, grants }: RecentApplicationsSectionProps) {
  const recentApplications = applications
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const getGrantById = (grantId: string) => {
    return grants.find((g) => g.id === grantId)
  }

  if (recentApplications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">No applications yet</p>
            <Button asChild>
              <Link href="/grants">Find Grants to Apply</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Applications</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/applications" className="text-primary">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentApplications.map((application) => {
          const grant = getGrantById(application.grantId)

          return (
            <Link key={application.id} href={`/applications/${application.id}`}>
              <div className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <h4 className="font-medium text-foreground line-clamp-1 mb-1">{grant?.title || "Unknown Grant"}</h4>
                <p className="text-sm text-muted-foreground mb-2">{application.projectTitle || "Untitled Project"}</p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={application.status} />
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(application.updatedAt)}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
