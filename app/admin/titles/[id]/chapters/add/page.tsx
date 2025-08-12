"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, GripVertical, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTitleById, getChaptersByTitleId, type Title, type Chapter } from "@/lib/data"

interface PageFile {
  id: string
  file: File
  preview: string
  order: number
}

export default function AddChapterPage() {
  const params = useParams()
  const router = useRouter()
  const [title, setTitle] = useState<Title | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pages, setPages] = useState<PageFile[]>([])
  const [formData, setFormData] = useState({
    chapterNumber: "",
    chapterTitle: "",
  })

  useEffect(() => {
    const titleId = params.id as string
    const titleData = getTitleById(titleId)
    if (!titleData) {
      router.push("/admin/titles")
      return
    }
    setTitle(titleData)

    // Auto-suggest next chapter number
    const chapters = getChaptersByTitleId(titleId)
    const maxChapter = Math.max(...chapters.map((c) => c.chapterNumber), 0)
    setFormData({ ...formData, chapterNumber: (maxChapter + 1).toString() })
  }, [params.id, router])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newPage: PageFile = {
          id: Date.now().toString() + index,
          file,
          preview: e.target?.result as string,
          order: pages.length + index,
        }
        setPages((prev) => [...prev, newPage])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePage = (id: string) => {
    setPages(pages.filter((page) => page.id !== id))
  }

  const reorderPages = (dragIndex: number, hoverIndex: number) => {
    const newPages = [...pages]
    const draggedPage = newPages[dragIndex]
    newPages.splice(dragIndex, 1)
    newPages.splice(hoverIndex, 0, draggedPage)

    // Update order numbers
    newPages.forEach((page, index) => {
      page.order = index
    })

    setPages(newPages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || pages.length === 0) return

    setIsLoading(true)

    try {
      // Sort pages by order
      const sortedPages = [...pages].sort((a, b) => a.order - b.order)

      const pageUrls = sortedPages.map((page) => page.preview)

      const chapters = getChaptersByTitleId(title.id)
      const newChapter: Chapter = {
        id: `${title.id}-${Date.now()}`,
        titleId: title.id,
        chapterNumber: Number.parseFloat(formData.chapterNumber),
        chapterTitle: formData.chapterTitle || undefined,
        pages: pageUrls,
        publishDate: new Date(),
        createdAt: new Date(),
        views: 0,
      }

      const updatedChapters = [...chapters, newChapter]
      localStorage.setItem(`manga-reader-chapters-${title.id}`, JSON.stringify(updatedChapters))

      // Update title's chapter count
      const titles = JSON.parse(localStorage.getItem("manga-reader-titles") || "[]")
      const titleIndex = titles.findIndex((t: Title) => t.id === title.id)
      if (titleIndex !== -1) {
        titles[titleIndex].chapterCount = updatedChapters.length
        titles[titleIndex].lastUpdated = new Date()
        localStorage.setItem("manga-reader-titles", JSON.stringify(titles))
      }

      router.push(`/admin/titles`)
    } catch (error) {
      console.error("Error adding chapter:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!title) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Chapter</h1>
          <p className="text-muted-foreground">{title.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chapter Info */}
        <Card>
          <CardHeader>
            <CardTitle>Chapter Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chapterNumber">Chapter Number *</Label>
              <Input
                id="chapterNumber"
                type="number"
                step="0.1"
                value={formData.chapterNumber}
                onChange={(e) => setFormData({ ...formData, chapterNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapterTitle">Chapter Title</Label>
              <Input
                id="chapterTitle"
                value={formData.chapterTitle}
                onChange={(e) => setFormData({ ...formData, chapterTitle: e.target.value })}
                placeholder="Optional chapter title"
              />
            </div>
            <div className="space-y-2">
              <Label>Upload Pages</Label>
              <Input type="file" accept="image/*" multiple onChange={handleFileUpload} className="cursor-pointer" />
              <p className="text-xs text-muted-foreground">
                Select multiple images. Name files with numbers (001.jpg, 002.jpg) for correct ordering.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pages Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pages ({pages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p>No pages uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {pages
                    .sort((a, b) => a.order - b.order)
                    .map((page, index) => (
                      <div key={page.id} className="relative group">
                        <div className="aspect-[2/3] border rounded-lg overflow-hidden">
                          <img
                            src={page.preview || "/placeholder.svg"}
                            alt={`Page ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePage(page.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                          <GripVertical className="h-4 w-4 text-white/75 cursor-move" />
                          <Eye className="h-4 w-4 text-white/75" />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={isLoading || pages.length === 0}>
              {isLoading ? "Publishing..." : "Publish Chapter"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
