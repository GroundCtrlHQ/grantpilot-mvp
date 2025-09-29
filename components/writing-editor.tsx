"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateApplication } from "@/lib/storage"
import type { Application } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { debounce } from "lodash"

interface WritingEditorProps {
  application: Application
  onContentChange: (content: { projectTitle: string; projectSummary: string; narrativeText: string }) => void
}

export function WritingEditor({ application, onContentChange }: WritingEditorProps) {
  const [projectTitle, setProjectTitle] = useState(application.projectTitle || "")
  const [projectSummary, setProjectSummary] = useState(application.projectSummary || "")
  const [narrativeText, setNarrativeText] = useState(application.narrativeText || "")
  const { toast } = useToast()

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((updates: Partial<Application>) => {
      updateApplication(application.id, updates)
      console.log("[v0] Auto-saved application content")
    }, 1000),
    [application.id],
  )

  // Auto-save on content change
  useEffect(() => {
    const updates: Partial<Application> = {}
    let hasChanges = false

    if (projectTitle !== application.projectTitle) {
      updates.projectTitle = projectTitle
      hasChanges = true
    }
    if (projectSummary !== application.projectSummary) {
      updates.projectSummary = projectSummary
      hasChanges = true
    }
    if (narrativeText !== application.narrativeText) {
      updates.narrativeText = narrativeText
      hasChanges = true
    }

    if (hasChanges) {
      debouncedSave(updates)
      onContentChange({ projectTitle, projectSummary, narrativeText })
    }
  }, [projectTitle, projectSummary, narrativeText, application, debouncedSave, onContentChange])

  const getSummaryWordCount = () => {
    return projectSummary.trim().split(/\s+/).filter(Boolean).length
  }

  const summaryWordCount = getSummaryWordCount()
  const isOverLimit = summaryWordCount > 250

  return (
    <div className="space-y-6">
      {/* Project Title */}
      <Card>
        <CardHeader>
          <CardTitle>Project Title</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Input
              placeholder="Enter your project title..."
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">{projectTitle.length}/200 characters</p>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              placeholder="Brief overview of your project..."
              value={projectSummary}
              onChange={(e) => setProjectSummary(e.target.value)}
              rows={6}
            />
            <div className="flex justify-between text-xs">
              <span className={isOverLimit ? "text-destructive" : "text-muted-foreground"}>
                {summaryWordCount} / 250 words
              </span>
              {isOverLimit && <span className="text-destructive">Over word limit</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Narrative */}
      <Card>
        <CardHeader>
          <CardTitle>Project Narrative</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              placeholder="Detailed project description..."
              value={narrativeText}
              onChange={(e) => setNarrativeText(e.target.value)}
              rows={20}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">No word limit - write as much as needed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
