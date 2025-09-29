"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIGrantSearch } from "@/components/ai-grant-search"
import { GrantsGovSearch } from "@/components/grants-gov-search"
import { Brain, Globe } from "lucide-react"
import type { Grant } from "@/lib/storage"

export default function GrantsPage() {
  const [activeTab, setActiveTab] = useState("grants-gov")

  const handleAIGrantsFound = (aiGrants: any[]) => {
    // This will be handled by the individual search components
    console.log("AI grants found:", aiGrants)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Find Grants</h1>
          <p className="text-muted-foreground">
            Search for grants using Grants.gov or AI-powered discovery
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grants-gov" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Grants.gov Search
            </TabsTrigger>
            <TabsTrigger value="ai-search" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Discovery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grants-gov" className="space-y-6">
            <GrantsGovSearch onGrantsFound={handleAIGrantsFound} />
          </TabsContent>

          <TabsContent value="ai-search" className="space-y-6">
            <AIGrantSearch onGrantsFound={handleAIGrantsFound} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
