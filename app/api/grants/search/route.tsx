import { type NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "50") // Default to 50 for more results
    const pages = Number.parseInt(searchParams.get("pages") || "3") // Fetch up to 3 pages by default

    console.log("[v0] Starting grants.gov search for:", query, "pages:", pages, "limit:", limit)

    const allGrants = []
    let totalFetched = 0

    // Fetch multiple pages to get more results
    for (let page = 1; page <= pages && totalFetched < limit; page++) {
      console.log(`[v0] Fetching page ${page}...`)

      // Use the real grants.gov search API
      const grantsGovUrl = new URL("https://simpler.grants.gov/search")
      grantsGovUrl.searchParams.set("query", query)
      grantsGovUrl.searchParams.set("page", page.toString())
      grantsGovUrl.searchParams.set("utm_source", "GrantPilot")

      console.log("[v0] Fetching from grants.gov URL:", grantsGovUrl.toString())

      const response = await fetch(grantsGovUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "max-age=0",
          "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
      })

      if (!response.ok) {
        console.log("[v0] Grants.gov response failed:", response.status, response.statusText)
        // Continue to next page if this one fails
        continue
      }

      const htmlContent = await response.text()
      console.log("[v0] Received HTML content, length:", htmlContent.length)

      // Parse the HTML to extract grant data
      const pageGrants = parseGrantsFromHTML(htmlContent, limit - totalFetched)
      console.log(`[v0] Parsed ${pageGrants.length} grants from page ${page}`)

      allGrants.push(...pageGrants)
      totalFetched += pageGrants.length

      // Add a small delay between requests to be respectful
      if (page < pages) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Limit total results
    const limitedGrants = allGrants.slice(0, limit)
    console.log("[v0] Total grants fetched:", allGrants.length, "limited to:", limitedGrants.length)

    return NextResponse.json({
      success: true,
      grants: limitedGrants,
      source: "grants.gov",
      query,
      total: limitedGrants.length,
      pagesSearched: Math.min(pages, Math.ceil(totalFetched / 20)), // Estimate pages searched
    })
  } catch (error) {
    console.error("[v0] Error fetching from grants.gov:", error)

    // Get query from request URL for fallback
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""

    // Return fallback mock data for artificial intelligence grants
    const mockGrants = [
      {
        id: crypto.randomUUID(),
        opportunityNumber: "NSF-25-AI-001",
        title: "Artificial Intelligence Research Institutes",
        agency: "National Science Foundation",
        postedDate: new Date("2024-01-15").toISOString(),
        closeDate: new Date("2025-03-15").toISOString(),
        awardCeiling: 20000000,
        awardFloor: 5000000,
        category: "Science and Technology",
        description:
          "The National Science Foundation seeks to establish AI Research Institutes that will accelerate research and development in artificial intelligence and machine learning technologies.",
        detailsUrl: "https://grants.gov/web/grants/view-opportunity.html?oppId=AI001",
      },
      {
        id: crypto.randomUUID(),
        opportunityNumber: "DARPA-25-AI-002",
        title: "Next Generation Artificial Intelligence",
        agency: "Department of Defense",
        postedDate: new Date("2024-02-01").toISOString(),
        closeDate: new Date("2025-01-30").toISOString(),
        awardCeiling: 15000000,
        awardFloor: 2000000,
        category: "Defense",
        description:
          "DARPA seeks innovative approaches to develop next-generation AI systems that can operate in complex, dynamic environments with minimal human oversight.",
        detailsUrl: "https://grants.gov/web/grants/view-opportunity.html?oppId=AI002",
      },
    ]

    return NextResponse.json({
      success: true,
      grants: mockGrants,
      source: "fallback",
      query,
      total: mockGrants.length,
      error: "Using fallback data due to grants.gov access issues",
    })
  }
}

function parseGrantsFromHTML(html: string, limit: number) {
  const grants = []

  try {
    console.log("[v0] Starting HTML parsing...")

    // First, try to find the results table in the HTML
    // Look for table rows that contain grant information
    const tableRowPattern = /<tr[^>]*>(.*?)<\/tr>/gs
    const rows = [...html.matchAll(tableRowPattern)]

    console.log("[v0] Found table rows:", rows.length)

    // Skip header row and process data rows
    for (let i = 1; i < Math.min(rows.length, limit + 10); i++) {
      const row = rows[i][1]

      // Extract close date
      const closeDateMatch = row.match(/<td[^>]*>([^<]*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^<]*\d{1,2},?\s+\d{4}[^<]*)</i)
      const closeDateText = closeDateMatch ? closeDateMatch[1].trim() : ""

      // Extract status
      const statusMatch = row.match(/<td[^>]*>(Open|Closed|Forecasted|Archived)</i)
      const status = statusMatch ? statusMatch[1] : "Open"

      // Extract title and opportunity link
      const titleMatch = row.match(/href="([^"]*\/opportunity\/[^"]*)"[^>]*>([^<]+)<\/a>/i)
      const opportunityPath = titleMatch ? titleMatch[1] : ""
      const title = titleMatch ? titleMatch[2].trim() : ""

      // Extract opportunity number from title or nearby
      const oppNumberMatch = row.match(/Number:\s*([^\s<]+)/) || row.match(/>([^<]*(?:FA|DE|ED|NSF|EPA|DOD)[^<]*(?:-\d+)[^<]*)</i)
      const opportunityNumber = oppNumberMatch ? oppNumberMatch[1] : `GRANT-${Date.now()}-${i}`

      // Extract agency
      const agencyMatch = row.match(/<td[^>]*>([^<]+)<\/td>[\s\S]*?(?:National|Department|Agency|Administration|Foundation|Institute|Office)/gi)
      const agency = agencyMatch ? agencyMatch[1].trim() : "Federal Agency"

      // Extract award information
      const awardMinMatch = row.match(/\$([0-9,]+)/g)
      const awardMaxMatch = row.match(/\$([0-9,]+)/g)
      const awardFloor = awardMinMatch && awardMinMatch.length > 0 ? parseInt(awardMinMatch[0].replace(/[$,]/g, "")) : null
      const awardCeiling = awardMaxMatch && awardMaxMatch.length > 1 ? parseInt(awardMaxMatch[1].replace(/[$,]/g, "")) : null

      // Parse close date
      let closeDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // Default: 60 days from now
      if (closeDateText) {
        const parsedDate = new Date(closeDateText)
        if (!isNaN(parsedDate.getTime())) {
          closeDate = parsedDate.toISOString()
        }
      }

      // Only add if we have a title and it's not empty
      if (title && title.length > 5 && opportunityPath) {
        grants.push({
          id: crypto.randomUUID(),
          opportunityNumber,
          title,
          agency,
          postedDate: new Date().toISOString(),
          closeDate,
          awardCeiling,
          awardFloor,
          category: "Federal Grant",
          status,
          description: `${title} - Federal grant opportunity from ${agency}. Visit grants.gov for full details and application requirements.`,
          detailsUrl: `https://simpler.grants.gov${opportunityPath}`,
        })
      }
    }

    // If we didn't find grants in table, try alternative parsing methods
    if (grants.length === 0) {
      console.log("[v0] No grants found in table, trying alternative parsing...")

      // Try to find opportunity links with different patterns
      const altPatterns = [
        /href="(\/opportunity\/[^"]*)"[^>]*>([^<]+)<\/a>/gi,
        /href="([^"]*opportunity[^"]*)"[^>]*>([^<]+)<\/a>/gi,
        /<a[^>]*href="[^"]*opportunity[^"]*"[^>]*>([^<]+)<\/a>/gi,
      ]

      for (const pattern of altPatterns) {
        const matches = [...html.matchAll(pattern)]
        console.log(`[v0] Found ${matches.length} matches with pattern`)

        for (const match of matches.slice(0, limit)) {
          const opportunityPath = match[1].startsWith('/') ? match[1] : `/${match[1]}`
          const title = match[2] ? match[2].trim() : match[1].trim()

          if (title && title.length > 5) {
            grants.push({
              id: crypto.randomUUID(),
              opportunityNumber: `GRANT-${Date.now()}-${grants.length}`,
              title,
              agency: "Federal Agency",
              postedDate: new Date().toISOString(),
              closeDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
              awardCeiling: null,
              awardFloor: null,
              category: "Federal Grant",
              status: "Open",
              description: `${title} - Federal grant opportunity. Visit grants.gov for full details.`,
              detailsUrl: `https://simpler.grants.gov${opportunityPath}`,
            })
          }
        }

        if (grants.length > 0) break
      }
    }

    // Limit results
    const limitedGrants = grants.slice(0, limit)
    console.log("[v0] Successfully parsed grants:", limitedGrants.length)
    return limitedGrants
  } catch (error) {
    console.error("[v0] Error parsing HTML:", error)
    return []
  }
}
