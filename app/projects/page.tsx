"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Star, ArrowRight } from "lucide-react"

const mockProjects = [
  {
    id: 1,
    name: "Project Name",
    description: "Placeholder for our advanced grant description - see limited",
    starred: true,
  },
  {
    id: 2,
    name: "Project Name",
    description: "Placeholder for our advanced grant description - see limited",
    starred: true,
  },
  {
    id: 3,
    name: "Project Name",
    description: "Placeholder for our advanced grant description - see limited",
    starred: true,
  },
  {
    id: 4,
    name: "Project Name",
    description: "Placeholder for our advanced grant description - see limited",
    starred: true,
  },
  {
    id: 5,
    name: "Project Name",
    description: "Placeholder for our advanced grant description - see limited",
    starred: true,
  },
  {
    id: 6,
    name: "Project Name",
    description: "Placeholder for our advanced grant description - see limited",
    starred: true,
  },
  {
    id: 7,
    name: "Project Name",
    description: "Placeholder for our advanced grant description - see limited",
    starred: true,
  },
  {
    id: 8,
    name: "Project Name",
    description: "Placeholder for our advanced grant description - see limited",
    starred: true,
  },
]

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">All of your projects in one place</h1>
          <p className="text-muted-foreground mt-2">Manage your grant projects and see their statuses at a glance.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Projects ({mockProjects.length})</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProjects.map((project) => (
              <Card key={project.id} className="p-6 bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-2">[{project.name}]</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                  </div>
                  {project.starred && <Star className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />}
                </div>
                <Button variant="ghost" className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground">
                  View project
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Card>
            ))}

            <Card className="p-6 bg-muted/30 hover:bg-muted/50 transition-colors border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 cursor-pointer">
              <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
                <div className="w-12 h-12 rounded-full bg-background border-2 border-muted-foreground/30 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Add a new project</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
