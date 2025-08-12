"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, History, Heart, BookOpen, Clock, CheckCircle, Bell, Download, TrendingUp } from "lucide-react"
import { getTitles, type Title } from "@/lib/data"
import { useAuth } from "@/hooks/use-auth"

export function Sidebar() {
  const { user } = useAuth()
  const [latestTitles, setLatestTitles] = useState<Title[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    const titles = getTitles()
    const sorted = [...titles].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5)
    setLatestTitles(sorted)
  }, [])

  // Get user's reading lists
  const getFavorites = () => {
    if (!user) return []
    const titles = getTitles()
    return titles.filter((title) => user.favorites.includes(title.id))
  }

  const getCurrentlyReading = () => {
    if (!user) return []
    const titles = getTitles()
    const readingTitles = user.readingHistory
      .filter((h) => h.lastPage > 0)
      .map((h) => titles.find((t) => t.id === h.titleId))
      .filter(Boolean) as Title[]
    return readingTitles.slice(0, 10)
  }

  const getReadLater = () => {
    if (!user) return []
    const readLater = JSON.parse(localStorage.getItem(`readLater_${user.id}`) || "[]")
    const titles = getTitles()
    return titles.filter((title) => readLater.includes(title.id))
  }

  const getCompleted = () => {
    if (!user) return []
    const completed = JSON.parse(localStorage.getItem(`completed_${user.id}`) || "[]")
    const titles = getTitles()
    return titles.filter((title) => completed.includes(title.id))
  }

  const getDownloads = () => {
    if (!user) return []
    const downloads = JSON.parse(localStorage.getItem(`downloads_${user.id}`) || "[]")
    return downloads
  }

  const toggleReadLater = (titleId: string) => {
    if (!user) return
    const readLater = JSON.parse(localStorage.getItem(`readLater_${user.id}`) || "[]")
    const updated = readLater.includes(titleId)
      ? readLater.filter((id: string) => id !== titleId)
      : [...readLater, titleId]
    localStorage.setItem(`readLater_${user.id}`, JSON.stringify(updated))
  }

  const toggleCompleted = (titleId: string) => {
    if (!user) return
    const completed = JSON.parse(localStorage.getItem(`completed_${user.id}`) || "[]")
    const updated = completed.includes(titleId)
      ? completed.filter((id: string) => id !== titleId)
      : [...completed, titleId]
    localStorage.setItem(`completed_${user.id}`, JSON.stringify(updated))
  }

  const renderTitleList = (titles: Title[], emptyMessage: string) => (
    <div className="space-y-2">
      {titles.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
      ) : (
        titles.map((title) => (
          <Link key={title.id} href={`/title/${title.id}`}>
            <div className="flex items-center space-x-3 hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <img
                src={title.coverImage || "/placeholder.svg"}
                alt={title.title}
                className="w-10 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1">{title.title}</h4>
                <p className="text-xs text-muted-foreground">{title.chapterCount} chapters</p>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Search Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-4 w-4" />
            البحث عن مانجا
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="ابحث عن المانجا..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* User Lists - Only show if logged in */}
      {user && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">قوائم المستخدم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={activeSection === "favorites" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection(activeSection === "favorites" ? null : "favorites")}
            >
              <Heart className="h-4 w-4 mr-2" />
              قائمة المفضلة ({getFavorites().length})
            </Button>

            <Button
              variant={activeSection === "reading" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection(activeSection === "reading" ? null : "reading")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              أقرأها الآن ({getCurrentlyReading().length})
            </Button>

            <Button
              variant={activeSection === "readLater" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection(activeSection === "readLater" ? null : "readLater")}
            >
              <Clock className="h-4 w-4 mr-2" />
              القراءة لاحقاً ({getReadLater().length})
            </Button>

            <Button
              variant={activeSection === "completed" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection(activeSection === "completed" ? null : "completed")}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              الأعمال المقروءة ({getCompleted().length})
            </Button>

            <Button
              variant={activeSection === "history" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection(activeSection === "history" ? null : "history")}
            >
              <History className="h-4 w-4 mr-2" />
              سجل المشاهدات
            </Button>

            <Button
              variant={activeSection === "downloads" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection(activeSection === "downloads" ? null : "downloads")}
            >
              <Download className="h-4 w-4 mr-2" />
              قائمة التحميلات ({getDownloads().length})
            </Button>

            <Button
              variant={activeSection === "notifications" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection(activeSection === "notifications" ? null : "notifications")}
            >
              <Bell className="h-4 w-4 mr-2" />
              قائمة الإشعارات
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Section Content */}
      {activeSection && user && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {activeSection === "favorites" && "المفضلة"}
              {activeSection === "reading" && "أقرأها الآن"}
              {activeSection === "readLater" && "القراءة لاحقاً"}
              {activeSection === "completed" && "الأعمال المقروءة"}
              {activeSection === "history" && "سجل المشاهدات"}
              {activeSection === "downloads" && "التحميلات"}
              {activeSection === "notifications" && "الإشعارات"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSection === "favorites" && renderTitleList(getFavorites(), "لا توجد مفضلة بعد")}
            {activeSection === "reading" && renderTitleList(getCurrentlyReading(), "لا توجد قراءات حالية")}
            {activeSection === "readLater" && renderTitleList(getReadLater(), "لا توجد عناوين للقراءة لاحقاً")}
            {activeSection === "completed" && renderTitleList(getCompleted(), "لا توجد أعمال مكتملة")}
            {activeSection === "history" && (
              <div className="space-y-2">
                {user.readingHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">لا يوجد سجل قراءة</p>
                ) : (
                  user.readingHistory.slice(0, 10).map((history) => {
                    const title = getTitles().find((t) => t.id === history.titleId)
                    if (!title) return null
                    return (
                      <Link
                        key={`${history.titleId}-${history.chapterId}`}
                        href={`/read/${history.titleId}/${history.chapterId}`}
                      >
                        <div className="flex items-center space-x-3 hover:bg-muted/50 p-2 rounded-lg transition-colors">
                          <img
                            src={title.coverImage || "/placeholder.svg"}
                            alt={title.title}
                            className="w-10 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1">{title.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              Chapter {title.chapters.find((c) => c.id === history.chapterId)?.chapterNumber || "?"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            )}
            {activeSection === "downloads" && (
              <div className="space-y-2">
                {getDownloads().length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد تحميلات</p>
                ) : (
                  getDownloads().map((download: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{download.title}</p>
                        <p className="text-xs text-muted-foreground">{download.chapter}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {download.size || "Unknown"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeSection === "notifications" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد إشعارات جديدة</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Latest Added */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-4 w-4" />
            أعمال جديدة
          </CardTitle>
        </CardHeader>
        <CardContent>{renderTitleList(latestTitles, "لا توجد أعمال جديدة")}</CardContent>
      </Card>

      {/* Popular Genres */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            الأنواع الشائعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Action", "Romance", "Fantasy", "Drama", "Comedy", "Adventure", "Horror", "Slice of Life"].map(
              (genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                >
                  {genre}
                </Badge>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
