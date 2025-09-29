import { Badge } from "@/components/ui/badge"
import type { Application } from "@/lib/storage"

interface StatusBadgeProps {
  status: Application["status"]
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: Application["status"]) => {
    switch (status) {
      case "draft":
        return { variant: "secondary" as const, label: "Draft" }
      case "submitted":
        return { variant: "default" as const, label: "Submitted" }
      case "under_review":
        return { variant: "warning" as const, label: "Under Review" }
      case "awarded":
        return { variant: "success" as const, label: "Awarded" }
      case "rejected":
        return { variant: "destructive" as const, label: "Rejected" }
      case "withdrawn":
        return { variant: "outline" as const, label: "Withdrawn" }
      default:
        return { variant: "secondary" as const, label: "Unknown" }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
