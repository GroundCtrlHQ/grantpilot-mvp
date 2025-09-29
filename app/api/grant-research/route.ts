import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { grantTitle, grantAgency, grantDescription, opportunityNumber } = await request.json()
    
    if (!grantTitle || !grantAgency) {
      return NextResponse.json({ error: "Grant title and agency are required" }, { status: 400 })
    }

    // Create a comprehensive search query for Perplexity
    const searchQuery = `Find comprehensive information about the grant "${grantTitle}" by ${grantAgency} (Opportunity Number: ${opportunityNumber}). Include: 1) Detailed eligibility requirements, 2) Application process and deadlines, 3) Required documents and materials, 4) Evaluation criteria, 5) Previous awardees or success stories, 6) Tips for writing a competitive application, 7) Common mistakes to avoid, 8) Contact information for questions, 9) Related funding opportunities, 10) Recent changes or updates to the program. Focus on actionable information that would help an applicant prepare a strong proposal.`

    // For now, we'll return a structured response that simulates what Perplexity would return
    // In production, you would integrate with the actual Perplexity API
    const researchResults = {
      grantTitle,
      grantAgency,
      opportunityNumber,
      searchQuery,
      researchData: {
        eligibilityRequirements: [
          "Non-profit organizations with 501(c)(3) status",
          "Educational institutions (K-12 and higher education)",
          "Government agencies and tribal organizations",
          "Minimum 2 years of operational history",
          "Demonstrated experience in educational technology implementation"
        ],
        applicationProcess: [
          "Submit Letter of Intent (LOI) by [date]",
          "Full application deadline: [date]",
          "Peer review process: 4-6 weeks",
          "Award notification: [date]",
          "Project start date: [date]"
        ],
        requiredDocuments: [
          "Project narrative (max 10 pages)",
          "Budget justification",
          "Organizational capacity statement",
          "Letters of support from partners",
          "Resumes of key personnel",
          "Financial statements (audited preferred)"
        ],
        evaluationCriteria: [
          "Innovation and creativity (25%)",
          "Feasibility and implementation plan (25%)",
          "Impact on student outcomes (25%)",
          "Organizational capacity (15%)",
          "Budget reasonableness (10%)"
        ],
        applicationTips: [
          "Clearly define the problem you're solving",
          "Provide specific, measurable outcomes",
          "Include detailed implementation timeline",
          "Demonstrate strong partnerships",
          "Show sustainability beyond grant period"
        ],
        commonMistakes: [
          "Vague or unclear project descriptions",
          "Unrealistic budgets or timelines",
          "Lack of measurable outcomes",
          "Insufficient organizational capacity",
          "Missing required documentation"
        ],
        contactInfo: {
          programManager: "Dr. Sarah Johnson",
          email: "sarah.johnson@ed.gov",
          phone: "(202) 555-0123",
          officeHours: "Monday-Friday, 9 AM - 5 PM EST"
        },
        relatedOpportunities: [
          "STEM Education Innovation Grants",
          "Digital Learning Initiative",
          "Teacher Professional Development Fund"
        ],
        recentUpdates: [
          "Increased maximum award amount to $500,000",
          "Extended application deadline by 30 days",
          "Added priority for rural and underserved communities",
          "New requirement for data privacy compliance"
        ]
      },
      searchTimestamp: new Date().toISOString(),
      source: "perplexity_simulation"
    }

    return NextResponse.json({ 
      success: true, 
      research: researchResults 
    })
  } catch (error) {
    console.error("Error conducting grant research:", error)
    return NextResponse.json({ error: "Failed to conduct grant research" }, { status: 500 })
  }
}
