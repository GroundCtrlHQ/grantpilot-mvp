"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FilterIcon, XIcon, SearchIcon } from "lucide-react"
import type { Grant } from "@/lib/storage"

interface GrantFiltersProps {
  grants: Grant[]
  onFiltersChange: (filters: any) => void
}

export function GrantFilters({ grants, onFiltersChange }: GrantFiltersProps) {
  // Filter state
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedFundingInstruments, setSelectedFundingInstruments] = useState<string[]>([])
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCloseDateRanges, setSelectedCloseDateRanges] = useState<string[]>([])
  const [selectedCostSharing, setSelectedCostSharing] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Comprehensive filter options matching grants.gov
  const statusOptions = [
    { value: "forecasted", label: "Forecasted" },
    { value: "posted", label: "Open" },
    { value: "closed", label: "Closed" },
    { value: "archived", label: "Archived" },
  ]

  const fundingInstrumentOptions = [
    { value: "cooperative_agreement", label: "Cooperative Agreement" },
    { value: "grant", label: "Grant" },
    { value: "procurement_contract", label: "Procurement Contract" },
    { value: "other", label: "Other" },
  ]

  const closeDateRangeOptions = [
    { value: "7", label: "Next 7 days" },
    { value: "30", label: "Next 30 days" },
    { value: "90", label: "Next 90 days" },
    { value: "120", label: "Next 120 days" },
  ]

  const costSharingOptions = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]

  // Extract unique values from grants for dynamic filters
  const agencies = [...new Set(grants.map((g) => g.agency).filter(Boolean))]
  const categories = [...new Set(grants.map((g) => g.category).filter(Boolean))]

  useEffect(() => {
    const filters = {
      statuses: selectedStatuses,
      fundingInstruments: selectedFundingInstruments,
      agencies: selectedAgencies,
      categories: selectedCategories,
      closeDateRanges: selectedCloseDateRanges,
      costSharing: selectedCostSharing,
      searchQuery,
    }
    onFiltersChange(filters)
  }, [
    selectedStatuses,
    selectedFundingInstruments,
    selectedAgencies,
    selectedCategories,
    selectedCloseDateRanges,
    selectedCostSharing,
    searchQuery,
  ])

  const clearAllFilters = () => {
    setSelectedStatuses([])
    setSelectedFundingInstruments([])
    setSelectedAgencies([])
    setSelectedCategories([])
    setSelectedCloseDateRanges([])
    setSelectedCostSharing([])
    setSearchQuery("")
  }

  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedFundingInstruments.length > 0 ||
    selectedAgencies.length > 0 ||
    selectedCategories.length > 0 ||
    selectedCloseDateRanges.length > 0 ||
    selectedCostSharing.length > 0 ||
    searchQuery

  const FilterSection = ({
    title,
    children,
    itemCount
  }: {
    title: string
    children: React.ReactNode
    itemCount?: number
  }) => (
    <AccordionItem value={title.toLowerCase().replace(/\s+/g, "-")}>
      <AccordionTrigger className="text-sm font-medium">
        {title}
        {itemCount !== undefined && (
          <span className="ml-2 text-xs text-muted-foreground">({itemCount})</span>
        )}
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        {children}
      </AccordionContent>
    </AccordionItem>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Advanced Filters
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Search Grants
          </Label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by title, agency, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters Accordion */}
        <Accordion type="multiple" className="w-full">
          {/* Status Filter */}
          <FilterSection title="Opportunity Status">
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={selectedStatuses.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStatuses([...selectedStatuses, option.value])
                      } else {
                        setSelectedStatuses(selectedStatuses.filter((s) => s !== option.value))
                      }
                    }}
                  />
                  <Label htmlFor={`status-${option.value}`} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </FilterSection>

          {/* Funding Instrument Filter */}
          <FilterSection title="Funding Instrument">
            <div className="grid grid-cols-2 gap-3">
              {fundingInstrumentOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`funding-${option.value}`}
                    checked={selectedFundingInstruments.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFundingInstruments([...selectedFundingInstruments, option.value])
                      } else {
                        setSelectedFundingInstruments(
                          selectedFundingInstruments.filter((f) => f !== option.value)
                        )
                      }
                    }}
                  />
                  <Label htmlFor={`funding-${option.value}`} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </FilterSection>

          {/* Agency Filter */}
          <FilterSection title="Agencies" itemCount={agencies.length}>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {agencies.map((agency) => (
                <div key={agency} className="flex items-center space-x-2">
                  <Checkbox
                    id={`agency-${agency}`}
                    checked={selectedAgencies.includes(agency)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAgencies([...selectedAgencies, agency])
                      } else {
                        setSelectedAgencies(selectedAgencies.filter((a) => a !== agency))
                      }
                    }}
                  />
                  <Label htmlFor={`agency-${agency}`} className="text-sm font-normal">
                    {agency}
                  </Label>
                </div>
              ))}
            </div>
          </FilterSection>

          {/* Category Filter */}
          <FilterSection title="Categories" itemCount={categories.length}>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories([...selectedCategories, category])
                      } else {
                        setSelectedCategories(selectedCategories.filter((c) => c !== category))
                      }
                    }}
                  />
                  <Label htmlFor={`category-${category}`} className="text-sm font-normal">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </FilterSection>

          {/* Close Date Range Filter */}
          <FilterSection title="Closing Date Range">
            <div className="grid grid-cols-2 gap-3">
              {closeDateRangeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`close-${option.value}`}
                    checked={selectedCloseDateRanges.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCloseDateRanges([...selectedCloseDateRanges, option.value])
                      } else {
                        setSelectedCloseDateRanges(
                          selectedCloseDateRanges.filter((r) => r !== option.value)
                        )
                      }
                    }}
                  />
                  <Label htmlFor={`close-${option.value}`} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </FilterSection>

          {/* Cost Sharing Filter */}
          <FilterSection title="Cost Sharing Required">
            <div className="grid grid-cols-2 gap-3">
              {costSharingOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cost-${option.value}`}
                    checked={selectedCostSharing.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCostSharing([...selectedCostSharing, option.value])
                      } else {
                        setSelectedCostSharing(selectedCostSharing.filter((c) => c !== option.value))
                      }
                    }}
                  />
                  <Label htmlFor={`cost-${option.value}`} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </FilterSection>
        </Accordion>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {selectedStatuses.map((status) => {
                const statusLabel = statusOptions.find((s) => s.value === status)?.label || status
                return (
                  <Badge key={`filter-status-${status}`} variant="secondary" className="text-xs">
                    Status: {statusLabel}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-3 w-3 p-0"
                      onClick={() => setSelectedStatuses(selectedStatuses.filter((s) => s !== status))}
                    >
                      <XIcon className="h-2 w-2" />
                    </Button>
                  </Badge>
                )
              })}
              {selectedFundingInstruments.map((instrument) => {
                const instrumentLabel = fundingInstrumentOptions.find((f) => f.value === instrument)?.label || instrument
                return (
                  <Badge key={`filter-funding-${instrument}`} variant="secondary" className="text-xs">
                    Funding: {instrumentLabel}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-3 w-3 p-0"
                      onClick={() =>
                        setSelectedFundingInstruments(selectedFundingInstruments.filter((f) => f !== instrument))
                      }
                    >
                      <XIcon className="h-2 w-2" />
                    </Button>
                  </Badge>
                )
              })}
              {selectedAgencies.map((agency) => (
                <Badge key={`filter-agency-${agency}`} variant="secondary" className="text-xs">
                  Agency: {agency}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-3 w-3 p-0"
                    onClick={() => setSelectedAgencies(selectedAgencies.filter((a) => a !== agency))}
                  >
                    <XIcon className="h-2 w-2" />
                  </Button>
                </Badge>
              ))}
              {selectedCategories.map((category) => (
                <Badge key={`filter-category-${category}`} variant="secondary" className="text-xs">
                  Category: {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-3 w-3 p-0"
                    onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== category))}
                  >
                    <XIcon className="h-2 w-2" />
                  </Button>
                </Badge>
              ))}
              {selectedCloseDateRanges.map((range) => {
                const rangeLabel = closeDateRangeOptions.find((r) => r.value === range)?.label || range
                return (
                  <Badge key={`filter-close-${range}`} variant="secondary" className="text-xs">
                    Closes: {rangeLabel}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-3 w-3 p-0"
                      onClick={() => setSelectedCloseDateRanges(selectedCloseDateRanges.filter((r) => r !== range))}
                    >
                      <XIcon className="h-2 w-2" />
                    </Button>
                  </Badge>
                )
              })}
              {selectedCostSharing.map((cost) => {
                const costLabel = costSharingOptions.find((c) => c.value === cost)?.label || cost
                return (
                  <Badge key={`filter-cost-${cost}`} variant="secondary" className="text-xs">
                    Cost Share: {costLabel}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-3 w-3 p-0"
                      onClick={() => setSelectedCostSharing(selectedCostSharing.filter((c) => c !== cost))}
                    >
                      <XIcon className="h-2 w-2" />
                    </Button>
                  </Badge>
                )
              })}
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: {searchQuery}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-3 w-3 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <XIcon className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
