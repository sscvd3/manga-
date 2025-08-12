import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { ThemeProvider } from "@/hooks/use-theme"

export const metadata: Metadata = {
  title: "قارئ المانجا - اقرأ المانجا والمانهوا أونلاين",
  description: "اقرأ المانجا والمانهوا المفضلة لديك أونلاين مجاناً. اكتشف قصص جديدة وتابع سلاسلك المفضلة.",
  generator: "v0.dev",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover"
        />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="قارئ المانجا" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  scroll-behavior: smooth;
}
body {
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  position: relative;
}
/* Mobile-first critical CSS */
@media (max-width: 768px) {
  html {
    font-size: 16px;
  }
  body {
    font-size: 16px;
    line-height: 1.5;
  }
  * {
    -webkit-tap-highlight-color: transparent;
  }
  input, textarea, select {
    font-size: 16px;
  }
}
        `}</style>
      </head>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
