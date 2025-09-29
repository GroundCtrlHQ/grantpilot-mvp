import { formatDistanceToNow, format, differenceInDays } from "date-fns"

export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), "MMM d, yyyy")
}

export const getDeadlineUrgency = (closeDate: string): "urgent" | "warning" | "normal" => {
  const daysUntil = differenceInDays(new Date(closeDate), new Date())

  if (daysUntil < 7) return "urgent"
  if (daysUntil < 14) return "warning"
  return "normal"
}

export const getDeadlineText = (closeDate: string): string => {
  const daysUntil = differenceInDays(new Date(closeDate), new Date())
  const formattedDate = formatDate(closeDate)

  if (daysUntil < 0) return `Closed ${formattedDate}`
  if (daysUntil === 0) return `Closes today`
  if (daysUntil === 1) return `Closes tomorrow`
  return `Closes ${formattedDate} (${daysUntil} days)`
}

export const formatRelativeTime = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}
