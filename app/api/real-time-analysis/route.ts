import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { content, requirements, grantContext } = await request.json()

    if (!content || !requirements) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate real-time analysis using AI
    const { text: analysis } = await generateText({
      model: "anthropic/claude-3-sonnet-20240229",
      prompt: `
        You are an expert grant writer providing real-time feedback on a grant application.
        
        Grant Context: ${JSON.stringify(grantContext)}
        
        Current Content: ${content}
        
        Requirements to Check: ${JSON.stringify(requirements)}
        
        Provide real-time analysis in this JSON format:
        {
          "overall_score": number (0-100),
          "requirement_updates": [
            {
              "id": "requirement-id",
              "completed": boolean,
              "confidence": number (0-100),
              "matched_content": "relevant excerpt",
              "feedback": "specific improvement suggestion"
            }
          ],
          "live_suggestions": [
            {
              "type": "improvement|missing|strength",
              "message": "specific actionable feedback",
              "priority": "high|medium|low"
            }
          ],
          "next_steps": ["immediate action items"],
          "word_count_analysis": {
            "current": number,
            "recommended_min": number,
            "recommended_max": number,
            "status": "too_short|good|too_long"
          }
        }
        
        Focus on:
        1. Real-time requirement matching
        2. Specific, actionable feedback
        3. Content gaps and strengths
        4. Writing quality and clarity
        5. Alignment with grant priorities
      `,
    })

    let aiAnalysis
    try {
      aiAnalysis = JSON.parse(analysis)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return NextResponse.json({ error: "Failed to parse AI analysis" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analysis: aiAnalysis,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Real-time analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze content" }, { status: 500 })
  }
}
