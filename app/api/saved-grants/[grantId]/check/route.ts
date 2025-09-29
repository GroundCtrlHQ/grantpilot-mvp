import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(
  request: NextRequest,
  { params }: { params: { grantId: string } }
) {
  try {
    const { grantId } = params
    
    // For prototype, use a default user ID (in production, get from auth)
    const userId = 1

    const result = await sql`
      SELECT COUNT(*) as count
      FROM saved_grants
      WHERE user_id = ${userId} AND opp_number = ${grantId}
    `

    const isSaved = result[0].count > 0

    return NextResponse.json({ success: true, isSaved })
  } catch (error) {
    console.error("Error checking if grant is saved:", error)
    return NextResponse.json({ error: "Failed to check if grant is saved" }, { status: 500 })
  }
}
