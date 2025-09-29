import { type NextRequest, NextResponse } from "next/server"
import FirecrawlApp from "@mendable/firecrawl-js"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { grantUrl, opportunityNumber } = await request.json()

    if (!grantUrl) {
      return NextResponse.json({ error: "Grant URL required" }, { status: 400 })
    }

    console.log("[v0] Scraping grant details from:", grantUrl)

    // Initialize Firecrawl
    const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })

    if (!process.env.FIRECRAWL_API_KEY) {
      console.log("[v0] No Firecrawl API key found, returning basic info...")
      return NextResponse.json({
        success: true,
        grantDetails: {
          title: "Grant Opportunity",
          agency: "Federal Agency",
          opportunityNumber: opportunityNumber || "Unknown",
          description: "Grant opportunity details not available without Firecrawl API key.",
          eligibility: ["Please visit the grant URL for full details"],
          requirements: ["Please visit the grant URL for full details"],
          deadline: "Unknown",
          fundingAmount: "Unknown",
          sourceUrl: grantUrl,
          scraped: false
        }
      })
    }

    try {
      // Scrape the grant URL with Firecrawl
      const scrapeResult = await app.scrapeUrl(grantUrl, {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        includeTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'table', 'div', 'span'],
        waitFor: 3000, // Wait 3 seconds for dynamic content
        timeout: 30000, // 30 second timeout
      })

      if (scrapeResult.success && scrapeResult.data) {
        const content = scrapeResult.data.markdown || scrapeResult.data.html
        const metadata = scrapeResult.data.metadata || {}
        
        console.log("[v0] Successfully scraped grant details")

        // Extract structured information from the scraped content
        const grantDetails = extractGrantDetails(content, grantUrl, opportunityNumber, metadata)
        
        return NextResponse.json({
          success: true,
          grantDetails,
          scraped: true,
          sourceUrl: grantUrl
        })
      } else {
        console.log("[v0] Failed to scrape grant URL")
        return NextResponse.json({
          success: true,
          grantDetails: {
            title: "Grant Opportunity",
            agency: "Federal Agency", 
            opportunityNumber: opportunityNumber || "Unknown",
            description: "Unable to scrape grant details. Please visit the grant URL for full information.",
            eligibility: ["Please visit the grant URL for full details"],
            requirements: ["Please visit the grant URL for full details"],
            deadline: "Unknown",
            fundingAmount: "Unknown",
            sourceUrl: grantUrl,
            scraped: false
          }
        })
      }
    } catch (scrapeError) {
      console.error("[v0] Error scraping grant URL:", scrapeError)
      return NextResponse.json({
        success: true,
        grantDetails: {
          title: "Grant Opportunity",
          agency: "Federal Agency",
          opportunityNumber: opportunityNumber || "Unknown", 
          description: "Error scraping grant details. Please visit the grant URL for full information.",
          eligibility: ["Please visit the grant URL for full details"],
          requirements: ["Please visit the grant URL for full details"],
          deadline: "Unknown",
          fundingAmount: "Unknown",
          sourceUrl: grantUrl,
          scraped: false
        }
      })
    }

  } catch (error) {
    console.error("[v0] Error in scrape-grant-details:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to scrape grant details" },
      { status: 500 },
    )
  }
}

// Extract structured grant details from scraped content
function extractGrantDetails(content: string, sourceUrl: string, opportunityNumber?: string, metadata?: any) {
  // Basic extraction logic - you can enhance this with more sophisticated parsing
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  let title = metadata?.title || "Grant Opportunity"
  let agency = "Federal Agency"
  let description = ""
  let eligibility: string[] = []
  let requirements: string[] = []
  let deadline = "Unknown"
  let fundingAmount = "Unknown"

  // Extract title (usually in first h1 or h2)
  const titleMatch = content.match(/<h[12][^>]*>([^<]+)<\/h[12]>/i) || content.match(/^#+\s*(.+)$/m)
  if (titleMatch) {
    title = titleMatch[1].trim()
  }

  // Extract agency (look for common patterns)
  const agencyPatterns = [
    /(?:Department|Agency|Administration|Foundation|Institute|Office)\s+of\s+[^,\n]+/gi,
    /(?:National|Federal|State|Local)\s+[^,\n]+/gi
  ]
  
  for (const pattern of agencyPatterns) {
    const match = content.match(pattern)
    if (match) {
      agency = match[0].trim()
      break
    }
  }

  // Extract description (first substantial paragraph)
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 50)
  if (paragraphs.length > 0) {
    description = paragraphs[0].replace(/<[^>]*>/g, '').trim().substring(0, 500) + "..."
  }

  // Extract eligibility requirements
  const eligibilityKeywords = ['eligibility', 'eligible', 'qualify', 'requirements']
  for (const line of lines) {
    if (eligibilityKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
      if (line.includes('•') || line.includes('-') || line.includes('*')) {
        const items = line.split(/[•\-*]/).filter(item => item.trim().length > 10)
        eligibility.push(...items.map(item => item.trim()))
      }
    }
  }

  // Extract required documents
  const documentKeywords = ['required documents', 'application materials', 'submission requirements']
  for (const line of lines) {
    if (documentKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
      if (line.includes('•') || line.includes('-') || line.includes('*')) {
        const items = line.split(/[•\-*]/).filter(item => item.trim().length > 10)
        requirements.push(...items.map(item => item.trim()))
      }
    }
  }

  // Extract deadline
  const deadlinePatterns = [
    /deadline[:\s]+([^,\n]+)/i,
    /due[:\s]+([^,\n]+)/i,
    /closes[:\s]+([^,\n]+)/i
  ]
  
  for (const pattern of deadlinePatterns) {
    const match = content.match(pattern)
    if (match) {
      deadline = match[1].trim()
      break
    }
  }

  // Extract funding amount
  const fundingPatterns = [
    /\$[\d,]+(?:-\$[\d,]+)?/g,
    /up to \$[\d,]+/gi,
    /maximum of \$[\d,]+/gi
  ]
  
  for (const pattern of fundingPatterns) {
    const match = content.match(pattern)
    if (match) {
      fundingAmount = match[0]
      break
    }
  }

  // Fallback values if nothing found
  if (eligibility.length === 0) {
    eligibility = ["Please visit the grant URL for full eligibility requirements"]
  }
  
  if (requirements.length === 0) {
    requirements = ["Please visit the grant URL for full document requirements"]
  }

  return {
    title,
    agency,
    opportunityNumber: opportunityNumber || "Unknown",
    description,
    eligibility,
    requirements,
    deadline,
    fundingAmount,
    sourceUrl,
    scraped: true,
    scrapedAt: new Date().toISOString()
  }
}
