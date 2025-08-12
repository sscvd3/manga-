"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  BookOpen,
  Settings,
  Home,
  List,
  Download,
  MessageCircle,
  Send,
  X,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/use-auth"
import type { Title, Chapter } from "@/lib/data"

interface MangaReaderProps {
  title: Title
  chapter: Chapter
  chapters: Chapter[]
}

type ReadingMode = "vertical" | "horizontal"

interface Comment {
  id: string
  userId: string
  username: string
  content: string
  timestamp: number
  likes: number
}

export function MangaReader({ title, chapter, chapters }: MangaReaderProps) {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [readingMode, setReadingMode] = useState<ReadingMode>("vertical")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [showTranslationNotice, setShowTranslationNotice] = useState(true)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [autoScroll, setAutoScroll] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(50)
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [customShortcuts, setCustomShortcuts] = useState({
    prevPage: "ArrowLeft",
    nextPage: "ArrowRight",
    toggleMode: "v",
    fullscreen: "f",
    darkMode: "d",
  })
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const autoScrollRef = useRef<NodeJS.Timeout>()

  const currentChapterIndex = chapters.findIndex((c) => c.id === chapter.id)
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null
  const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null

  useEffect(() => {
    const savedComments = localStorage.getItem(`comments_${chapter.id}`)
    if (savedComments) {
      setComments(JSON.parse(savedComments))
    } else {
      setComments([])
    }
  }, [chapter.id])

  const addComment = () => {
    if (!user || !newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      content: newComment.trim(),
      timestamp: Date.now(),
      likes: 0,
    }

    const updatedComments = [...comments, comment]
    setComments(updatedComments)
    localStorage.setItem(`comments_${chapter.id}`, JSON.stringify(updatedComments))
    setNewComment("")
  }

  const downloadChapter = async () => {
    if (isDownloading) return

    setIsDownloading(true)
    try {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      for (let i = 0; i < chapter.pages.length; i++) {
        const pageUrl = chapter.pages[i]
        if (pageUrl && !pageUrl.includes("placeholder.svg")) {
          try {
            const response = await fetch(pageUrl)
            const blob = await response.blob()
            const paddedIndex = String(i + 1).padStart(3, "0")
            const extension = pageUrl.split(".").pop() || "jpg"
            zip.file(`${paddedIndex}.${extension}`, blob)
          } catch (error) {
            console.error(`Failed to download page ${i + 1}:`, error)
          }
        }
      }

      const content = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(content)
      const link = document.createElement("a")
      link.href = url
      link.download = `${title.title} - Chapter ${chapter.chapterNumber}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download chapter:", error)
      alert("Failed to download chapter. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    if (autoScroll && readingMode === "vertical") {
      autoScrollRef.current = setInterval(() => {
        window.scrollBy(0, scrollSpeed / 10)
      }, 100)
    } else if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current)
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
      }
    }
  }, [autoScroll, scrollSpeed, readingMode])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case customShortcuts.prevPage:
          if (readingMode === "horizontal") {
            prevPage()
          }
          break
        case customShortcuts.nextPage:
          if (readingMode === "horizontal") {
            nextPage()
          }
          break
        case "ArrowUp":
          if (readingMode === "vertical") {
            window.scrollBy(0, -100)
          }
          break
        case "ArrowDown":
          if (readingMode === "vertical") {
            window.scrollBy(0, 100)
          }
          break
        case customShortcuts.fullscreen:
        case "F":
          toggleFullscreen()
          break
        case customShortcuts.darkMode:
        case "D":
          setIsDarkMode(!isDarkMode)
          break
        case customShortcuts.toggleMode:
        case "V":
          setReadingMode(readingMode === "vertical" ? "horizontal" : "vertical")
          break
        case " ":
          e.preventDefault()
          setAutoScroll(!autoScroll)
          break
        case "Escape":
          setFocusMode(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [readingMode, isDarkMode, autoScroll, customShortcuts])

  const speakText = (text: string) => {
    if (voiceEnabled && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  const saveProgress = useCallback(() => {
    if (!user) return

    const newHistory = user.readingHistory.filter((h) => h.titleId !== title.id)
    newHistory.push({
      titleId: title.id,
      chapterId: chapter.id,
      lastPage: currentPage,
      timestamp: Date.now(),
    })

    updateUser({ readingHistory: newHistory })
  }, [user, title.id, chapter.id, currentPage, updateUser])

  useEffect(() => {
    if (user) {
      const savedProgress = user.readingHistory.find((h) => h.titleId === title.id && h.chapterId === chapter.id)
      if (savedProgress && savedProgress.lastPage > 0) {
        setCurrentPage(savedProgress.lastPage)
      }
    }
  }, [user, title.id, chapter.id])

  useEffect(() => {
    const timeoutId = setTimeout(saveProgress, 1000)
    return () => clearTimeout(timeoutId)
  }, [currentPage, saveProgress])

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    } else if (prevChapter) {
      router.push(`/read/${title.id}/${prevChapter.id}`)
    }
  }

  const nextPage = () => {
    if (currentPage < chapter.pages.length - 1) {
      setCurrentPage(currentPage + 1)
    } else if (nextChapter) {
      router.push(`/read/${title.id}/${nextChapter.id}`)
    }
  }

  const goToChapter = (chapterId: string) => {
    router.push(`/read/${title.id}/${chapterId}`)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const goHome = () => {
    router.push("/")
  }

  const goToTitle = () => {
    router.push(`/title/${title.id}`)
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""} ${focusMode ? "bg-black" : "bg-background"}`}>
      <style jsx>{`
        .reader-image {
          filter: brightness(${brightness}%) contrast(${contrast}%);
          transition: filter 0.3s ease;
        }
      `}</style>

      {showTranslationNotice && !focusMode && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-blue-500/90 text-white p-2 text-center text-sm">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <span>This chapter can be translated using Google Translate (use your browser's translate option)</span>
            <Button variant="ghost" size="sm" onClick={() => setShowTranslationNotice(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b transition-transform duration-300 ${
          showControls && !focusMode ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={goHome}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button variant="ghost" size="sm" onClick={goToTitle}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {title.title}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={chapter.id} onValueChange={goToChapter}>
              <SelectTrigger className="w-48">
                <SelectValue>
                  Chapter {chapter.chapterNumber}
                  {chapter.chapterTitle && ` - ${chapter.chapterTitle}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {chapters.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    Chapter {ch.chapterNumber}
                    {ch.chapterTitle && ` - ${ch.chapterTitle}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Comments ({comments.length})
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowAdvancedControls(!showAdvancedControls)}>
              <Sliders className="h-4 w-4 mr-2" />
              Advanced
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setReadingMode("vertical")}>
                  <List className="h-4 w-4 mr-2" />
                  Vertical Scroll
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReadingMode("horizontal")}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Page by Page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFocusMode(!focusMode)}>
                  <Monitor className="h-4 w-4 mr-2" />
                  {focusMode ? "Exit Focus Mode" : "Focus Mode"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleFullscreen}>
                  <Monitor className="h-4 w-4 mr-2" />
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadChapter} disabled={isDownloading}>
                  <Download className="h-4 w-4 mr-2" />
                  {isDownloading ? "Downloading..." : "Download Chapter"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {showAdvancedControls && !focusMode && (
        <div className="fixed top-16 right-4 z-40 w-80">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Advanced Controls
                <Button variant="ghost" size="sm" onClick={() => setShowAdvancedControls(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Brightness: {brightness}%</label>
                <Slider
                  value={[brightness]}
                  onValueChange={(value) => setBrightness(value[0])}
                  max={200}
                  min={50}
                  step={10}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contrast: {contrast}%</label>
                <Slider
                  value={[contrast]}
                  onValueChange={(value) => setContrast(value[0])}
                  max={200}
                  min={50}
                  step={10}
                  className="mt-2"
                />
              </div>

              {readingMode === "vertical" && (
                <>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto Scroll</label>
                    <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
                  </div>

                  {autoScroll && (
                    <div>
                      <label className="text-sm font-medium">Scroll Speed: {scrollSpeed}%</label>
                      <Slider
                        value={[scrollSpeed]}
                        onValueChange={(value) => setScrollSpeed(value[0])}
                        max={100}
                        min={10}
                        step={10}
                        className="mt-2"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Voice Reading</label>
                <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBrightness(100)
                    setContrast(100)
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                {voiceEnabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speakText(`Chapter ${chapter.chapterNumber} of ${title.title}`)}
                  >
                    {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showComments && !focusMode && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l z-40 overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Comments</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowComments(false)}>
                ×
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {user && (
            <div className="p-4 border-t">
              <div className="space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <Button onClick={addComment} disabled={!newComment.trim()} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`pt-16 ${showComments && !focusMode ? "pr-80" : ""} ${focusMode ? "pt-0" : ""}`}>
        {readingMode === "vertical" ? (
          <div className="max-w-4xl mx-auto">
            {chapter.pages.map((page, index) => (
              <div key={index} className="w-full">
                <img
                  src={page || "/placeholder.svg"}
                  alt={`صفحة ${index + 1}`}
                  className="w-full h-auto block reader-image"
                  loading={index < 3 ? "eager" : "lazy"}
                  onLoad={() => {
                    if (index === currentPage) {
                      setCurrentPage(index)
                    }
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    if (target.src !== "/placeholder.svg") {
                      target.src = "/placeholder.svg"
                    }
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-screen relative">
            <Button
              variant="ghost"
              size="lg"
              className="absolute left-4 z-10 h-16 w-16 rounded-full bg-background/80 hover:bg-background"
              onClick={prevPage}
              disabled={currentPage === 0 && !prevChapter}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <div className="max-w-4xl max-h-screen p-4">
              <img
                src={chapter.pages[currentPage] || "/placeholder.svg"}
                alt={`صفحة ${currentPage + 1}`}
                className="max-w-full max-h-full object-contain mx-auto reader-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (target.src !== "/placeholder.svg") {
                    target.src = "/placeholder.svg"
                  }
                }}
              />
            </div>

            <Button
              variant="ghost"
              size="lg"
              className="absolute right-4 z-10 h-16 w-16 rounded-full bg-background/80 hover:bg-background"
              onClick={nextPage}
              disabled={currentPage === chapter.pages.length - 1 && !nextChapter}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            {!focusMode && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/90 px-4 py-2 rounded-full">
                <span className="text-sm font-medium">
                  Page {currentPage + 1} of {chapter.pages.length}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t transition-transform duration-300 ${
          showControls && !focusMode ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            {prevChapter && (
              <Button variant="outline" size="sm" onClick={() => goToChapter(prevChapter.id)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Prev Chapter
              </Button>
            )}
            {readingMode === "vertical" && (
              <Button variant="outline" size="sm" onClick={() => setAutoScroll(!autoScroll)}>
                {autoScroll ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {autoScroll ? "Pause" : "Auto Scroll"}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Chapter {chapter.chapterNumber}
              {readingMode === "horizontal" && ` • Page ${currentPage + 1}/${chapter.pages.length}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {nextChapter && (
              <Button variant="outline" size="sm" onClick={() => goToChapter(nextChapter.id)}>
                Next Chapter
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {readingMode === "horizontal" && (
        <>
          <div className="fixed left-0 top-16 bottom-16 w-1/3 z-10 md:hidden" onClick={prevPage} />
          <div className="fixed right-0 top-16 bottom-16 w-1/3 z-10 md:hidden" onClick={nextPage} />
        </>
      )}

      {focusMode && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/80 text-white px-4 py-2 rounded-full text-sm">
          Focus Mode - Press ESC to exit
        </div>
      )}
    </div>
  )
}
