"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { TitleGrid } from "@/components/title-grid"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />

      {/* Mobile Sidebar Toggle */}
      {isMobile && (
        <div className="sticky top-14 z-40 bg-background border-b px-4 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            {sidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}
          </Button>
        </div>
      )}

      <main className="container mx-auto px-2 sm:px-4 py-4 flex-1">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <div
            className={`
            lg:w-80 lg:flex-shrink-0
            ${isMobile ? (sidebarOpen ? "block" : "hidden") : "block"}
            ${isMobile ? "order-1" : "order-2 lg:order-1"}
          `}
          >
            <div className="sticky top-20 lg:top-24">
              <Sidebar />
            </div>
          </div>

          {/* Main Content */}
          <div
            className={`
            flex-1 min-w-0
            ${isMobile ? "order-2" : "order-1 lg:order-2"}
          `}
          >
            <TitleGrid searchQuery={searchQuery} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
