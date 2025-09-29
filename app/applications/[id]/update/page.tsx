"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { getApplication, updateApplication, createStatusUpdate } from "@/lib/storage"
import type { Application } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export default function UpdateApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [application, setApplication] = useState<Application | null>(null)
  const [status, setStatus] = useState<Application["status"]>("draft")
  const [submittedDate, setSubmittedDate] = useState("")
  const [awardedDate, setAwardedDate] = useState("")
  const [awardAmount, setAwardAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const app = getApplication(params.id as string)
    if (app) {
      setApplication(app)
      setStatus(app.status)
      setSubmittedDate(app.submittedDate ? app.submittedDate.split("T")[0] : "")
      setAwardedDate(app.awardedDate ? app.awardedDate.split("T")[0] : "")
      setAwardAmount(app.awardAmount?.toString() || "")
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!application) return

    setIsLoading(true)

    const updates: Partial<Application> = {
      status,
    }

    if (status === "submitted" && submittedDate) {
      updates.submittedDate = new Date(submittedDate).toISOString()
    }

    if (status === "awarded") {
      if (awardedDate) {
        updates.awardedDate = new Date(awardedDate).toISOString()
      }
      if (awardAmount) {
        updates.awardAmount = Number.parseInt(awardAmount)
      }
    }

    // Create status update record
    if (application.status !== status) {
      createStatusUpdate(application.id, application.status, status, notes)
    }

    // Update application
    updateApplication(application.id, updates)

    toast({
      title: "Status updated",
      description: "Application status has been updated successfully.",
    })

    router.push(`/applications/${application.id}`)
    setIsLoading(false)
  }

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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Update Application Status</h1>
          <p className="text-muted-foreground mt-1">
            Current status: <StatusBadge status={application.status} className="ml-1" />
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Status Update</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as Application["status"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="awarded">Awarded</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional Fields */}
              {status === "submitted" && (
                <div className="space-y-2">
                  <Label htmlFor="submittedDate">Submission Date</Label>
                  <Input
                    id="submittedDate"
                    type="date"
                    value={submittedDate}
                    onChange={(e) => setSubmittedDate(e.target.value)}
                  />
                </div>
              )}

              {status === "awarded" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="awardedDate">Award Date</Label>
                    <Input
                      id="awardedDate"
                      type="date"
                      value={awardedDate}
                      onChange={(e) => setAwardedDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="awardAmount">Award Amount ($)</Label>
                    <Input
                      id="awardAmount"
                      type="number"
                      placeholder="Enter award amount"
                      value={awardAmount}
                      onChange={(e) => setAwardAmount(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this status update..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Status"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push(`/applications/${application.id}`)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
