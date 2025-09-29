import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { grantId: string } }
) {
  try {
    const { grantId } = params
    const userId = 1 // For now, using hardcoded user ID

    // First check if the saved grant exists
    const existingGrant = await sql`
      SELECT sg.id FROM saved_grants sg
      JOIN grants g ON sg.grant_id = g.id
      WHERE sg.user_id = ${userId} AND g.opp_number = ${grantId}
    `

    if (existingGrant.length === 0) {
      return NextResponse.json({ error: "Saved grant not found" }, { status: 404 })
    }

    // Delete the saved grant
    await sql`
      DELETE FROM saved_grants 
      WHERE user_id = ${userId} AND grant_id = (
        SELECT id FROM grants WHERE opp_number = ${grantId}
      )
    `

    return NextResponse.json({ 
      success: true, 
      message: "Grant removed from saved grants" 
    })
  } catch (error) {
    console.error("Error deleting saved grant:", error)
    return NextResponse.json(
      { error: "Failed to delete saved grant" },
      { status: 500 }
    )
  }
}
