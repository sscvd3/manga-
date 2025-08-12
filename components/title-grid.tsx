"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTitles, type Title } from "@/lib/data"

interface TitleGridProps {
  searchQuery?: string
}

export function TitleGrid({ searchQuery = "" }: TitleGridProps) {
  const [titles, setTitles] = useState<Title[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [filterGenre, setFilterGenre] = useState("all")

  useEffect(() => {
    setTitles(getTitles())
  }, [])

  const genres = ["all", "Action", "Fantasy", "Adventure", "Drama", "Romance", "Comedy"]

  const filteredAndSortedTitles = titles
    .filter((title) => {
      const matchesGenre = filterGenre === "all" || title.genres.includes(filterGenre)
      const matchesSearch =
        searchQuery === "" ||
        title.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        title.alternateTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        title.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        title.genres.some((genre) => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesGenre && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.lastUpdated.getTime() - a.lastUpdated.getTime()
        case "oldest":
          return a.lastUpdated.getTime() - b.lastUpdated.getTime()
        case "most-chapters":
          return b.chapterCount - a.chapterCount
        case "most-views":
          return b.views - a.views
        case "alphabetical":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          {filteredAndSortedTitles.length} results for "{searchQuery}"
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filterGenre} onValueChange={setFilterGenre}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by genre" />
          </SelectTrigger>
          <SelectContent>
            {genres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre === "all" ? "All Genres" : genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="most-chapters">Most Chapters</SelectItem>
            <SelectItem value="most-views">Most Views</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Title Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredAndSortedTitles.map((title) => (
          <Card key={title.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <Link href={`/title/${title.id}`}>
                <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
                  <img
                    src={title.coverImage || "/placeholder.svg"}
                    alt={title.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={title.status === "ongoing" ? "default" : "secondary"}>{title.status}</Badge>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {title.title}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {title.genres.slice(0, 2).map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {title.chapterCount} chapters • {title.views.toLocaleString()} views
                  </p>
                  <Button size="sm" className="w-full">
                    Read Now
                  </Button>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedTitles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? `No results found for "${searchQuery}"` : "No titles found"}
          </p>
        </div>
      )}
    </div>
  )
}
