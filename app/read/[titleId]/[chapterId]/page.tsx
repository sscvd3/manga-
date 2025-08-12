"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MangaReader } from "@/components/manga-reader"
import {
  getTitleById,
  getChapterById,
  getChaptersByTitleId,
  updateChapterViews,
  type Title,
  type Chapter,
} from "@/lib/data"

export default function ReadPage() {
  const params = useParams()
  const router = useRouter()
  const [title, setTitle] = useState<Title | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const titleId = params.titleId as string
    const chapterId = params.chapterId as string

    if (!titleId || !chapterId) {
      router.push("/")
      return
    }

    const titleData = getTitleById(titleId)
    const chapterData = getChapterById(titleId, chapterId)
    const chaptersData = getChaptersByTitleId(titleId)

    if (!titleData || !chapterData) {
      router.push("/")
      return
    }

    setTitle(titleData)
    setChapter(chapterData)
    setChapters(chaptersData.sort((a, b) => a.chapterNumber - b.chapterNumber))
    updateChapterViews(titleId, chapterId)
    setLoading(false)
  }, [params.titleId, params.chapterId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading chapter...</p>
        </div>
      </div>
    )
  }

  if (!title || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Chapter not found</h1>
          <p className="text-muted-foreground mb-4">The chapter you're looking for doesn't exist.</p>
          <button onClick={() => router.push("/")} className="text-primary hover:underline">
            Go back to homepage
          </button>
        </div>
      </div>
    )
  }

  return <MangaReader title={title} chapter={chapter} chapters={chapters} />
}
