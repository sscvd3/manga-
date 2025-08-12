"use client"

import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MR</span>
              </div>
              <span className="font-bold text-xl">MangaReader</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Read your favorite manga and manhwa online for free. Discover new stories and follow your favorite series.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Browse</h3>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Latest Updates
              </Link>
              <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Popular Titles
              </Link>
              <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Completed Series
              </Link>
              <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Random Title
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Genres</h3>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Action
              </Link>
              <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Romance
              </Link>
              <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Fantasy
              </Link>
              <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Drama
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <div className="space-y-2 text-sm">
              <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2024 MangaReader. All rights reserved.</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500" /> for manga lovers
          </p>
        </div>
      </div>
    </footer>
  )
}
