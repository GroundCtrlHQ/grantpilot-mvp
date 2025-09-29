// Database operations are moved to server-side API routes
// This file now only handles client-side localStorage operations

export interface User {
  email: string
  name: string
  onboardingCompleted?: boolean
  subscriptionStatus?: "free" | "pro"
  organizationType?: string
  focusAreas?: string[]
  organizationSize?: string
  location?: string
}

export interface Grant {
  id: string
  opportunityNumber: string
  title: string
  agency: string
  postedDate: string
  closeDate: string
  awardCeiling: number | null
  awardFloor: number | null
  category: string | null
  description: string
  detailsUrl: string
}

export interface SavedGrant {
  id: string
  grantId: string
  notes: string
  savedAt: string
}

export interface Application {
  id: string
  grantId: string
  status: "draft" | "submitted" | "under_review" | "awarded" | "rejected" | "withdrawn"
  projectTitle: string
  projectSummary: string
  narrativeText: string
  submittedDate: string | null
  awardedDate: string | null
  awardAmount: number | null
  createdAt: string
  updatedAt: string
}

export interface StatusUpdate {
  id: string
  applicationId: string
  oldStatus: string
  newStatus: string
  notes: string
  updatedBy: string
  createdAt: string
}

// User management
export const setUser = (user: User): void => {
  localStorage.setItem("grantpilot_user", JSON.stringify(user))
}

export const getUser = (): User | null => {
  const user = localStorage.getItem("grantpilot_user")
  return user ? JSON.parse(user) : null
}

export const clearUser = (): void => {
  localStorage.removeItem("grantpilot_user")
}

export const updateUserProfile = (updates: Partial<User>): void => {
  const user = getUser()
  if (user) {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
  }
}

export const completeOnboarding = (profileData: {
  organizationType: string
  focusAreas: string[]
  organizationSize: string
  location: string
}): void => {
  updateUserProfile({
    ...profileData,
    onboardingCompleted: true,
    subscriptionStatus: "free",
  })
}

export const isUserPro = (): boolean => {
  const user = getUser()
  return user?.subscriptionStatus === "pro"
}

export const upgradeUserToPro = (): boolean => {
  const user = getUser()
  if (user) {
    updateUserProfile({ subscriptionStatus: "pro" })
    return true
  }
  return false
}

// Grants management
export const setGrants = (grants: Grant[]): void => {
  localStorage.setItem("grantpilot_grants", JSON.stringify(grants))
}

export const getGrants = (): Grant[] => {
  const grants = localStorage.getItem("grantpilot_grants")
  return grants ? JSON.parse(grants) : []
}

export const filterGrants = (filters: {
  statuses?: string[]
  fundingInstruments?: string[]
  agencies?: string[]
  categories?: string[]
  closeDateRanges?: string[]
  costSharing?: string[]
  searchQuery?: string
}): Grant[] => {
  const grants = getGrants()
  const now = new Date()

  return grants
    .filter((grant) => {
      // Status filter (map our status values to grants.gov status values)
      if (filters.statuses && filters.statuses.length > 0) {
        const statusMap: { [key: string]: string } = {
          'forecasted': 'forecasted',
          'posted': 'posted',
          'closed': 'closed',
          'archived': 'archived',
        }

        const grantStatus = grant.status?.toLowerCase() || 'posted'
        const mappedStatuses = filters.statuses.map(s => statusMap[s] || s)

        if (!mappedStatuses.includes(grantStatus)) return false
      }

      // Search query filter
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase()
        const searchableText = `${grant.title} ${grant.agency} ${grant.description} ${grant.category}`.toLowerCase()
        if (!searchableText.includes(query)) return false
      }

      // Agency filter
      if (filters.agencies && filters.agencies.length > 0) {
        if (!filters.agencies.includes(grant.agency)) return false
      }

      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        if (!grant.category || !filters.categories.includes(grant.category)) return false
      }

      // Close date range filter
      if (filters.closeDateRanges && filters.closeDateRanges.length > 0) {
        const closeDate = new Date(grant.closeDate)
        const daysUntilClose = Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        const rangeMatches = filters.closeDateRanges.some(range => {
          const days = parseInt(range)
          switch (days) {
            case 7: return daysUntilClose <= 7
            case 30: return daysUntilClose <= 30
            case 90: return daysUntilClose <= 90
            case 120: return daysUntilClose <= 120
            default: return false
          }
        })

        if (!rangeMatches) return false
      }

      // Default: only show grants that haven't closed yet (unless specifically requested)
      if (!filters.statuses?.includes('closed') && !filters.statuses?.includes('archived')) {
        const closeDate = new Date(grant.closeDate)
        if (closeDate <= now) return false
      }

      return true
    })
    .sort((a, b) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime())
}

// Saved grants management - Client-side only (localStorage fallback)
export const saveGrant = async (grantId: string, notes = "", grantDetails?: any): Promise<void> => {
  try {
    // Try to save via API first
    const response = await fetch('/api/saved-grants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grantId, notes, grantDetails })
    })
    
    if (response.ok) {
      console.log("[v0] Grant saved via API:", grantId)
      return
    }
  } catch (error) {
    console.error("[v0] Error saving grant via API:", error)
  }
  
  // Fallback to localStorage
  const saved = getSavedGrantsLocal()
  const newSaved: SavedGrant = {
    id: crypto.randomUUID(),
    grantId,
    notes,
    savedAt: new Date().toISOString(),
  }
  saved.push(newSaved)
  localStorage.setItem("grantpilot_saved", JSON.stringify(saved))
}

export const unsaveGrant = async (grantId: string): Promise<void> => {
  try {
    // Try to remove via API first
    const response = await fetch(`/api/saved-grants/${grantId}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      console.log("[v0] Grant removed via API:", grantId)
      return
    }
  } catch (error) {
    console.error("[v0] Error removing grant via API:", error)
  }
  
  // Fallback to localStorage
  const saved = getSavedGrantsLocal()
  const filtered = saved.filter((s) => s.grantId !== grantId)
  localStorage.setItem("grantpilot_saved", JSON.stringify(filtered))
}

export const getSavedGrants = async (): Promise<SavedGrant[]> => {
  try {
    // Try to get from API first
    const response = await fetch('/api/saved-grants')
    if (response.ok) {
      const data = await response.json()
      return data.savedGrants || []
    }
  } catch (error) {
    console.error("[v0] Error getting saved grants via API:", error)
  }
  
  // Fallback to localStorage
  return getSavedGrantsLocal()
}

export const isGrantSaved = async (grantId: string): Promise<boolean> => {
  try {
    // Try to check via API first
    const response = await fetch(`/api/saved-grants/${grantId}/check`)
    if (response.ok) {
      const data = await response.json()
      return data.isSaved || false
    }
  } catch (error) {
    console.error("[v0] Error checking if grant is saved via API:", error)
  }
  
  // Fallback to localStorage
  const saved = getSavedGrantsLocal()
  return saved.some((s) => s.grantId === grantId)
}

// Helper function for localStorage fallback
const getSavedGrantsLocal = (): SavedGrant[] => {
  const saved = localStorage.getItem("grantpilot_saved")
  return saved ? JSON.parse(saved) : []
}

// Applications management
export const createApplication = (grantId: string): Application => {
  const applications = getAllApplications()
  const newApp: Application = {
    id: crypto.randomUUID(),
    grantId,
    status: "draft",
    projectTitle: "",
    projectSummary: "",
    narrativeText: "",
    submittedDate: null,
    awardedDate: null,
    awardAmount: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  applications.push(newApp)
  localStorage.setItem("grantpilot_applications", JSON.stringify(applications))
  return newApp
}

export const updateApplication = (id: string, updates: Partial<Application>): void => {
  const applications = getAllApplications()
  const index = applications.findIndex((app) => app.id === id)
  if (index !== -1) {
    applications[index] = {
      ...applications[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem("grantpilot_applications", JSON.stringify(applications))
  }
}

export const getApplication = (id: string): Application | null => {
  const applications = getAllApplications()
  return applications.find((app) => app.id === id) || null
}

export const getAllApplications = (): Application[] => {
  const applications = localStorage.getItem("grantpilot_applications")
  return applications ? JSON.parse(applications) : []
}

export const getApplicationsByStatus = (status: Application["status"]): Application[] => {
  return getAllApplications().filter((app) => app.status === status)
}

// Status updates management
export const createStatusUpdate = (
  applicationId: string,
  oldStatus: string,
  newStatus: string,
  notes: string,
): void => {
  const updates = getStatusUpdates(applicationId)
  const user = getUser()
  const newUpdate: StatusUpdate = {
    id: crypto.randomUUID(),
    applicationId,
    oldStatus,
    newStatus,
    notes,
    updatedBy: user?.email || "unknown",
    createdAt: new Date().toISOString(),
  }

  const allUpdates = getAllStatusUpdates()
  allUpdates.push(newUpdate)
  localStorage.setItem("grantpilot_status_updates", JSON.stringify(allUpdates))
}

export const getStatusUpdates = (applicationId: string): StatusUpdate[] => {
  const allUpdates = getAllStatusUpdates()
  return allUpdates.filter((update) => update.applicationId === applicationId)
}

export const getAllStatusUpdates = (): StatusUpdate[] => {
  const updates = localStorage.getItem("grantpilot_status_updates")
  return updates ? JSON.parse(updates) : []
}
