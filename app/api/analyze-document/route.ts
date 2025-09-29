import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { applicationId, documentText, grantRequirements } = await request.json()

    if (!applicationId || !documentText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { text: analysis } = await generateText({
      model: "anthropic/claude-3-sonnet-20240229",
      prompt: `
        You are an expert grant writer analyzing a grant application document or grant opportunity announcement. 
        
        Grant Requirements Context: ${grantRequirements || "Standard federal grant requirements"}
        
        Document to analyze: ${documentText}
        
        Please analyze this document and determine if it's:
        1. A grant opportunity announcement (RFP/RFA) - extract requirements for applicants
        2. An existing application draft - evaluate against typical grant requirements
        
        For grant opportunity announcements, focus on:
        - Required application sections and components
        - Evaluation criteria and scoring rubrics  
        - Eligibility requirements
        - Submission requirements and deadlines
        - Budget requirements and restrictions
        - Formatting and page limits
        
        For application drafts, evaluate against:
        - Project Summary/Abstract completeness
        - Statement of Need strength
        - Project Description clarity
        - Goals and Objectives specificity
        - Evaluation Plan adequacy
        - Budget Narrative alignment
        - Organizational Capacity demonstration
        - Sustainability Plan viability
        - Timeline/Work Plan feasibility
        
        Return your analysis as a JSON object with this structure:
        {
          "document_type": "grant_announcement" or "application_draft",
          "requirements": [
            {
              "id": "unique-id",
              "text": "Requirement description",
              "category": "category-name (e.g., 'Project Description', 'Budget', 'Evaluation')",
              "completed": boolean,
              "matched_content": "relevant text from document if found",
              "confidence": number (0-100),
              "suggestions": "specific improvement suggestions",
              "page_limit": "if specified in grant announcement",
              "points_possible": "scoring points if specified"
            }
          ],
          "overall_analysis": {
            "completion_percentage": number,
            "strengths": ["strength1", "strength2"],
            "areas_for_improvement": ["area1", "area2"],
            "next_steps": ["step1", "step2"],
            "compliance_issues": ["issue1", "issue2"] // for grant announcements
          },
          "grant_details": {
            "program_name": "if extractable",
            "funding_agency": "if extractable", 
            "deadline": "if extractable",
            "funding_range": "if extractable"
          }
        }
        
        Be thorough and specific in your analysis. For grant announcements, extract every requirement mentioned. For application drafts, provide actionable feedback for improvement.
      `,
    })

    // Parse the AI response
    let aiAnalysis
    try {
      aiAnalysis = JSON.parse(analysis)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return NextResponse.json({ error: "Failed to parse AI analysis" }, { status: 500 })
    }

    // Store the checklist in the database
    const result = await sql`
      INSERT INTO checklists (application_id, requirements, ai_analysis)
      VALUES (${applicationId}, ${JSON.stringify(aiAnalysis.requirements)}, ${JSON.stringify(aiAnalysis)})
      ON CONFLICT (application_id) 
      DO UPDATE SET 
        requirements = ${JSON.stringify(aiAnalysis.requirements)},
        ai_analysis = ${JSON.stringify(aiAnalysis)},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      checklist: result[0],
      analysis: aiAnalysis,
    })
  } catch (error) {
    console.error("Document analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze document" }, { status: 500 })
  }
}
