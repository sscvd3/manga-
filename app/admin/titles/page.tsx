"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTitles, type Title } from "@/lib/data"

export default function AdminTitlesPage() {
  const [titles, setTitles] = useState<Title[]>([])
  const [filteredTitles, setFilteredTitles] = useState<Title[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    const titlesData = getTitles()
    setTitles(titlesData)
    setFilteredTitles(titlesData)
  }, [])

  useEffect(() => {
    let filtered = titles.filter((title) => {
      const matchesSearch =
        title.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        title.author?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || title.status === statusFilter
      return matchesSearch && matchesStatus
    })

    // Sort titles
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt.getTime() - a.createdAt.getTime()
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime()
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

    setFilteredTitles(filtered)
  }, [titles, searchQuery, statusFilter, sortBy])

  const deleteTitle = (titleId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this title? This will also delete all its chapters.",
    )
    if (confirmed) {
      const updatedTitles = titles.filter((title) => title.id !== titleId)
      localStorage.setItem("manga-reader-titles", JSON.stringify(updatedTitles))
      localStorage.removeItem(`manga-reader-chapters-${titleId}`)
      setTitles(updatedTitles)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Titles</h1>
        <Button asChild>
          <Link href="/admin/titles/add">
            <Plus className="h-4 w-4 mr-2" />
            Add New Title
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search titles or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="hiatus">Hiatus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="text-sm text-muted-foreground pt-2">
                {filteredTitles.length} of {titles.length} titles
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Titles List */}
      <Card>
        <CardHeader>
          <CardTitle>All Titles ({filteredTitles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTitles.map((title) => (
              <div key={title.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <img
                  src={title.coverImage || "/placeholder.svg"}
                  alt={title.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{title.title}</h3>
                      {title.author && <p className="text-sm text-muted-foreground">by {title.author}</p>}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {title.genres.map((genre) => (
                          <Badge key={genre} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        <Badge variant={title.status === "ongoing" ? "default" : "secondary"}>{title.status}</Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {title.chapterCount} chapters
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Eye className="h-3 w-3" />
                        {title.views.toLocaleString()} views
                      </div>
                      <div className="mt-1">Updated {title.lastUpdated.toLocaleDateString()}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{title.shortDescription}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/title/${title.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/titles/${title.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/titles/${title.id}/chapters/add`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Chapter
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteTitle(title.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
