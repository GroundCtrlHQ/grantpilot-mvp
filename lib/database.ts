import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Database types
export interface User {
  id: number
  email: string
  password_hash: string
  first_name?: string
  last_name?: string
  organization?: string
  organization_type?: string
  focus_areas?: string[]
  created_at: Date
  updated_at: Date
}

export interface Grant {
  id: number
  opp_number: string
  title: string
  agency?: string
  description?: string
  eligibility?: string
  funding_amount?: string
  deadline?: Date
  status: string
  categories?: string[]
  created_at: Date
  updated_at: Date
}

export interface Application {
  id: number
  user_id: number
  grant_id: number
  opp_number: string
  status: string
  project_title?: string
  project_summary?: string
  project_narrative?: string
  uploaded_files: any[]
  created_at: Date
  updated_at: Date
}

export interface Checklist {
  id: number
  application_id: number
  requirements: ChecklistRequirement[]
  ai_analysis?: any
  created_at: Date
  updated_at: Date
}

export interface ChecklistRequirement {
  id: string
  text: string
  category: string
  completed: boolean
  matched_content?: string
  confidence?: number
}
