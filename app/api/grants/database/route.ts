import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100")
    const query = searchParams.get("query") || ""

    let result
    if (query) {
      result = await sql`
        SELECT 
          id,
          opp_number as "opportunityNumber",
          title,
          agency,
          description,
          deadline as "closeDate",
          funding_amount as "fundingAmount",
          status,
          created_at as "postedDate",
          details_url as "detailsUrl"
        FROM grants 
        WHERE title ILIKE ${`%${query}%`} 
           OR agency ILIKE ${`%${query}%`} 
           OR description ILIKE ${`%${query}%`}
           OR opp_number ILIKE ${`%${query}%`}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    } else {
      result = await sql`
        SELECT 
          id,
          opp_number as "opportunityNumber",
          title,
          agency,
          description,
          deadline as "closeDate",
          funding_amount as "fundingAmount",
          status,
          created_at as "postedDate",
          details_url as "detailsUrl"
        FROM grants 
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    }

    const grants = result.map((grant: any) => ({
      id: grant.id.toString(),
      opportunityNumber: grant.opportunityNumber,
      title: grant.title,
      agency: grant.agency,
      description: grant.description,
      closeDate: grant.closeDate ? grant.closeDate.toISOString() : null,
      awardCeiling: null,
      awardFloor: null,
      fundingAmount: grant.fundingAmount,
      postedDate: grant.postedDate.toISOString(),
      category: "Database Grant",
      status: grant.status || "Open",
      detailsUrl: grant.detailsUrl || null
    }))

    return NextResponse.json({ 
      success: true, 
      grants,
      source: "database",
      total: grants.length
    })
  } catch (error) {
    console.error("Error getting grants from database:", error)
    return NextResponse.json({ error: "Failed to get grants from database" }, { status: 500 })
  }
}
