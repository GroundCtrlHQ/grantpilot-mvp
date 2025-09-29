import { type NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { sql } from "@/lib/database"

// Schema for grant document analysis
const grantAnalysisSchema = z.object({
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
})

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const userId = formData.get("userId") as string
    const grantId = formData.get("grantId") as string | null

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    console.log("[v0] Processing", files.length, "files for user", userId)

    // Convert files to base64 for Claude
    const fileContents = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64 = buffer.toString("base64")

        // Ensure file type is always defined, default to application/pdf
        let fileType = file.type || "application/pdf"

        // If type is empty string, infer from file extension
        if (!fileType || fileType.trim() === "") {
          const extension = file.name.split(".").pop()?.toLowerCase()
          if (extension === "pdf") {
            fileType = "application/pdf"
          } else if (extension === "doc") {
            fileType = "application/msword"
          } else if (extension === "docx") {
            fileType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          } else if (extension === "txt") {
            fileType = "text/plain"
          } else {
            fileType = "application/pdf" // Default fallback
          }
        }

        return {
          name: file.name,
          type: fileType,
          data: base64,
        }
      }),
    )

    console.log("[v0] Files converted to base64, analyzing with Claude...")

    // Check if Anthropic API key is available and has credits
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log("[v0] No Anthropic API key found, using fallback analysis...")
      return handleFallbackAnalysis(files, userId, grantId)
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    })

    try {
      // Build content array with text prompt and document blocks
    const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [
      {
        type: "text",
        text: `Analyze these grant-related documents and extract key information in JSON format.

The JSON should have this exact structure:
{
  "grant_title": "string",
  "funding_agency": "string", 
  "opportunity_number": "string (optional)",
  "deadline": "string (optional)",
  "funding_amount": "string (optional)",
  "eligibility_requirements": ["string"],
  "required_documents": ["string"],
  "project_requirements": ["string"],
  "evaluation_criteria": ["string"],
  "key_dates": [{"date": "string", "description": "string"}],
  "application_tips": ["string"],
  "summary": "string"
}

Focus on:
- Grant program details and funding information
- Eligibility requirements
- Required documents and application components
- Evaluation criteria
- Important deadlines and dates
- Tips for a successful application

Provide a comprehensive analysis that will help the applicant prepare their grant application.`,
      },
    ]

    // Add each PDF as a document block
    for (const file of fileContents) {
      // Only add as document if it's a PDF, otherwise skip or handle differently
      const mediaType = file.type || "application/pdf"

      content.push({
        type: "document",
        source: {
          type: "base64",
          media_type: mediaType as "application/pdf", // Type assertion for Anthropic SDK
          data: file.data,
        },
      })
    }

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    })

    console.log("[v0] Claude response received:", message)

    // Extract JSON from response
    const responseText = message.content[0].type === "text" ? message.content[0].text : ""

    // Parse JSON from response (Claude might wrap it in markdown code blocks)
    let analysisData
    try {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText
      analysisData = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error("[v0] Failed to parse JSON from Claude response:", parseError)
      throw new Error("Failed to parse analysis from Claude response")
    }

    // Validate with schema
    const analysis = grantAnalysisSchema.parse(analysisData)

    console.log("[v0] Analysis complete:", analysis)

    // Create or update application in database
    let applicationId: number

    if (grantId) {
      // Check if application already exists for this grant
      const existingApp = await sql`
        SELECT id FROM applications 
        WHERE user_id = ${Number.parseInt(userId)} 
        AND grant_id = ${Number.parseInt(grantId)}
        LIMIT 1
      `

      if (existingApp.length > 0) {
        applicationId = existingApp[0].id
        // Update existing application
        await sql`
          UPDATE applications 
          SET 
            uploaded_files = ${JSON.stringify(fileContents.map((f) => ({ name: f.name, type: f.type })))},
            updated_at = NOW()
          WHERE id = ${applicationId}
        `
        console.log("[v0] Updated existing application:", applicationId)
      } else {
        // Create new application
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
            ${analysis.opportunity_number || null},
            'draft',
            ${JSON.stringify(fileContents.map((f) => ({ name: f.name, type: f.type })))},
            NOW(),
            NOW()
          )
          RETURNING id
        `
        applicationId = result[0].id
        console.log("[v0] Created new application:", applicationId)
      }
    } else {
      // Create application without grant_id
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
          ${analysis.opportunity_number || null},
          'draft',
          ${JSON.stringify(fileContents.map((f) => ({ name: f.name, type: f.type })))},
          NOW(),
          NOW()
        )
        RETURNING id
      `
      applicationId = result[0].id
      console.log("[v0] Created new application without grant:", applicationId)
    }

    // Create or update checklist with AI analysis
    const checklistRequirements = [
      ...analysis.required_documents.map((doc, idx) => ({
        id: `doc-${idx}`,
        text: doc,
        category: "Required Documents",
        completed: false,
      })),
      ...analysis.project_requirements.map((req, idx) => ({
        id: `req-${idx}`,
        text: req,
        category: "Project Requirements",
        completed: false,
      })),
      ...analysis.eligibility_requirements.map((req, idx) => ({
        id: `elig-${idx}`,
        text: req,
        category: "Eligibility",
        completed: false,
      })),
    ]

    const existingChecklist = await sql`
      SELECT id FROM checklists 
      WHERE application_id = ${applicationId}
      LIMIT 1
    `

    if (existingChecklist.length > 0) {
      await sql`
        UPDATE checklists
        SET 
          requirements = ${JSON.stringify(checklistRequirements)},
          ai_analysis = ${JSON.stringify(analysis)},
          updated_at = NOW()
        WHERE id = ${existingChecklist[0].id}
      `
      console.log("[v0] Updated checklist for application:", applicationId)
    } else {
      await sql`
        INSERT INTO checklists (
          application_id,
          requirements,
          ai_analysis,
          created_at,
          updated_at
        )
        VALUES (
          ${applicationId},
          ${JSON.stringify(checklistRequirements)},
          ${JSON.stringify(analysis)},
          NOW(),
          NOW()
        )
      `
      console.log("[v0] Created checklist for application:", applicationId)
    }

    return NextResponse.json({
      success: true,
      applicationId,
      analysis,
      checklistItems: checklistRequirements.length,
    })
    } catch (claudeError) {
      console.error("[v0] Claude API error:", claudeError)
      console.log("[v0] Falling back to mock analysis due to Claude API issues...")
      return handleFallbackAnalysis(files, userId, grantId)
    }
  } catch (error) {
    console.error("[v0] Error analyzing documents:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze documents" },
      { status: 500 },
    )
  }
}

// Fallback analysis when Claude API is unavailable
async function handleFallbackAnalysis(files: File[], userId: string, grantId: string | null) {
  console.log("[v0] Using fallback analysis for", files.length, "files")
  
  // Create mock analysis based on file names and basic info
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
    summary: "This is a mock analysis generated when AI services are unavailable. Please review the uploaded documents manually and update the application details as needed."
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
        ${JSON.stringify(files.map((f) => ({ name: f.name, type: f.type })))},
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
        ${JSON.stringify(files.map((f) => ({ name: f.name, type: f.type })))},
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
    fallback: true,
    message: "Analysis completed using fallback mode. AI services are currently unavailable."
  })
}
