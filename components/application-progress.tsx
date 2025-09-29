"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const checklistItems = [
  { id: 1, title: "Basic Project Details", completed: true },
  { id: 2, title: "Organization Information", completed: true },
  { id: 3, title: "Budget Narrative (in progress)", completed: false, inProgress: true },
  { id: 4, title: "Budget Documentation", completed: false },
  { id: 5, title: "Follow Up on Letters of Support", completed: false },
  { id: 6, title: "Environmental Review", completed: false },
]

export function ApplicationProgress() {
  const completedItems = checklistItems.filter((item) => item.completed).length
  const progressPercentage = Math.round((completedItems / checklistItems.length) * 100)

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-foreground">Application Progress</h3>
          <button className="text-muted-foreground hover:text-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative w-16 h-16 mx-auto mb-4">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray={`${progressPercentage}, 100`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold text-foreground">{progressPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Checklist</h4>
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="mt-0.5">
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : item.inProgress ? (
                  <Clock className="w-4 h-4 text-blue-600" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <span className={cn("text-sm", item.completed ? "text-foreground" : "text-muted-foreground")}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
