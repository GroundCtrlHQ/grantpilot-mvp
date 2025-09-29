import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { checklistId, requirementId, completed, matchedContent, confidence } = await request.json()

    if (!checklistId || !requirementId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get current checklist
    const currentChecklist = await sql`
      SELECT requirements FROM checklists WHERE id = ${checklistId}
    `

    if (currentChecklist.length === 0) {
      return NextResponse.json({ error: "Checklist not found" }, { status: 404 })
    }

    // Update the specific requirement
    const requirements = currentChecklist[0].requirements
    const updatedRequirements = requirements.map((req: any) => {
      if (req.id === requirementId) {
        return {
          ...req,
          completed: completed ?? req.completed,
          matched_content: matchedContent ?? req.matched_content,
          confidence: confidence ?? req.confidence,
        }
      }
      return req
    })

    // Save updated checklist
    await sql`
      UPDATE checklists 
      SET requirements = ${JSON.stringify(updatedRequirements)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${checklistId}
    `

    return NextResponse.json({ success: true, requirements: updatedRequirements })
  } catch (error) {
    console.error("Checklist update error:", error)
    return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 })
  }
}
