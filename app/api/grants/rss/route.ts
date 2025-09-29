import { NextResponse } from "next/server"

export async function GET() {
  try {
    const rssUrl = "https://www.grants.gov/custom/spoExit.jsp?p=rss/GG_OppModByAgency.xml"

    const response = await fetch(rssUrl, {
      headers: {
        "User-Agent": "GrantPilot/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xmlText = await response.text()

    // Parse XML to extract grant data
    const grants = parseGrantsXML(xmlText)

    return NextResponse.json(grants)
  } catch (error) {
    console.error("Error fetching RSS feed:", error)
    return NextResponse.json({ error: "Failed to fetch grants" }, { status: 500 })
  }
}

function parseGrantsXML(xmlText: string) {
  // Simple XML parsing for grants.gov RSS format
  const grants = []

  // Extract items from RSS feed
  const itemRegex = /<item>(.*?)<\/item>/gs
  const items = xmlText.match(itemRegex) || []

  for (const item of items.slice(0, 50)) {
    // Limit to 50 grants for performance
    try {
      const title = extractXMLValue(item, "title")
      const description = extractXMLValue(item, "description")
      const link = extractXMLValue(item, "link")
      const pubDate = extractXMLValue(item, "pubDate")

      // Extract opportunity number from link or description
      const oppNumberMatch = link.match(/oppId=([^&]+)/) || description.match(/Opportunity Number:\s*([^\s<]+)/)
      const opportunityNumber = oppNumberMatch
        ? oppNumberMatch[1]
        : `OPP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Extract agency from description
      const agencyMatch = description.match(/Agency:\s*([^<\n]+)/)
      const agency = agencyMatch ? agencyMatch[1].trim() : "Federal Agency"

      // Extract close date from description
      const closeDateMatch = description.match(/Close Date:\s*([^<\n]+)/)
      let closeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Default 30 days
      if (closeDateMatch) {
        const parsedDate = new Date(closeDateMatch[1].trim())
        if (!isNaN(parsedDate.getTime())) {
          closeDate = parsedDate.toISOString()
        }
      }

      // Extract award amounts from description
      const awardMatch = description.match(/Award:\s*\$?([\d,]+)\s*-?\s*\$?([\d,]*)/i)
      let awardFloor = null
      let awardCeiling = null
      if (awardMatch) {
        awardFloor = Number.parseInt(awardMatch[1].replace(/,/g, ""))
        if (awardMatch[2]) {
          awardCeiling = Number.parseInt(awardMatch[2].replace(/,/g, ""))
        }
      }

      // Extract category from description
      const categoryMatch = description.match(/Category:\s*([^<\n]+)/)
      const category = categoryMatch ? categoryMatch[1].trim() : null

      grants.push({
        id: crypto.randomUUID(),
        opportunityNumber,
        title: title || "Grant Opportunity",
        agency,
        postedDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        closeDate,
        awardCeiling,
        awardFloor,
        category,
        description: description || "Grant opportunity description",
        detailsUrl: link || "https://grants.gov",
      })
    } catch (error) {
      console.error("Error parsing grant item:", error)
    }
  }

  return grants
}

function extractXMLValue(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, "s")
  const match = xml.match(regex)
  return match ? match[1].trim().replace(/<!\[CDATA\[(.*?)\]\]>/s, "$1") : ""
}
