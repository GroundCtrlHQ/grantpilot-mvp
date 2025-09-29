import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"

const grantAnalysisSchema = z.object({
  grant_info: z.object({
    program_name: z.string().describe("Name of the grant program"),
    funding_agency: z.string().describe("Name of the funding agency"),
    deadline: z.string().describe("Application deadline date"),
    funding_amount: z.string().describe("Available funding amount or range"),
    eligibility: z.array(z.string()).describe("Eligibility requirements"),
    required_components: z.array(z.string()).describe("Required application components"),
    evaluation_criteria: z.array(z.string()).describe("Evaluation criteria"),
  }),
  application_requirements: z.array(
    z.object({
      section: z.string().describe("Section name"),
      description: z.string().describe("What is required for this section"),
      page_limit: z.string().optional().describe("Page limit if specified"),
      formatting: z.string().optional().describe("Formatting requirements if any"),
    }),
  ),
  key_dates: z
    .array(
      z.object({
        event: z.string().describe("Event name"),
        date: z.string().describe("Date of the event"),
      }),
    )
    .optional(),
  contact_info: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const applicationId = formData.get("applicationId") as string

    if (!file || !applicationId) {
      return NextResponse.json({ error: "Missing file or application ID" }, { status: 400 })
    }

    // Check if it's a PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    console.log("[v0] Processing PDF with Claude native support:", file.name, `(${Math.round(file.size / 1024)} KB)`)

    const { object: analysis } = await generateObject({
      model: "anthropic/claude-sonnet-4",
      schema: grantAnalysisSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this grant application PDF document and extract all relevant information.
              
Focus on identifying:
1. Grant program name and funding agency
2. Application deadline and other key dates
3. Funding amount available
4. Eligibility requirements
5. Required application components
6. Evaluation criteria
7. Submission requirements and formatting
8. Contact information

Be thorough and extract all details that would help an applicant prepare their submission.`,
            },
            {
              type: "file",
              data: base64,
              mediaType: "application/pdf",
              filename: file.name,
            },
          ],
        },
      ],
    })

    console.log("[v0] PDF analysis complete:", {
      program: analysis.grant_info.program_name,
      agency: analysis.grant_info.funding_agency,
      deadline: analysis.grant_info.deadline,
    })

    return NextResponse.json({
      success: true,
      filename: file.name,
      size: file.size,
      analysis: analysis,
    })
  } catch (error) {
    console.error("[v0] PDF processing error:", error)
    return NextResponse.json(
      {
        error: "Failed to process PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
