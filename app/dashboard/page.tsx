"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { OnboardingSuccess } from "@/components/onboarding-success"
import { DashboardStats } from "@/components/dashboard-stats"
import { SavedGrantsSection } from "@/components/saved-grants-section"
import { RecentApplicationsSection } from "@/components/recent-applications-section"
import { UrgentDeadlinesSection } from "@/components/urgent-deadlines-section"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { getAllApplications, getSavedGrants, getGrants, getUser } from "@/lib/storage"
import type { Application, SavedGrant, Grant, User } from "@/lib/storage"
import Link from "next/link"

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [savedGrants, setSavedGrants] = useState<SavedGrant[]>([])
  const [grants, setGrants] = useState<Grant[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const isOnboarded = searchParams.get("onboarded") === "true"

  useEffect(() => {
    const loadData = async () => {
      try {
        setApplications(getAllApplications())
        setSavedGrants(await getSavedGrants())
        setUser(getUser())
        
        // Load grants from database instead of grants.gov API
        try {
          const response = await fetch('/api/grants/database?query=&limit=50')
          if (response.ok) {
            const data = await response.json()
            setGrants(data.grants || [])
          } else {
            // Fallback to localStorage if API fails
            setGrants(getGrants())
          }
        } catch (error) {
          console.error('Error loading grants from database:', error)
          // Fallback to localStorage
          setGrants(getGrants())
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isOnboarded && user?.onboardingCompleted) {
    return <OnboardingSuccess />
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  const hasData = grants.length > 0 || applications.length > 0 || savedGrants.length > 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Welcome back{user?.name ? `, ${user.name}` : ""}!
            </h1>
            <p className="text-muted-foreground">Here's your grant management overview</p>
          </div>
          {grants.length > 0 && (
            <Button variant="outline" asChild>
              <Link href="/grants">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Grants
              </Link>
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <DashboardStats savedGrants={savedGrants} applications={applications} />

        {/* Empty State */}
        {!hasData && (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <h3 className="text-lg font-medium text-foreground mb-2">Welcome to GrantPilot!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by loading grants from grants.gov and discovering funding opportunities for your organization.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href="/grants">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Grants
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Dashboard Sections */}
        {hasData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Saved Grants */}
            <SavedGrantsSection 
          savedGrants={savedGrants} 
          grants={grants} 
          onGrantDeleted={() => {
            // Refresh saved grants when one is deleted
            getSavedGrants().then(setSavedGrants)
          }}
        />

            {/* Recent Applications */}
            <RecentApplicationsSection applications={applications} grants={grants} />

            {/* Urgent Deadlines - Full Width */}
            <div className="lg:col-span-2">
              <UrgentDeadlinesSection savedGrants={savedGrants} grants={grants} />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {hasData && (
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="font-medium text-foreground mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/grants">Search New Grants</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/applications">View All Applications</Link>
              </Button>
              {applications.filter((app) => app.status === "draft").length > 0 && (
                <Button variant="outline" asChild>
                  <Link href="/applications">Continue Draft Applications</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
