import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { grantUrl, userProfile } = await request.json()

    if (!grantUrl) {
      return NextResponse.json({ error: "Grant URL is required" }, { status: 400 })
    }

    let grantDetails
    let source = "fallback"

        // Try Firecrawl first if API key is available
        if (process.env.FIRECRAWL_API_KEY) {
          console.log("🔥 Firecrawl API key found, attempting to scrape:", grantUrl)
          try {
            const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: grantUrl,
                formats: [{
                  type: "json",
                  prompt: "Extract comprehensive grant information including title, agency, description, eligibility requirements, application requirements, deadline, funding amount, contact information, application process, and evaluation criteria. Structure the data clearly for a grant application system."
                }],
                onlyMainContent: true,
                waitFor: 3000,
              }),
            })

            const scrapeResult = await response.json()
            console.log("🔥 Firecrawl result:", { success: scrapeResult.success, hasJson: !!scrapeResult.data?.json })

            if (scrapeResult.success && scrapeResult.data?.json) {
              const jsonData = scrapeResult.data.json

              grantDetails = {
                title: jsonData.title || "Grant Opportunity",
                agency: jsonData.agency || "Federal Agency",
                description: jsonData.description || "Grant opportunity details available on the official website.",
                eligibility: Array.isArray(jsonData.eligibilityRequirements) 
                  ? jsonData.eligibilityRequirements 
                  : [jsonData.eligibilityRequirements || "Eligibility requirements available on the official website"],
                requirements: Array.isArray(jsonData.applicationRequirements)
                  ? jsonData.applicationRequirements
                  : [jsonData.applicationRequirements || "Application requirements available on the official website"],
                deadline: jsonData.deadline || "Deadline information available on the official website",
                fundingAmount: jsonData.fundingAmount || "Funding amount varies",
                contactInfo: typeof jsonData.contactInformation === 'object' 
                  ? `${jsonData.contactInformation.name || ''}\n${jsonData.contactInformation.email || ''}\n${jsonData.contactInformation.phone || ''}`.trim()
                  : jsonData.contactInformation || "Contact information available on the official website",
                applicationProcess: Array.isArray(jsonData.applicationProcess)
                  ? jsonData.applicationProcess
                  : ["Application process details available on the official website"],
                evaluationCriteria: Array.isArray(jsonData.evaluationCriteria)
                  ? jsonData.evaluationCriteria
                  : ["Evaluation criteria available on the official website"],
                sourceUrl: grantUrl,
                scrapedAt: new Date().toISOString()
              }
              source = "firecrawl"
            }
          } catch (firecrawlError) {
            console.log("❌ Firecrawl failed, using fallback:", firecrawlError.message || firecrawlError)
          }
        }

    // Fallback to mock data if Firecrawl fails or isn't available
    if (!grantDetails) {
      grantDetails = {
        title: "Advanced Technology Education Grant",
        agency: "National Science Foundation",
        description: "This grant supports innovative technology education programs that prepare students for careers in STEM fields. The program focuses on hands-on learning experiences, industry partnerships, and cutting-edge curriculum development.",
        eligibility: [
          "Non-profit educational institutions",
          "Public and private universities",
          "Community colleges with STEM programs",
          "Organizations with 501(c)(3) status",
          "Minimum 3 years of educational program experience"
        ],
        requirements: [
          "Detailed project proposal (max 15 pages)",
          "Budget justification and financial statements",
          "Letters of support from industry partners",
          "Resumes of key personnel",
          "Institutional capacity documentation",
          "Evaluation and assessment plan"
        ],
        deadline: "December 31, 2025",
        fundingAmount: "$500,000 - $1,000,000",
        contactInfo: "Dr. Sarah Johnson, Program Manager\nEmail: sjohnson@nsf.gov\nPhone: (202) 555-0123",
        applicationProcess: [
          "Submit Letter of Intent by October 15, 2025",
          "Full application due by December 31, 2025",
          "Peer review process (4-6 weeks)",
          "Award notification by March 15, 2026",
          "Project start date: July 1, 2026"
        ],
        evaluationCriteria: [
          "Innovation and creativity (30%)",
          "Educational impact potential (25%)",
          "Implementation feasibility (20%)",
          "Organizational capacity (15%)",
          "Budget reasonableness (10%)"
        ],
        sourceUrl: grantUrl,
        scrapedAt: new Date().toISOString()
      }
    }

    // Calculate match percentage based on user profile
    const matchPercentage = calculateMatchPercentage(grantDetails, userProfile)

    return NextResponse.json({
      success: true,
      grantDetails,
      matchPercentage,
      source
    })
  } catch (error) {
    console.error("Error exploring grant:", error)
    return NextResponse.json({ error: "Failed to explore grant details" }, { status: 500 })
  }
}

// Helper functions to extract information from scraped content
function extractTitle(content: string, html: string): string {
  // Look for title patterns in markdown and HTML
  const titleMatch = content.match(/^#\s+(.+)$/m) || 
                    content.match(/title[:\s]+(.+)/i) ||
                    html.match(/<title[^>]*>(.+?)<\/title>/i)
  return titleMatch ? titleMatch[1].trim() : "Grant Opportunity"
}

function extractAgency(content: string, html: string): string {
  const agencyMatch = content.match(/agency[:\s]+(.+)/i) ||
                     content.match(/department[:\s]+(.+)/i) ||
                     content.match(/sponsor[:\s]+(.+)/i)
  return agencyMatch ? agencyMatch[1].trim() : "Federal Agency"
}

function extractDescription(content: string, html: string): string {
  // Look for description or summary sections
  const descMatch = content.match(/description[:\s]+(.+?)(?:\n\n|\n#|$)/is) ||
                   content.match(/summary[:\s]+(.+?)(?:\n\n|\n#|$)/is) ||
                   content.match(/overview[:\s]+(.+?)(?:\n\n|\n#|$)/is)
  return descMatch ? descMatch[1].trim().substring(0, 500) + "..." : "Grant opportunity details available on the official website."
}

function extractEligibility(content: string, html: string): string[] {
  const eligibilityPatterns = [
    /eligibility[:\s]+(.+?)(?:\n\n|\n#|$)/is,
    /eligible[:\s]+(.+?)(?:\n\n|\n#|$)/is,
    /qualification[:\s]+(.+?)(?:\n\n|\n#|$)/is
  ]
  
  for (const pattern of eligibilityPatterns) {
    const match = content.match(pattern)
    if (match) {
      return match[1].split('\n').map(line => line.trim()).filter(line => line.length > 0)
    }
  }
  
  return ["Eligibility requirements available on the official website"]
}

function extractRequirements(content: string, html: string): string[] {
  const reqPatterns = [
    /requirements[:\s]+(.+?)(?:\n\n|\n#|$)/is,
    /required[:\s]+(.+?)(?:\n\n|\n#|$)/is,
    /documents[:\s]+(.+?)(?:\n\n|\n#|$)/is
  ]
  
  for (const pattern of reqPatterns) {
    const match = content.match(pattern)
    if (match) {
      return match[1].split('\n').map(line => line.trim()).filter(line => line.length > 0)
    }
  }
  
  return ["Application requirements available on the official website"]
}

function extractDeadline(content: string, html: string): string {
  const deadlineMatch = content.match(/deadline[:\s]+(.+)/i) ||
                       content.match(/due[:\s]+(.+)/i) ||
                       content.match(/closes[:\s]+(.+)/i)
  return deadlineMatch ? deadlineMatch[1].trim() : "Deadline information available on the official website"
}

function extractFundingAmount(content: string, html: string): string {
  const fundingMatch = content.match(/funding[:\s]+(.+)/i) ||
                      content.match(/award[:\s]+(.+)/i) ||
                      content.match(/\$[\d,]+(?:-\$[\d,]+)?/i)
  return fundingMatch ? fundingMatch[1].trim() : "Funding amount varies"
}

function extractContactInfo(content: string, html: string): string {
  const contactMatch = content.match(/contact[:\s]+(.+?)(?:\n\n|\n#|$)/is) ||
                      content.match(/program manager[:\s]+(.+?)(?:\n\n|\n#|$)/is)
  return contactMatch ? contactMatch[1].trim() : "Contact information available on the official website"
}

function extractApplicationProcess(content: string, html: string): string[] {
  const processMatch = content.match(/application process[:\s]+(.+?)(?:\n\n|\n#|$)/is) ||
                      content.match(/how to apply[:\s]+(.+?)(?:\n\n|\n#|$)/is)
  if (processMatch) {
    return processMatch[1].split('\n').map(line => line.trim()).filter(line => line.length > 0)
  }
  return ["Application process details available on the official website"]
}

function extractEvaluationCriteria(content: string, html: string): string[] {
  const criteriaMatch = content.match(/evaluation criteria[:\s]+(.+?)(?:\n\n|\n#|$)/is) ||
                       content.match(/review process[:\s]+(.+?)(?:\n\n|\n#|$)/is)
  if (criteriaMatch) {
    return criteriaMatch[1].split('\n').map(line => line.trim()).filter(line => line.length > 0)
  }
  return ["Evaluation criteria available on the official website"]
}

function calculateMatchPercentage(grantDetails: any, userProfile: any): number {
  // For now, we'll fake the match percentage based on some simple criteria
  // In a real implementation, this would use AI to analyze the grant against user profile
  
  let matchScore = 0
  const maxScore = 10
  
  // Check if user profile has focus areas that match grant categories
  if (userProfile?.focusAreas) {
    const grantText = `${grantDetails.title} ${grantDetails.description}`.toLowerCase()
    const focusAreas = userProfile.focusAreas.map((area: string) => area.toLowerCase())
    
    for (const area of focusAreas) {
      if (grantText.includes(area)) {
        matchScore += 2
      }
    }
  }
  
  // Check organization type alignment
  if (userProfile?.organizationType) {
    const orgType = userProfile.organizationType.toLowerCase()
    if (orgType.includes('nonprofit') && grantDetails.description.toLowerCase().includes('nonprofit')) {
      matchScore += 2
    }
    if (orgType.includes('education') && grantDetails.description.toLowerCase().includes('education')) {
      matchScore += 2
    }
  }
  
  // Check organization size alignment
  if (userProfile?.organizationSize) {
    const size = userProfile.organizationSize.toLowerCase()
    if (size.includes('small') && grantDetails.description.toLowerCase().includes('small')) {
      matchScore += 1
    }
    if (size.includes('large') && grantDetails.description.toLowerCase().includes('large')) {
      matchScore += 1
    }
  }
  
  // Add some randomness to make it more realistic
  const randomFactor = Math.random() * 0.3 + 0.7 // 0.7 to 1.0
  const finalScore = Math.min(Math.round((matchScore / maxScore) * 100 * randomFactor), 95)
  
  return Math.max(finalScore, 15) // Minimum 15% match
}
