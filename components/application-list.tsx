"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/status-badge"
import { Eye, Edit } from "lucide-react"
import type { Application, Grant } from "@/lib/storage"
import { formatRelativeTime } from "@/lib/date-utils"

interface ApplicationListProps {
  applications: Application[]
  grants: Grant[]
}

export function ApplicationList({ applications, grants }: ApplicationListProps) {
  const [activeTab, setActiveTab] = useState("all")

  const getGrantTitle = (grantId: string) => {
    const grant = grants.find((g) => g.id === grantId)
    return grant?.title || "Unknown Grant"
  }

  const filterApplications = (status?: Application["status"]) => {
    if (!status) return applications
    return applications.filter((app) => app.status === status)
  }

  const tabs = [
    { value: "all", label: "All", applications: applications },
    { value: "draft", label: "Draft", applications: filterApplications("draft") },
    { value: "submitted", label: "Submitted", applications: filterApplications("submitted") },
    { value: "under_review", label: "Under Review", applications: filterApplications("under_review") },
    { value: "awarded", label: "Awarded", applications: filterApplications("awarded") },
    { value: "rejected", label: "Rejected", applications: filterApplications("rejected") },
  ]

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card key={application.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{getGrantTitle(application.grantId)}</h3>
            <p className="text-sm text-muted-foreground mt-1">{application.projectTitle || "Untitled Project"}</p>
            <div className="flex items-center gap-4 mt-2">
              <StatusBadge status={application.status} />
              <span className="text-xs text-muted-foreground">Updated {formatRelativeTime(application.updatedAt)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/applications/${application.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/applications/${application.id}/update`}>
                <Edit className="h-4 w-4 mr-1" />
                Update
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-6">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
            {tab.label} ({tab.applications.length})
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-4">
          {tab.applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No applications in this category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tab.applications
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((application) => (
                  <ApplicationCard key={application.id} application={application} />
                ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
