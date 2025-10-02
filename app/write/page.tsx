import { DashboardLayout } from "@/components/dashboard-layout"

export default function WritePage() {
  return (
    <DashboardLayout>
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">Write Page</h1>
          <p className="text-muted-foreground">
            This page is currently under development.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
