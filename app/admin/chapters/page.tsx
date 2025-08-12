"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Eye, Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTitles, getChaptersByTitleId, type Title, type Chapter } from "@/lib/data"

interface ChapterWithTitle extends Chapter {
  titleName: string
}

export default function AdminChaptersPage() {
  const [chapters, setChapters] = useState<ChapterWithTitle[]>([])
  const [filteredChapters, setFilteredChapters] = useState<ChapterWithTitle[]>([])
  const [titles, setTitles] = useState<Title[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [titleFilter, setTitleFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    const titlesData = getTitles()
    setTitles(titlesData)

    // Load all chapters from all titles
    const allChapters: ChapterWithTitle[] = []
    titlesData.forEach((title) => {
      const titleChapters = getChaptersByTitleId(title.id)
      titleChapters.forEach((chapter) => {
        allChapters.push({
          ...chapter,
          titleName: title.title,
        })
      })
    })

    setChapters(allChapters)
    setFilteredChapters(allChapters)
  }, [])

  useEffect(() => {
    let filtered = chapters.filter((chapter) => {
      const matchesSearch =
        chapter.titleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.chapterTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.chapterNumber.toString().includes(searchQuery)
      const matchesTitle = titleFilter === "all" || chapter.titleId === titleFilter
      return matchesSearch && matchesTitle
    })

    // Sort chapters
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.publishDate.getTime() - a.publishDate.getTime()
        case "oldest":
          return a.publishDate.getTime() - b.publishDate.getTime()
        case "most-views":
          return b.views - a.views
        case "title":
          return a.titleName.localeCompare(b.titleName)
        default:
          return 0
      }
    })

    setFilteredChapters(filtered)
  }, [chapters, searchQuery, titleFilter, sortBy])

  const deleteChapter = (titleId: string, chapterId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this chapter?")
    if (confirmed) {
      const titleChapters = getChaptersByTitleId(titleId)
      const updatedChapters = titleChapters.filter((chapter) => chapter.id !== chapterId)
      localStorage.setItem(`manga-reader-chapters-${titleId}`, JSON.stringify(updatedChapters))

      // Update title's chapter count
      const titles = getTitles()
      const titleIndex = titles.findIndex((t) => t.id === titleId)
      if (titleIndex !== -1) {
        titles[titleIndex].chapterCount = updatedChapters.length
        localStorage.setItem("manga-reader-titles", JSON.stringify(titles))
      }

      // Refresh chapters list
      setChapters(chapters.filter((chapter) => chapter.id !== chapterId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Chapters</h1>
        <Button asChild>
          <Link href="/admin/titles">
            <Plus className="h-4 w-4 mr-2" />
            Add Chapter to Title
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chapters.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chapters.reduce((sum, chapter) => sum + chapter.views, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Pages/Chapter</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chapters.length > 0
                ? Math.round(chapters.reduce((sum, chapter) => sum + chapter.pages.length, 0) / chapters.length)
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Select value={titleFilter} onValueChange={setTitleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Titles</SelectItem>
                  {titles.map((title) => (
                    <SelectItem key={title.id} value={title.id}>
                      {title.title}
                    </SelectItem>
                  ))}
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
                  <SelectItem value="most-views">Most Views</SelectItem>
                  <SelectItem value="title">By Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="text-sm text-muted-foreground pt-2">
                {filteredChapters.length} of {chapters.length} chapters
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapters List */}
      <Card>
        <CardHeader>
          <CardTitle>All Chapters ({filteredChapters.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredChapters.map((chapter) => (
              <div key={chapter.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {chapter.titleName} - Chapter {chapter.chapterNumber}
                      </h3>
                      {chapter.chapterTitle && <p className="text-sm text-muted-foreground">{chapter.chapterTitle}</p>}
                      <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                        <span>{chapter.pages.length} pages</span>
                        <span>{chapter.views} views</span>
                        <span>Published {chapter.publishDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/read/${chapter.titleId}/${chapter.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Read
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/chapters/${chapter.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteChapter(chapter.titleId, chapter.id)}>
                    <Trash2 className="h-4 w-4" />
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
