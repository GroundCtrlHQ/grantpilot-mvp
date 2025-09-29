import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // For prototype, use a default user ID (in production, get from auth)
    const userId = 1

    const result = await sql`
      SELECT sg.id, sg.opp_number as grant_id, sg.interest_level, sg.created_at as saved_at
      FROM saved_grants sg
      WHERE sg.user_id = ${userId}
      ORDER BY sg.created_at DESC
    `

    const savedGrants = result.map((row: any) => ({
      id: row.id.toString(),
      grantId: row.grant_id,
      notes: "",
      savedAt: row.saved_at.toISOString(),
    }))

    return NextResponse.json({ success: true, savedGrants })
  } catch (error) {
    console.error("Error getting saved grants:", error)
    return NextResponse.json({ error: "Failed to get saved grants" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { grantId, notes = "", grantDetails } = await request.json()
    
    // For prototype, use a default user ID (in production, get from auth)
    const userId = 1

    // First, try to get the grant_id from the grants table using opp_number
    let grantResult = await sql`
      SELECT id FROM grants WHERE opp_number = ${grantId}
    `

    let grantDbId
    if (grantResult.length === 0) {
      // Grant doesn't exist in database, create entry with actual grant details
      const title = grantDetails?.title || 'Search Result Grant'
      const agency = grantDetails?.agency || 'Unknown Agency'
      const description = grantDetails?.description || 'Grant from search results'
      const closeDate = grantDetails?.closeDate ? new Date(grantDetails.closeDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      const fundingAmount = grantDetails?.awardCeiling || 0
      const detailsUrl = grantDetails?.detailsUrl || `#grant-${grantId}`
      
      const insertResult = await sql`
        INSERT INTO grants (opp_number, title, agency, description, deadline, funding_amount, status, created_at, details_url)
        VALUES (${grantId}, ${title}, ${agency}, ${description}, ${closeDate}, ${fundingAmount}, 'open', CURRENT_TIMESTAMP, ${detailsUrl})
        RETURNING id
      `
      grantDbId = insertResult[0].id
    } else {
      grantDbId = grantResult[0].id
    }

    await sql`
      INSERT INTO saved_grants (user_id, grant_id, opp_number, interest_level, created_at)
      VALUES (${userId}, ${grantDbId}, ${grantId}, 'interested', CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, grant_id) DO NOTHING
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving grant:", error)
    return NextResponse.json({ error: "Failed to save grant" }, { status: 500 })
  }
}
