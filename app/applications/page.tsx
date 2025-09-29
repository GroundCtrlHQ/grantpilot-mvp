"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PipelineCards } from "@/components/pipeline-cards"
import { ApplicationList } from "@/components/application-list"
import { getAllApplications, getGrants } from "@/lib/storage"
import type { Application, Grant } from "@/lib/storage"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [grants, setGrants] = useState<Grant[]>([])

  useEffect(() => {
    setApplications(getAllApplications())
    setGrants(getGrants())
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">My Applications</h1>
          <p className="text-muted-foreground">Track and manage your grant applications</p>
        </div>

        {/* Pipeline Overview */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-4">Pipeline Overview</h2>
          <PipelineCards applications={applications} />
        </div>

        {/* Applications List */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-4">All Applications</h2>
          <ApplicationList applications={applications} grants={grants} />
        </div>
      </div>
    </DashboardLayout>
  )
}
