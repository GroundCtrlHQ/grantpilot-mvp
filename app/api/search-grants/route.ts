import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

function parseDeadlineDate(deadlineText: string): string | null {
  if (!deadlineText || typeof deadlineText !== "string") {
    return null
  }

  // Clean up the deadline text
  const cleanText = deadlineText.trim()

  // Skip obviously invalid dates
  if (
    cleanText.toLowerCase().includes("varies") ||
    cleanText.toLowerCase().includes("rolling") ||
    cleanText.toLowerCase().includes("ongoing") ||
    cleanText.toLowerCase().includes("check website") ||
    cleanText.length < 4
  ) {
    return null
  }

  try {
    // Try to extract a date from the text
    const dateRegex =
      /(\d{1,2}[-/]\d{1,2}[-/]\d{4})|(\d{4}[-/]\d{1,2}[-/]\d{1,2})|(\w+ \d{1,2}, \d{4})|(\d{1,2} \w+ \d{4})/
    const dateMatch = cleanText.match(dateRegex)

    if (dateMatch) {
      const dateStr = dateMatch[0]
      const parsedDate = new Date(dateStr)

      // Check if the date is valid and not in the past (more than 30 days ago)
      if (!isNaN(parsedDate.getTime())) {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        if (parsedDate > thirtyDaysAgo) {
          return parsedDate.toISOString().split("T")[0] // Return YYYY-MM-DD format
        }
      }
    }

    // Try parsing common date formats
    const commonFormats = [
      /(\w+) (\d{1,2}), (\d{4})/, // "January 15, 2024"
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // "01/15/2024"
      /(\d{4})-(\d{1,2})-(\d{1,2})/, // "2024-01-15"
    ]

    for (const format of commonFormats) {
      const match = cleanText.match(format)
      if (match) {
        const testDate = new Date(match[0])
        if (!isNaN(testDate.getTime())) {
          return testDate.toISOString().split("T")[0]
        }
      }
    }
  } catch (error) {
    console.log("[v0] Date parsing error for:", cleanText, error)
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const { query, focusAreas, organizationType } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    console.log("[v0] Starting AI grant search with query:", query)

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const searchQuery = `
      Today's date is ${today}. 
      
      Find current and upcoming federal grant opportunities for ${organizationType || "organizations"} 
      focused on ${focusAreas?.join(", ") || "general purposes"} 
      related to: ${query}
      
      IMPORTANT: Only include grants that are:
      - Currently accepting applications (deadline is in the future)
      - Opening for applications soon (within the next 6 months)
      - Have rolling deadlines or ongoing application periods
      
      DO NOT include grants that have already closed or expired.
      
      Please provide for each grant:
      1. Grant title
      2. Opportunity number (if available)
      3. Funding agency
      4. Application deadline (must be in the future from ${today})
      5. Funding amount range
      6. Brief description (2-3 sentences)
      7. Eligibility requirements
      8. Direct link to grants.gov or agency website
      
      Focus on grants from agencies like NSF, NIH, DOE, EPA, USDA, DOD, and other federal agencies.
      
      Format each grant clearly with labels like "Title:", "Agency:", "Deadline:", etc.
      Always include the grants.gov opportunity number when available.
      Verify that all deadlines are after ${today}.
    `

    console.log("[v0] Calling Perplexity API...")

    if (!process.env.PERPLEXITY_API_KEY) {
      console.log("[v0] Missing Perplexity API key")
      return NextResponse.json(
        {
          error: "Perplexity API key not configured. Please add PERPLEXITY_API_KEY to environment variables.",
        },
        { status: 500 },
      )
    }

    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: `You are a federal grant research assistant. Provide accurate, up-to-date information about federal grant opportunities. 
            Always include direct links to grants.gov or agency websites when available. 
            Format your response clearly with structured information for each grant.
            Focus on grants that are currently accepting applications or will open soon.`,
          },
          {
            role: "user",
            content: searchQuery,
          },
        ],
        max_tokens: 3000,
        temperature: 0.1,
      }),
    })

    console.log("[v0] Perplexity API response status:", perplexityResponse.status)

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text()
      console.log("[v0] Perplexity API error:", errorText)

      return NextResponse.json(
        {
          error: `Perplexity API failed: ${errorText}`,
          details: `Status: ${perplexityResponse.status}`,
        },
        { status: perplexityResponse.status },
      )
    }

    const result = await perplexityResponse.json()
    const aiResponse = result.choices[0]?.message?.content || ""

    console.log("[v0] AI response received, length:", aiResponse.length)

    if (!aiResponse) {
      return NextResponse.json(
        {
          error: "No response from Perplexity API",
        },
        { status: 500 },
      )
    }

    const grants = parseGrantsFromAIResponse(aiResponse)

    console.log("[v0] Parsed grants count:", grants.length)

    if (grants.length === 0) {
      return NextResponse.json(
        {
          error: "No grants found in AI response. The AI may not have found relevant opportunities for your search.",
          aiResponse: aiResponse.substring(0, 500) + "...", // Include partial response for debugging
        },
        { status: 404 },
      )
    }

    // Store found grants in database
    for (const grant of grants) {
      try {
        // Parse the deadline date properly
        const parsedDeadline = parseDeadlineDate(grant.deadline)

        await sql`
          INSERT INTO grants (opp_number, title, agency, description, eligibility, funding_amount, deadline, categories)
          VALUES (${grant.opp_number || "AI-" + Date.now()}, ${grant.title}, ${grant.agency}, ${grant.description}, 
                  ${grant.eligibility}, ${grant.funding_amount}, ${parsedDeadline}, ${grant.categories})
          ON CONFLICT (opp_number) DO NOTHING
        `
      } catch (dbError) {
        console.log("[v0] Database insert error (non-critical):", dbError)
      }
    }

    return NextResponse.json({
      success: true,
      grants,
      source: "Perplexity AI Search",
      message: `Found ${grants.length} relevant grant opportunities`,
    })
  } catch (error) {
    console.error("[v0] Grant search error:", error)
    return NextResponse.json(
      {
        error: "Failed to search for grants",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function parseGrantsFromAIResponse(response: string): any[] {
  console.log("[v0] Parsing AI response...")

  const grants = []
  const sections = response.split(/\n\s*\n/).filter((section) => section.trim())

  for (const section of sections) {
    const lines = section
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
    const grant: any = {
      categories: [],
      source: "AI Search",
    }

    for (const line of lines) {
      const lowerLine = line.toLowerCase()

      if (lowerLine.includes("title:") || lowerLine.includes("grant title:")) {
        grant.title = line.split(":").slice(1).join(":").trim()
      } else if (lowerLine.includes("opportunity number:") || lowerLine.includes("number:")) {
        grant.opp_number = line.split(":").slice(1).join(":").trim()
      } else if (lowerLine.includes("agency:") || lowerLine.includes("funding agency:")) {
        grant.agency = line.split(":").slice(1).join(":").trim()
      } else if (lowerLine.includes("deadline:") || lowerLine.includes("due date:")) {
        grant.deadline = line.split(":").slice(1).join(":").trim()
      } else if (lowerLine.includes("funding:") || lowerLine.includes("amount:")) {
        grant.funding_amount = line.split(":").slice(1).join(":").trim()
      } else if (lowerLine.includes("description:")) {
        grant.description = line.split(":").slice(1).join(":").trim()
      } else if (lowerLine.includes("eligibility:")) {
        grant.eligibility = line.split(":").slice(1).join(":").trim()
      } else if (lowerLine.includes("link:") || lowerLine.includes("url:") || lowerLine.includes("website:")) {
        grant.grant_url = line.split(":").slice(1).join(":").trim()
      }

      // Extract URLs from any line
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/g)
      if (urlMatch && !grant.grant_url) {
        grant.grant_url = urlMatch[0]
      }
    }

    // Only add grants that have at least a title and agency
    if (grant.title && grant.agency) {
      grant.categories = extractCategories(grant.title + " " + (grant.description || ""))

      // Generate grants.gov URL if no direct URL found
      if (!grant.grant_url && grant.opp_number) {
        grant.grant_url = `https://grants.gov/search-results-detail/${grant.opp_number}`
      }

      grants.push(grant)
    }
  }

  console.log("[v0] Successfully parsed", grants.length, "grants")
  return grants
}

// Helper function to parse grants from AI response
function extractCategories(text: string): string[] {
  const categories = []
  const lowerText = text.toLowerCase()

  if (lowerText.includes("education") || lowerText.includes("stem")) categories.push("education")
  if (lowerText.includes("environment") || lowerText.includes("climate")) categories.push("environment")
  if (lowerText.includes("health") || lowerText.includes("medical")) categories.push("health")
  if (lowerText.includes("technology") || lowerText.includes("innovation")) categories.push("technology")
  if (lowerText.includes("community") || lowerText.includes("social")) categories.push("community")
  if (lowerText.includes("research")) categories.push("research")

  return categories.length > 0 ? categories : ["general"]
}
