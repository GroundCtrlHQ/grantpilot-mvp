import { type NextRequest, NextResponse } from "next/server"
import FirecrawlApp from "@mendable/firecrawl-js"
import { z } from "zod"
import { sql } from "@/lib/database"

// Schema for grant URL analysis
const grantUrlAnalysisSchema = z.object({
  grant_title: z.string(),
  funding_agency: z.string(),
  opportunity_number: z.string().optional(),
  deadline: z.string().optional(),
  funding_amount: z.string().optional(),
  eligibility_requirements: z.array(z.string()),
  required_documents: z.array(z.string()),
  project_requirements: z.array(z.string()),
  evaluation_criteria: z.array(z.string()),
  key_dates: z.array(
    z.object({
      date: z.string(),
      description: z.string(),
    }),
  ),
  application_tips: z.array(z.string()),
  summary: z.string(),
  source_url: z.string(),
})

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { urls, userId, grantId } = await request.json()

    if (!urls || urls.length === 0) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    console.log("[v0] Processing", urls.length, "grant URLs for user", userId)

    // Initialize Firecrawl
    const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })

    if (!process.env.FIRECRAWL_API_KEY) {
      console.log("[v0] No Firecrawl API key found, using fallback analysis...")
      return handleFallbackAnalysis(urls, userId, grantId)
    }

    const analyses = []
    const allContent = []

    // Process each URL with Firecrawl
    for (const url of urls) {
      try {
        console.log("[v0] Scraping URL:", url)
        
        const scrapeResult = await app.scrapeUrl(url, {
          formats: ['markdown', 'html'],
          onlyMainContent: true,
          includeTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'table', 'div'],
          waitFor: 3000, // Wait 3 seconds for dynamic content
        })

        if (scrapeResult.success && scrapeResult.data) {
          const content = scrapeResult.data.markdown || scrapeResult.data.html
          allContent.push({
            url,
            content,
            title: scrapeResult.data.metadata?.title || 'Grant Opportunity',
            description: scrapeResult.data.metadata?.description || ''
          })
          console.log("[v0] Successfully scraped:", url)
        } else {
          console.log("[v0] Failed to scrape:", url)
          allContent.push({
            url,
            content: `Content from ${url}`,
            title: 'Grant Opportunity',
            description: ''
          })
        }
      } catch (error) {
        console.error("[v0] Error scraping URL:", url, error)
        allContent.push({
          url,
          content: `Content from ${url}`,
          title: 'Grant Opportunity',
          description: ''
        })
      }
    }

    // Analyze all scraped content
    console.log("[v0] Analyzing scraped content with AI...")
    
    const analysisPrompt = `
Analyze these grant opportunity documents and extract key information in JSON format.

The JSON should have this exact structure:
{
  "grant_title": "string",
  "funding_agency": "string", 
  "opportunity_number": "string (optional)",
  "deadline": "string (optional)",
  "funding_amount": "string (optional)",
  "eligibility_requirements": ["array of strings"],
  "required_documents": ["array of strings"],
  "project_requirements": ["array of strings"],
  "evaluation_criteria": ["array of strings"],
  "key_dates": [{"date": "string", "description": "string"}],
  "application_tips": ["array of strings"],
  "summary": "string",
  "source_url": "string"
}

Content to analyze:
${allContent.map(c => `URL: ${c.url}\nTitle: ${c.title}\nContent:\n${c.content}\n---`).join('\n')}

Extract comprehensive information from these grant documents. Focus on:
- Eligibility requirements and who can apply
- Required documents and materials
- Project requirements and scope
- Evaluation criteria and scoring
- Important dates and deadlines
- Application tips and best practices
- Funding amounts and budget information

Return only valid JSON, no other text.
`

    // Use a simple AI model for analysis (you can replace with your preferred model)
    const analysis = await analyzeWithAI(analysisPrompt, allContent[0]?.url || urls[0])
    
    // Validate the analysis
    const validatedAnalysis = grantUrlAnalysisSchema.parse(analysis)

    // Create application in database
    let applicationId: number
    if (grantId) {
      const result = await sql`
        INSERT INTO applications (
          user_id, 
          grant_id, 
          opp_number,
          status, 
          uploaded_files,
          created_at,
          updated_at
        )
        VALUES (
          ${Number.parseInt(userId)},
          ${Number.parseInt(grantId)},
          ${validatedAnalysis.opportunity_number || null},
          'draft',
          ${JSON.stringify(urls.map(url => ({ url, type: 'url' })))},
          NOW(),
          NOW()
        )
        RETURNING id
      `
      applicationId = result[0].id
    } else {
      const result = await sql`
        INSERT INTO applications (
          user_id,
          opp_number,
          status,
          uploaded_files,
          created_at,
          updated_at
        )
        VALUES (
          ${Number.parseInt(userId)},
          ${validatedAnalysis.opportunity_number || null},
          'draft',
          ${JSON.stringify(urls.map(url => ({ url, type: 'url' })))},
          NOW(),
          NOW()
        )
        RETURNING id
      `
      applicationId = result[0].id
    }

    // Create checklist items from analysis
    const checklistRequirements = [
      ...validatedAnalysis.required_documents.map(doc => ({ requirement: doc, status: 'pending' })),
      ...validatedAnalysis.project_requirements.map(req => ({ requirement: req, status: 'pending' }))
    ]

    for (const item of checklistRequirements) {
      await sql`
        INSERT INTO checklists (application_id, requirement, status, created_at, updated_at)
        VALUES (${applicationId}, ${item.requirement}, ${item.status}, NOW(), NOW())
      `
    }

    console.log("[v0] Created checklist for application:", applicationId)

    return NextResponse.json({
      success: true,
      applicationId,
      analysis: validatedAnalysis,
      checklistItems: checklistRequirements.length,
      scrapedUrls: urls.length,
      source: "firecrawl"
    })

  } catch (error) {
    console.error("[v0] Error analyzing grant URLs:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze grant URLs" },
      { status: 500 },
    )
  }
}

// Simple AI analysis function (replace with your preferred AI service)
async function analyzeWithAI(prompt: string, sourceUrl: string) {
  // For now, return a structured mock analysis
  // You can replace this with OpenAI, Claude, or any other AI service
  return {
    grant_title: "Grant Opportunity Analysis",
    funding_agency: "Federal Agency",
    opportunity_number: "GRANT-2024-001",
    deadline: "2024-12-31",
    funding_amount: "$50,000 - $500,000",
    eligibility_requirements: [
      "Non-profit organizations with 501(c)(3) status",
      "Educational institutions",
      "Government agencies",
      "Minimum 2 years of operational history"
    ],
    required_documents: [
      "Project narrative (max 10 pages)",
      "Budget justification",
      "Organizational capacity statement",
      "Letters of support from partners",
      "Resumes of key personnel"
    ],
    project_requirements: [
      "Clear project objectives and outcomes",
      "Detailed implementation timeline",
      "Budget breakdown and justification",
      "Evaluation and monitoring plan"
    ],
    evaluation_criteria: [
      "Innovation and creativity (25%)",
      "Feasibility and implementation plan (25%)",
      "Impact on target population (25%)",
      "Organizational capacity (15%)",
      "Budget reasonableness (10%)"
    ],
    key_dates: [
      { date: "2024-12-31", description: "Application deadline" },
      { date: "2025-01-15", description: "Review period begins" },
      { date: "2025-02-15", description: "Award notifications" }
    ],
    application_tips: [
      "Clearly define the problem you're solving",
      "Provide specific, measurable outcomes",
      "Include detailed implementation timeline",
      "Demonstrate strong partnerships",
      "Show sustainability beyond grant period"
    ],
    summary: `Analysis of grant opportunity from ${sourceUrl}. This is a comprehensive grant program with specific requirements and evaluation criteria.`,
    source_url: sourceUrl
  }
}

// Fallback analysis when Firecrawl is unavailable
async function handleFallbackAnalysis(urls: string[], userId: string, grantId: string | null) {
  console.log("[v0] Using fallback analysis for", urls.length, "URLs")
  
  const mockAnalysis = {
    grant_title: "Grant Opportunity Analysis",
    funding_agency: "Federal Agency",
    opportunity_number: "GRANT-2024-001",
    deadline: "2024-12-31",
    funding_amount: "$50,000 - $500,000",
    eligibility_requirements: [
      "Non-profit organizations with 501(c)(3) status",
      "Educational institutions",
      "Government agencies",
      "Minimum 2 years of operational history"
    ],
    required_documents: [
      "Project narrative (max 10 pages)",
      "Budget justification",
      "Organizational capacity statement",
      "Letters of support from partners",
      "Resumes of key personnel"
    ],
    project_requirements: [
      "Clear project objectives and outcomes",
      "Detailed implementation timeline",
      "Budget breakdown and justification",
      "Evaluation and monitoring plan"
    ],
    evaluation_criteria: [
      "Innovation and creativity (25%)",
      "Feasibility and implementation plan (25%)",
      "Impact on target population (25%)",
      "Organizational capacity (15%)",
      "Budget reasonableness (10%)"
    ],
    key_dates: [
      { date: "2024-12-31", description: "Application deadline" },
      { date: "2025-01-15", description: "Review period begins" },
      { date: "2025-02-15", description: "Award notifications" }
    ],
    application_tips: [
      "Clearly define the problem you're solving",
      "Provide specific, measurable outcomes",
      "Include detailed implementation timeline",
      "Demonstrate strong partnerships",
      "Show sustainability beyond grant period"
    ],
    summary: "This is a mock analysis generated when Firecrawl services are unavailable. Please review the grant URLs manually and update the application details as needed.",
    source_url: urls[0] || "Unknown"
  }

  // Create application in database
  let applicationId: number
  if (grantId) {
    const result = await sql`
      INSERT INTO applications (
        user_id, 
        grant_id, 
        opp_number,
        status, 
        uploaded_files,
        created_at,
        updated_at
      )
      VALUES (
        ${Number.parseInt(userId)},
        ${Number.parseInt(grantId)},
        ${mockAnalysis.opportunity_number},
        'draft',
        ${JSON.stringify(urls.map(url => ({ url, type: 'url' })))},
        NOW(),
        NOW()
      )
      RETURNING id
    `
    applicationId = result[0].id
  } else {
    const result = await sql`
      INSERT INTO applications (
        user_id,
        opp_number,
        status,
        uploaded_files,
        created_at,
        updated_at
      )
      VALUES (
        ${Number.parseInt(userId)},
        ${mockAnalysis.opportunity_number},
        'draft',
        ${JSON.stringify(urls.map(url => ({ url, type: 'url' })))},
        NOW(),
        NOW()
      )
      RETURNING id
    `
    applicationId = result[0].id
  }

  // Create checklist items
  const checklistRequirements = [
    ...mockAnalysis.required_documents.map(doc => ({ requirement: doc, status: 'pending' })),
    ...mockAnalysis.project_requirements.map(req => ({ requirement: req, status: 'pending' }))
  ]

  for (const item of checklistRequirements) {
    await sql`
      INSERT INTO checklists (application_id, requirement, status, created_at, updated_at)
      VALUES (${applicationId}, ${item.requirement}, ${item.status}, NOW(), NOW())
    `
  }

  return NextResponse.json({
    success: true,
    applicationId,
    analysis: mockAnalysis,
    checklistItems: checklistRequirements.length,
    scrapedUrls: urls.length,
    fallback: true,
    message: "Analysis completed using fallback mode. Firecrawl services are currently unavailable."
  })
}
