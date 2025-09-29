"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ApplicationProgress } from "@/components/application-progress"

export default function WritePage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Grant Pilot AI",
      content:
        "Welcome back, would you like to complete the application for [Grant Name] for your project [Project Name]?",
      timestamp: "Day 0:00 a.m",
      isAI: true,
    },
  ])

  return (
    <DashboardLayout>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-border pb-4 mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Let's Prepare Your Grant Application</h1>
            <p className="text-muted-foreground mt-1">
              Adding your relevant project documents will help us match your project with the right funding prospect.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Pro</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {message.isAI ? "AI" : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">{message.sender}</span>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  <div className="text-sm text-foreground mb-3">{message.content}</div>
                  {message.isAI && (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Yes, that works
                      </Button>
                      <Button size="sm" variant="outline">
                        Work on a Different Project
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-80 ml-6">
          <ApplicationProgress />
        </div>
      </div>
    </DashboardLayout>
  )
}
