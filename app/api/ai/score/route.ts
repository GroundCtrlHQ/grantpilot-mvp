import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { applicationId, projectTitle, projectSummary, narrativeText, grantContext } = body

    if (!projectTitle && !projectSummary && !narrativeText) {
      return Response.json({ error: "At least one content field is required" }, { status: 400 })
    }

    const prompt = `You are a federal grant writing expert. Score this grant application narrative 0-100.

Grant Context:
- Agency: ${grantContext.agency || "Not specified"}
- Category: ${grantContext.category || "Not specified"}
- Award Range: ${grantContext.awardRange || "Not specified"}

Content to Score:
Title: ${projectTitle || "Not provided"}
Summary: ${projectSummary || "Not provided"}
Narrative: ${narrativeText || "Not provided"}

Score based on these criteria:
1. Clarity & Structure (0-25): Clear headings, logical flow, appropriate paragraph length, easy to follow
2. Specificity & Evidence (0-25): Concrete numbers, metrics, measurable outcomes, specific examples
3. Alignment (0-25): Matches grant priorities, uses relevant keywords, addresses funding goals
4. Completeness (0-25): All required sections present, comprehensive coverage, meets requirements

Return ONLY valid JSON in this exact format:
{
  "totalScore": number,
  "breakdown": {
    "clarity": number,
    "specificity": number,
    "alignment": number,
    "completeness": number
  },
  "recommendations": ["tip 1", "tip 2", "tip 3"]
}

Make recommendations specific and actionable. Focus on the most impactful improvements.`

    const { text } = await generateText({
      model: "anthropic/claude-3-5-sonnet-20241022",
      prompt,
      temperature: 0.3,
    })

    // Parse the JSON response
    const result = JSON.parse(text)

    // Validate the response structure
    if (!result.totalScore || !result.breakdown || !result.recommendations) {
      throw new Error("Invalid AI response format")
    }

    return Response.json(result)
  } catch (error) {
    console.error("AI scoring error:", error)
    return Response.json({ error: "Failed to score application" }, { status: 500 })
  }
}
