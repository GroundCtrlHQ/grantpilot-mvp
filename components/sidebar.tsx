"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { getUser, clearUser } from "@/lib/storage"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  LayoutDashboard,
  Search,
  FileText,
  PenTool,
  Settings,
  FolderOpen,
  HelpCircle,
  CheckCircle2,
  Circle,
  Clock,
  X,
  LogOut,
  User,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Prepare",
    href: "/prepare",
    icon: FileText,
  },
  {
    name: "Search",
    href: "/grants",
    icon: Search,
  },
  {
    name: "Write",
    href: "/write",
    icon: PenTool,
  },
  {
    name: "Manage",
    href: "/applications",
    icon: Settings,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderOpen,
  },
]

const checklistItems = [
  { id: 1, title: "Basic Project Details", completed: true },
  { id: 2, title: "Organization Information", completed: true },
  { id: 3, title: "Budget Narrative (in progress)", completed: false, inProgress: true },
  { id: 4, title: "Budget Documentation", completed: false },
  { id: 5, title: "Follow Up on Letters of Support", completed: false },
  { id: 6, title: "Environmental Review", completed: false },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const user = getUser()

  const handleLogout = () => {
    clearUser()
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    })
    router.push("/login")
  }

  const completedItems = checklistItems.filter((item) => item.completed).length
  const progressPercentage = Math.round((completedItems / checklistItems.length) * 100)

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center">
          <div className="w-6 h-6 bg-sidebar-primary rounded-full flex items-center justify-center mr-3">
            <span className="text-sidebar-primary-foreground text-xs font-bold">●</span>
          </div>
          <h1 className="text-lg font-medium text-sidebar-foreground">GrantPilot</h1>
        </Link>
        {/* Theme Toggle */}
        <ThemeToggle />
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder-muted-foreground focus:border-sidebar-ring"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const IconComponent = item.icon
          const isActive =
            pathname === item.href ||
            (item.href === "/write" && pathname.includes("/write")) ||
            (item.href === "/prepare" && pathname.includes("/prepare"))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <IconComponent className="w-4 h-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">Application Progress</span>
            <button className="text-muted-foreground hover:text-sidebar-foreground">
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Progress Circle */}
          <div className="relative w-12 h-12 mb-4">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray={`${progressPercentage}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-sidebar-foreground">{progressPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Checklist</h4>
          <div className="space-y-2">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-start gap-2">
                <div className="mt-0.5">
                  {item.completed ? (
                    <CheckCircle2 className="w-3 h-3 text-success" />
                  ) : item.inProgress ? (
                    <Clock className="w-3 h-3 text-primary" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <span className={cn("text-xs", item.completed ? "text-sidebar-foreground" : "text-muted-foreground")}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="px-4 py-2">
        <Link
          href="/support"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Support
        </Link>
      </div>

      {/* Settings */}
      <div className="px-4 pb-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>

      {/* User Section */}
      <div className="px-4 pb-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || user?.email || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.subscriptionStatus === "pro" ? "Pro Plan" : "Free Plan"}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
