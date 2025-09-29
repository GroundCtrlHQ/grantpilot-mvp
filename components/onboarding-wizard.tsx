"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { completeOnboarding } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowRight, CheckCircle } from "lucide-react"

const ORGANIZATION_TYPES = [
  "Nonprofit Organization",
  "Educational Institution",
  "Healthcare Organization",
  "Research Institution",
  "Community Organization",
  "Religious Organization",
  "Other",
]

const FOCUS_AREAS = [
  "Health & Medical Research",
  "Education & Youth Development",
  "Environment & Conservation",
  "Arts & Culture",
  "Community Development",
  "Social Services",
  "Science & Technology",
  "Agriculture & Food Security",
  "Economic Development",
  "Emergency Response",
]

const ORGANIZATION_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees",
]

export function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    organizationType: "",
    focusAreas: [] as string[],
    organizationSize: "",
    location: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleFocusAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        focusAreas: [...prev.focusAreas, area],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        focusAreas: prev.focusAreas.filter((a) => a !== area),
      }))
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    completeOnboarding(formData)

    toast({
      title: "Welcome to GrantPilot!",
      description: "Your profile has been set up. Finding matching grants...",
    })

    setIsLoading(false)
    router.push("/dashboard?onboarded=true")
  }

  const canProceedStep1 = formData.organizationType && formData.organizationSize
  const canProceedStep2 = formData.focusAreas.length > 0 && formData.location
  const canComplete = canProceedStep1 && canProceedStep2

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary-foreground text-lg font-bold">GP</span>
              </div>
              <h1 className="text-2xl font-semibold">GrantPilot</h1>
            </div>
            <ThemeToggle />
          </div>
          <CardTitle className="text-xl">Let's get you started</CardTitle>
          <CardDescription>Tell us about your organization so we can find the perfect grants for you</CardDescription>

          {/* Progress indicator */}
          <div className="flex items-center justify-center mt-6 space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {step > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
            </div>
            <div className={`w-12 h-0.5 ${step > 1 ? "bg-primary" : "bg-muted"}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {step > 2 ? <CheckCircle className="w-4 h-4" /> : "2"}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">About Your Organization</h3>

              <div className="space-y-2">
                <Label htmlFor="orgType">Organization Type</Label>
                <Select
                  value={formData.organizationType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, organizationType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGANIZATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgSize">Organization Size</Label>
                <Select
                  value={formData.organizationSize}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, organizationSize: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your organization size" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGANIZATION_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)} disabled={!canProceedStep1} className="flex items-center gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Your Focus Areas</h3>

              <div className="space-y-2">
                <Label>What areas does your organization focus on? (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {FOCUS_AREAS.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={formData.focusAreas.includes(area)}
                        onCheckedChange={(checked) => handleFocusAreaChange(area, checked as boolean)}
                      />
                      <Label htmlFor={area} className="text-sm font-normal cursor-pointer">
                        {area}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (City, State)</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!canComplete || isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? "Setting up..." : "Complete Setup"}
                  {!isLoading && <CheckCircle className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
