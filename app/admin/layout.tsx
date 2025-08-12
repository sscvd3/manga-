import type React from "react"
import { AdminGuard } from "@/components/admin-guard"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  )
}
