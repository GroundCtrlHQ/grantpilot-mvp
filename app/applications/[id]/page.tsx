"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Edit, FileText, History, Brain } from "lucide-react"
import { getApplication, getGrants, getStatusUpdates } from "@/lib/storage"
import type { Application, Grant, StatusUpdate } from "@/lib/storage"
import { formatDate, formatRelativeTime } from "@/lib/date-utils"

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [grant, setGrant] = useState<Grant | null>(null)
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([])

  useEffect(() => {
    const app = getApplication(params.id as string)
    if (app) {
      setApplication(app)
      setStatusUpdates(getStatusUpdates(app.id))

      const grants = getGrants()
      const foundGrant = grants.find((g) => g.id === app.grantId)
      setGrant(foundGrant || null)
    }
  }, [params.id])

  if (!application) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">Application not found</h3>
          <p className="text-muted-foreground mb-4">The application you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/applications")}>Back to Applications</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-foreground text-balance">{grant?.title || "Unknown Grant"}</h1>
            <p className="text-lg text-muted-foreground mt-1">{application.projectTitle || "Untitled Project"}</p>
            <div className="mt-3">
              <StatusBadge status={application.status} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/applications/${application.id}/analyze`}>
                <Brain className="h-4 w-4 mr-2" />
                Analyze Requirements
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/applications/${application.id}/write`}>
                <FileText className="h-4 w-4 mr-2" />
                Edit Content
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/applications/${application.id}/update`}>
                <Edit className="h-4 w-4 mr-2" />
                Update Status
              </Link>
            </Button>
          </div>
        </div>

        {/* Application Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-1">Status</h4>
                <StatusBadge status={application.status} />
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Created</h4>
                <p className="text-muted-foreground">{formatDate(application.createdAt)}</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Last Updated</h4>
                <p className="text-muted-foreground">{formatDate(application.updatedAt)}</p>
              </div>
              {application.submittedDate && (
                <div>
                  <h4 className="font-medium text-foreground mb-1">Submitted</h4>
                  <p className="text-muted-foreground">{formatDate(application.submittedDate)}</p>
                </div>
              )}
              {application.awardedDate && (
                <div>
                  <h4 className="font-medium text-foreground mb-1">Awarded</h4>
                  <p className="text-muted-foreground">{formatDate(application.awardedDate)}</p>
                </div>
              )}
              {application.awardAmount && (
                <div>
                  <h4 className="font-medium text-foreground mb-1">Award Amount</h4>
                  <p className="text-success font-semibold">${application.awardAmount.toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {grant ? (
                <>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Grant Title</h4>
                    <p className="text-muted-foreground">{grant.title}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Agency</h4>
                    <p className="text-muted-foreground">{grant.agency}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Opportunity Number</h4>
                    <p className="text-muted-foreground">{grant.opportunityNumber}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Close Date</h4>
                    <p className="text-muted-foreground">{formatDate(grant.closeDate)}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/grants/${grant.opportunityNumber}`}>View Grant Details</Link>
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">Grant information not available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Content Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Project Title</h4>
              <p className="text-muted-foreground">{application.projectTitle || "Not set"}</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Executive Summary</h4>
              <p className="text-muted-foreground">{application.projectSummary || "Not written yet"}</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Project Narrative</h4>
              <p className="text-muted-foreground line-clamp-3">{application.narrativeText || "Not written yet"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Status History */}
        {statusUpdates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusUpdates
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((update) => (
                    <div key={update.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={update.oldStatus as Application["status"]} />
                          <span className="text-muted-foreground">→</span>
                          <StatusBadge status={update.newStatus as Application["status"]} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Updated by {update.updatedBy} • {formatRelativeTime(update.createdAt)}
                        </p>
                        {update.notes && <p className="text-sm text-foreground">{update.notes}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
