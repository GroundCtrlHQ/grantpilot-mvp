import type { Grant } from "./storage"

// Mock RSS parser for grants.gov data
const getMockGrants = (): Grant[] => {
  const mockGrants: Grant[] = [
    {
      id: crypto.randomUUID(),
      opportunityNumber: "CDC-RFA-DP23-2301",
      title:
        "Strengthening Public Health Systems and Services through National Partnerships to Improve and Protect the Nation's Health",
      agency: "Department of Health and Human Services",
      postedDate: "2024-01-15T00:00:00Z",
      closeDate: "2025-03-15T23:59:59Z",
      awardCeiling: 500000,
      awardFloor: 100000,
      category: "Health",
      description:
        "This funding opportunity aims to strengthen public health systems and services through national partnerships. The program focuses on improving health outcomes, reducing health disparities, and building sustainable public health infrastructure.",
      detailsUrl: "https://grants.gov/web/grants/view-opportunity.html?oppId=123456",
    },
    {
      id: crypto.randomUUID(),
      opportunityNumber: "NSF-24-542",
      title: "Computer and Information Science and Engineering Research Initiation Initiative",
      agency: "National Science Foundation",
      postedDate: "2024-02-01T00:00:00Z",
      closeDate: "2025-01-20T23:59:59Z",
      awardCeiling: 175000,
      awardFloor: 75000,
      category: "Science and Technology",
      description:
        "This program supports early-career faculty in computer and information science and engineering fields. The initiative aims to foster innovative research and build research capacity in emerging areas of computing.",
      detailsUrl: "https://grants.gov/web/grants/view-opportunity.html?oppId=234567",
    },
    {
      id: crypto.randomUUID(),
      opportunityNumber: "ED-GRANTS-041524-001",
      title: "Supporting Effective Educator Development Grant Program",
      agency: "Department of Education",
      postedDate: "2024-01-20T00:00:00Z",
      closeDate: "2025-02-28T23:59:59Z",
      awardCeiling: 1000000,
      awardFloor: 250000,
      category: "Education",
      description:
        "This program provides funding to improve the quality of new teachers and principals entering the profession. Focus areas include innovative preparation programs, mentoring, and professional development.",
      detailsUrl: "https://grants.gov/web/grants/view-opportunity.html?oppId=345678",
    },
    {
      id: crypto.randomUUID(),
      opportunityNumber: "USDA-NIFA-AFRI-009876",
      title: "Agriculture and Food Research Initiative: Sustainable Agricultural Systems",
      agency: "Department of Agriculture",
      postedDate: "2024-01-10T00:00:00Z",
      closeDate: "2025-01-10T23:59:59Z",
      awardCeiling: 750000,
      awardFloor: 150000,
      category: "Agriculture",
      description:
        "This program supports research to develop sustainable agricultural systems that enhance productivity while protecting natural resources. Priority areas include climate adaptation, soil health, and integrated pest management.",
      detailsUrl: "https://grants.gov/web/grants/view-opportunity.html?oppId=456789",
    },
    {
      id: crypto.randomUUID(),
      opportunityNumber: "EPA-G2024-STAR-A1",
      title: "Science to Achieve Results (STAR) Research Program",
      agency: "Environmental Protection Agency",
      postedDate: "2024-02-05T00:00:00Z",
      closeDate: "2025-04-30T23:59:59Z",
      awardCeiling: 400000,
      awardFloor: 100000,
      category: "Environment",
      description:
        "The STAR program supports high-quality environmental research that will improve the scientific basis for environmental decision-making. Research areas include air quality, water resources, and environmental health.",
      detailsUrl: "https://grants.gov/web/grants/view-opportunity.html?oppId=567890",
    },
    {
      id: crypto.randomUUID(),
      opportunityNumber: "NIH-R01-MH-24-100",
      title: "Mental Health Research Grant Program",
      agency: "National Institutes of Health",
      postedDate: "2024-01-25T00:00:00Z",
      closeDate: "2025-01-05T23:59:59Z",
      awardCeiling: 2500000,
      awardFloor: 500000,
      category: "Health",
      description:
        "This program supports innovative research to advance understanding of mental health disorders and develop new treatments. Priority areas include neuroscience, behavioral interventions, and health services research.",
      detailsUrl: "https://grants.gov/web/grants/view-opportunity.html?oppId=678901",
    },
    {
      id: crypto.randomUUID(),
      opportunityNumber: "DOE-SC-0024-001",
      title: "Basic Energy Sciences Research Program",
      agency: "Department of Energy",
      postedDate: "2024-02-10T00:00:00Z",
      closeDate: "2025-05-15T23:59:59Z",
      awardCeiling: 1200000,
      awardFloor: 300000,
      category: "Energy",
      description:
        "This program supports fundamental research in materials sciences, chemical sciences, and geosciences that underpin DOE's energy mission. Research should advance scientific understanding in areas relevant to energy technologies.",
      detailsUrl: "https://grants.gov/web/grants/view-opportunity.html?oppId=789012",
    },
    {
      id: crypto.randomUUID(),
      opportunityNumber: "HUD-CPD-2024-CDBG",
      title: "Community Development Block Grant Program",
      agency: "Department of Housing and Urban Development",
      postedDate: "2024-01-30T00:00:00Z",
      closeDate: "2025-03-30T23:59:59Z",
      awardCeiling: 2000000,
      awardFloor: 500000,
      category: "Community Development",
      description:
        "The CDBG program provides communities with resources to address a wide range of unique community development needs. Funding supports activities that benefit low- and moderate-income persons, prevent or eliminate slums or blight, or address urgent community development needs.",
      detailsUrl: "https://grants.gov/web/grants/view-opportunity.html?oppId=890123",
    },
  ]

  // Add more grants with different close dates for testing urgency
  const additionalGrants: Grant[] = [
    {
      id: crypto.randomUUID(),
      opportunityNumber: "URGENT-GRANT-001",
      title: "Emergency Community Response Initiative",
      agency: "Department of Homeland Security",
      postedDate: "2024-12-01T00:00:00Z",
      closeDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      awardCeiling: 300000,
      awardFloor: 50000,
      category: "Emergency Management",
      description:
        "Urgent funding opportunity to support community emergency response capabilities. Applications due soon.",
      detailsUrl: "https://grants.gov/web/grants/view-opportunity.html?oppId=901234",
    },
    {
      id: crypto.randomUUID(),
      opportunityNumber: "WARNING-GRANT-002",
      title: "Infrastructure Resilience Program",
      agency: "Department of Transportation",
      postedDate: "2024-11-15T00:00:00Z",
      closeDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      awardCeiling: 800000,
      awardFloor: 200000,
      category: "Infrastructure",
      description:
        "Funding to improve infrastructure resilience against climate change impacts. Moderate deadline approaching.",
      detailsUrl: "https://grants.gov/web/grants/view-opportunity.html?oppId=012345",
    },
  ]

  return [...mockGrants, ...additionalGrants]
}

export const fetchGrantsFromRSS = async (): Promise<Grant[]> => {
  try {
    // Use Next.js API route as proxy to avoid CORS issues
    const response = await fetch("/api/grants/rss")

    if (!response.ok) {
      throw new Error("Failed to fetch grants")
    }

    const grants = await response.json()
    return grants
  } catch (error) {
    console.error("Error fetching grants:", error)

    return getMockGrants()
  }
}

export const searchGrantsGov = async (query: string, limit = 20): Promise<Grant[]> => {
  try {
    console.log("[v0] Searching grants.gov for:", query)

    const response = await fetch(`/api/grants/search?query=${encodeURIComponent(query)}&limit=${limit}&pages=3`)

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("[v0] Search result:", result)

    if (result.success) {
      return result.grants
    } else {
      throw new Error(result.error || "Search failed")
    }
  } catch (error) {
    console.error("[v0] Error searching grants.gov:", error)

    // Return filtered mock data based on query
    const mockGrants = getMockGrants()
    const queryLower = query.toLowerCase()

    return mockGrants
      .filter(
        (grant) =>
          grant.title.toLowerCase().includes(queryLower) ||
          grant.description.toLowerCase().includes(queryLower) ||
          grant.agency.toLowerCase().includes(queryLower) ||
          grant.category.toLowerCase().includes(queryLower),
      )
      .slice(0, limit)
  }
}

export const getUniqueAgencies = (grants: Grant[]): string[] => {
  const agencies = grants.map((grant) => grant.agency)
  return Array.from(new Set(agencies)).sort()
}

export const getUniqueCategories = (grants: Grant[]): string[] => {
  const categories = grants.map((grant) => grant.category).filter(Boolean) as string[]
  return Array.from(new Set(categories)).sort()
}
