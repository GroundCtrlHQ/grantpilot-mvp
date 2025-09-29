"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle } from "lucide-react"

interface ScoreData {
  totalScore: number
  breakdown: {
    clarity: number
    specificity: number
    alignment: number
    completeness: number
  }
  recommendations: string[]
}

interface ScorePanelProps {
  score: ScoreData | null
  isLoading: boolean
}

export function ScorePanel({ score, isLoading }: ScorePanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    return "text-destructive"
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-success"
    if (score >= 60) return "bg-warning"
    return "bg-destructive"
  }

  if (isLoading) {
    return (
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle>Analyzing...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!score) {
    return (
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle>Grant Writing Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Click "Check My Score" to get AI feedback on your grant application</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Grant Writing Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(score.totalScore)}`}>{score.totalScore}</div>
          <p className="text-muted-foreground">out of 100</p>
        </div>

        <hr className="border-border" />

        {/* Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Score Breakdown</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Clarity & Structure</span>
                <span>{score.breakdown.clarity}/25</span>
              </div>
              <Progress value={(score.breakdown.clarity / 25) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Specificity</span>
                <span>{score.breakdown.specificity}/25</span>
              </div>
              <Progress value={(score.breakdown.specificity / 25) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Alignment</span>
                <span>{score.breakdown.alignment}/25</span>
              </div>
              <Progress value={(score.breakdown.alignment / 25) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completeness</span>
                <span>{score.breakdown.completeness}/25</span>
              </div>
              <Progress value={(score.breakdown.completeness / 25) * 100} className="h-2" />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Recommendations</h4>
          <div className="space-y-2">
            {score.recommendations.map((rec, index) => (
              <div key={index} className="flex gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
