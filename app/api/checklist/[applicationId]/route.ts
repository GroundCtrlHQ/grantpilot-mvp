import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { applicationId: string } }) {
  try {
    const { applicationId } = params

    // Create a consistent integer from the UUID string for database operations
    const applicationIdHash = Math.abs(
      applicationId.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0),
    )

    const result = await sql`
      SELECT * FROM checklists WHERE application_id = ${applicationIdHash}
    `

    if (result.length === 0) {
      return NextResponse.json({ requirements: [] })
    }

    return NextResponse.json({
      success: true,
      checklist: result[0],
      requirements: result[0].requirements,
    })
  } catch (error) {
    console.error("Checklist fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch checklist" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { applicationId: string } }) {
  try {
    const { applicationId } = params
    const body = await request.json()
    const { requirements, aiAnalysis } = body

    const applicationIdHash = Math.abs(
      applicationId.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0),
    )

    // Check if checklist already exists
    const existing = await sql`
      SELECT id FROM checklists WHERE application_id = ${applicationIdHash}
    `

    if (existing.length > 0) {
      // Update existing checklist
      await sql`
        UPDATE checklists 
        SET requirements = ${JSON.stringify(requirements)}, 
            ai_analysis = ${JSON.stringify(aiAnalysis)},
            updated_at = NOW()
        WHERE application_id = ${applicationIdHash}
      `
    } else {
      // Create new checklist
      await sql`
        INSERT INTO checklists (application_id, requirements, ai_analysis, created_at, updated_at)
        VALUES (${applicationIdHash}, ${JSON.stringify(requirements)}, ${JSON.stringify(aiAnalysis)}, NOW(), NOW())
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Checklist save error:", error)
    return NextResponse.json({ error: "Failed to save checklist" }, { status: 500 })
  }
}
