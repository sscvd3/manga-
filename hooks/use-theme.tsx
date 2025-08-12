"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface ThemeContextType {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
  backgroundImage: string | null
  setBackgroundImage: (image: string | null) => void
  customColors: {
    primary: string
    secondary: string
    accent: string
  }
  setCustomColors: (colors: { primary: string; secondary: string; accent: string }) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [customColors, setCustomColors] = useState({
    primary: "#1a1a1a",
    secondary: "#f5f5f5",
    accent: "#3b82f6",
  })

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const savedBackground = localStorage.getItem("backgroundImage")
    const savedColors = localStorage.getItem("customColors")

    if (savedTheme) setTheme(savedTheme)
    if (savedBackground) setBackgroundImage(savedBackground)
    if (savedColors) setCustomColors(JSON.parse(savedColors))
  }, [])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    // Apply background image
    if (backgroundImage) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

      // Clear any existing background styles first
      document.body.style.backgroundImage = ""
      document.body.style.backgroundAttachment = ""
      document.body.style.backgroundSize = ""
      document.body.style.backgroundPosition = ""
      document.body.style.backgroundRepeat = ""

      // Apply background image with mobile-optimized settings
      document.body.style.backgroundImage = `url(${backgroundImage})`
      document.body.style.backgroundSize = "cover"
      document.body.style.backgroundPosition = "center center"
      document.body.style.backgroundRepeat = "no-repeat"

      // Use scroll attachment for all mobile devices to prevent black screen
      if (isMobile || isIOS) {
        document.body.style.backgroundAttachment = "scroll"
        // Add additional mobile-specific optimizations
        document.body.style.minHeight = "100vh"
        document.body.style.minHeight = "100dvh"
        // Ensure proper rendering on mobile
        document.documentElement.style.backgroundImage = `url(${backgroundImage})`
        document.documentElement.style.backgroundSize = "cover"
        document.documentElement.style.backgroundPosition = "center center"
        document.documentElement.style.backgroundRepeat = "no-repeat"
        document.documentElement.style.backgroundAttachment = "scroll"
      } else {
        document.body.style.backgroundAttachment = "fixed"
      }

      localStorage.setItem("backgroundImage", backgroundImage)
    } else {
      // Clear all background styles
      document.body.style.backgroundImage = ""
      document.body.style.backgroundAttachment = ""
      document.body.style.backgroundSize = ""
      document.body.style.backgroundPosition = ""
      document.body.style.backgroundRepeat = ""
      document.documentElement.style.backgroundImage = ""
      document.documentElement.style.backgroundAttachment = ""
      document.documentElement.style.backgroundSize = ""
      document.documentElement.style.backgroundPosition = ""
      document.documentElement.style.backgroundRepeat = ""
      localStorage.removeItem("backgroundImage")
    }
  }, [backgroundImage])

  useEffect(() => {
    // Apply custom colors
    const root = document.documentElement
    root.style.setProperty("--primary", customColors.primary)
    root.style.setProperty("--secondary", customColors.secondary)
    root.style.setProperty("--accent", customColors.accent)
    localStorage.setItem("customColors", JSON.stringify(customColors))
  }, [customColors])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        backgroundImage,
        setBackgroundImage,
        customColors,
        setCustomColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
