"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, BookOpen, FileText, Home, Plus, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Titles",
    href: "/admin/titles",
    icon: BookOpen,
  },
  {
    title: "Add Title",
    href: "/admin/titles/add",
    icon: Plus,
  },
  {
    title: "Chapters",
    href: "/admin/chapters",
    icon: FileText,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Statistics",
    href: "/admin/statistics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r bg-muted/10 p-6">
      <div className="mb-8">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">MR</span>
          </div>
          <span className="font-bold text-xl">Admin Panel</span>
        </Link>
      </div>

      <nav className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start", isActive && "bg-secondary")}
              asChild
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4 mr-2" />
                {item.title}
              </Link>
            </Button>
          )
        })}
      </nav>

      <div className="mt-8 pt-8 border-t">
        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href="/">Back to Site</Link>
        </Button>
      </div>
    </div>
  )
}
