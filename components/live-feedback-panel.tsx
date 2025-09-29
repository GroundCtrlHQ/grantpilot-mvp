"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp, FileText, Clock } from "lucide-react"

interface LiveSuggestion {
  type: "improvement" | "missing" | "strength"
  message: string
  priority: "high" | "medium" | "low"
}

interface WordCountAnalysis {
  current: number
  recommended_min: number
  recommended_max: number
  status: "too_short" | "good" | "too_long"
}

interface LiveFeedbackPanelProps {
  content: {
    projectTitle: string
    projectSummary: string
    narrativeText: string
  }
  requirements: any[]
  grantContext?: any
  onFeedbackUpdate?: (feedback: any) => void
}

export function LiveFeedbackPanel({ content, requirements, grantContext, onFeedbackUpdate }: LiveFeedbackPanelProps) {
  const [overallScore, setOverallScore] = useState(0)
  const [liveSuggestions, setLiveSuggestions] = useState<LiveSuggestion[]>([])
  const [nextSteps, setNextSteps] = useState<string[]>([])
  const [wordCountAnalysis, setWordCountAnalysis] = useState<WordCountAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalyzed, setLastAnalyzed] = useState("")

  // Combine all content for analysis
  const fullContent = `${content.projectTitle}\n\n${content.projectSummary}\n\n${content.narrativeText}`.trim()

  // Real-time analysis with debouncing
  useEffect(() => {
    if (fullContent === lastAnalyzed || fullContent.length < 50) return

    const analyzeContent = async () => {
      setIsAnalyzing(true)

      try {
        const response = await fetch("/api/real-time-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: fullContent,
            requirements,
            grantContext,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          const analysis = result.analysis

          setOverallScore(analysis.overall_score || 0)
          setLiveSuggestions(analysis.live_suggestions || [])
          setNextSteps(analysis.next_steps || [])
          setWordCountAnalysis(analysis.word_count_analysis)
          setLastAnalyzed(fullContent)

          onFeedbackUpdate?.(analysis)
        }
      } catch (error) {
        console.error("Real-time analysis error:", error)
      } finally {
        setIsAnalyzing(false)
      }
    }

    // Debounce the analysis
    const timeoutId = setTimeout(analyzeContent, 2000)
    return () => clearTimeout(timeoutId)
  }, [fullContent, requirements, grantContext, lastAnalyzed, onFeedbackUpdate])

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "strength":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "missing":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "improvement":
        return <Lightbulb className="h-4 w-4 text-blue-600" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getSuggestionVariant = (type: string, priority: string) => {
    if (type === "strength") return "default"
    if (priority === "high") return "destructive"
    if (priority === "medium") return "secondary"
    return "outline"
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getWordCountStatus = () => {
    if (!wordCountAnalysis) return null

    const { status, current, recommended_min, recommended_max } = wordCountAnalysis

    switch (status) {
      case "too_short":
        return {
          color: "text-red-600",
          message: `Too short (${current} words). Aim for ${recommended_min}-${recommended_max} words.`,
        }
      case "too_long":
        return {
          color: "text-orange-600",
          message: `Too long (${current} words). Consider condensing to ${recommended_min}-${recommended_max} words.`,
        }
      case "good":
        return {
          color: "text-green-600",
          message: `Good length (${current} words). Within recommended range.`,
        }
      default:
        return null
    }
  }

  const wordCountStatus = getWordCountStatus()

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Feedback
          </CardTitle>
          {isAnalyzing && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1 animate-pulse" />
              Analyzing...
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Score</span>
            <span className={`text-lg font-bold ${getScoreColor(overallScore)}`}>{overallScore}/100</span>
          </div>
          <Progress value={overallScore} className="h-2" />
        </div>

        {/* Word Count Analysis */}
        {wordCountStatus && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription className={wordCountStatus.color}>{wordCountStatus.message}</AlertDescription>
          </Alert>
        )}

        {/* Live Suggestions */}
        {liveSuggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Live Suggestions</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {liveSuggestions.map((suggestion, index) => (
                <Alert key={index} className="p-3">
                  <div className="flex items-start gap-2">
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSuggestionVariant(suggestion.type, suggestion.priority)} className="text-xs">
                          {suggestion.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <AlertDescription className="text-sm">{suggestion.message}</AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {nextSteps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Next Steps</h4>
            <ul className="space-y-1">
              {nextSteps.map((step, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-medium">{index + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty State */}
        {!isAnalyzing && liveSuggestions.length === 0 && fullContent.length < 50 && (
          <div className="text-center py-6 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start writing to get live feedback</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
