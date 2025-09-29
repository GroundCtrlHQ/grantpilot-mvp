import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { grantId: string } }
) {
  try {
    const { grantId } = params
    
    // For prototype, use a default user ID (in production, get from auth)
    const userId = 1

    await sql`
      DELETE FROM saved_grants
      WHERE user_id = ${userId} AND opp_number = ${grantId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing saved grant:", error)
    return NextResponse.json({ error: "Failed to remove saved grant" }, { status: 500 })
  }
}
