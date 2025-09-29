import type React from "react"
import { AuthGuard } from "./auth-guard"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 h-full">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}
