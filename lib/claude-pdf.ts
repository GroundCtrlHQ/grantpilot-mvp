import { generateObject, generateText } from "ai"
import { z } from "zod"

/**
 * Convert a File object to base64 string for Claude API
 */
export async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  return Buffer.from(arrayBuffer).toString("base64")
}

/**
 * Analyze a grant PDF document and extract structured information
 */
export async function analyzeGrantPDF(file: File) {
  const base64 = await fileToBase64(file)

  const grantSchema = z.object({
    program_name: z.string(),
    funding_agency: z.string(),
    deadline: z.string(),
    funding_amount: z.string(),
    eligibility: z.array(z.string()),
    required_components: z.array(z.string()),
    evaluation_criteria: z.array(z.string()),
    key_requirements: z.array(z.string()),
  })

  const { object } = await generateObject({
    model: "anthropic/claude-sonnet-4",
    schema: grantSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract key grant information from this PDF document.",
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

  return object
}

/**
 * Extract text content from a PDF using Claude
 */
export async function extractPDFText(file: File): Promise<string> {
  const base64 = await fileToBase64(file)

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all text content from this PDF document. Return only the extracted text without any additional commentary.",
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

  return text
}

/**
 * Compare a grant application draft against grant requirements
 */
export async function compareApplicationToRequirements(applicationPDF: File, requirementsPDF: File) {
  const appBase64 = await fileToBase64(applicationPDF)
  const reqBase64 = await fileToBase64(requirementsPDF)

  const comparisonSchema = z.object({
    completeness_score: z.number().min(0).max(100),
    missing_sections: z.array(z.string()),
    suggestions: z.array(z.string()),
    strengths: z.array(z.string()),
    areas_for_improvement: z.array(z.string()),
  })

  const { object } = await generateObject({
    model: "anthropic/claude-sonnet-4",
    schema: comparisonSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Compare this grant application draft against the grant requirements. Identify what's missing, what's done well, and provide specific suggestions for improvement.",
          },
          {
            type: "text",
            text: "Grant Requirements Document:",
          },
          {
            type: "file",
            data: reqBase64,
            mediaType: "application/pdf",
            filename: requirementsPDF.name,
          },
          {
            type: "text",
            text: "Application Draft:",
          },
          {
            type: "file",
            data: appBase64,
            mediaType: "application/pdf",
            filename: applicationPDF.name,
          },
        ],
      },
    ],
  })

  return object
}

/**
 * Answer questions about a PDF document
 */
export async function askAboutPDF(file: File, question: string): Promise<string> {
  const base64 = await fileToBase64(file)

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: question,
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

  return text
}
