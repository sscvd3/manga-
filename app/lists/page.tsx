"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { getTitles, type Title } from "@/lib/data"
import Link from "next/link"
import { Heart, BookOpen, Clock, CheckCircle, History, Download, Bell } from "lucide-react"

export default function ListsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("favorites")

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-lg text-muted-foreground">يجب تسجيل الدخول لعرض القوائم</p>
              <Link href="/login">
                <Button className="mt-4">تسجيل الدخول</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const titles = getTitles()

  const getFavorites = () => titles.filter((title) => user.favorites.includes(title.id))

  const getCurrentlyReading = () => {
    const readingTitles = user.readingHistory
      .filter((h) => h.lastPage > 0)
      .map((h) => titles.find((t) => t.id === h.titleId))
      .filter(Boolean) as Title[]
    return readingTitles
  }

  const getReadLater = () => {
    const readLater = JSON.parse(localStorage.getItem(`readLater_${user.id}`) || "[]")
    return titles.filter((title) => readLater.includes(title.id))
  }

  const getCompleted = () => {
    const completed = JSON.parse(localStorage.getItem(`completed_${user.id}`) || "[]")
    return titles.filter((title) => completed.includes(title.id))
  }

  const renderTitleGrid = (titleList: Title[], emptyMessage: string) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {titleList.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        titleList.map((title) => (
          <Link key={title.id} href={`/title/${title.id}`}>
            <Card className="hover:shadow-lg transition-shadow">
              <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                <img
                  src={title.coverImage || "/placeholder.svg"}
                  alt={title.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{title.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {title.chapterCount} فصل • {title.views.toLocaleString()} مشاهدة
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {title.genres.slice(0, 2).map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">قوائم المستخدم</h1>
          <p className="text-muted-foreground">إدارة مجموعاتك وقوائم القراءة</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">المفضلة</span>
            </TabsTrigger>
            <TabsTrigger value="reading" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">أقرأها الآن</span>
            </TabsTrigger>
            <TabsTrigger value="readLater" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">لاحقاً</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">مكتملة</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">السجل</span>
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">التحميلات</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">الإشعارات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  قائمة المفضلة ({getFavorites().length})
                </CardTitle>
              </CardHeader>
              <CardContent>{renderTitleGrid(getFavorites(), "لا توجد عناوين في المفضلة")}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reading">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  أقرأها الآن ({getCurrentlyReading().length})
                </CardTitle>
              </CardHeader>
              <CardContent>{renderTitleGrid(getCurrentlyReading(), "لا توجد قراءات حالية")}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="readLater">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  القراءة لاحقاً ({getReadLater().length})
                </CardTitle>
              </CardHeader>
              <CardContent>{renderTitleGrid(getReadLater(), "لا توجد عناوين للقراءة لاحقاً")}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  الأعمال المقروءة ({getCompleted().length})
                </CardTitle>
              </CardHeader>
              <CardContent>{renderTitleGrid(getCompleted(), "لا توجد أعمال مكتملة")}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  سجل المشاهدات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.readingHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">لا يوجد سجل قراءة</p>
                  ) : (
                    user.readingHistory.slice(0, 20).map((history, index) => {
                      const title = titles.find((t) => t.id === history.titleId)
                      if (!title) return null
                      const chapter = title.chapters.find((c) => c.id === history.chapterId)
                      return (
                        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img
                            src={title.coverImage || "/placeholder.svg"}
                            alt={title.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{title.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Chapter {chapter?.chapterNumber || "?"}
                              {chapter?.chapterTitle && ` - ${chapter.chapterTitle}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(history.timestamp).toLocaleDateString("ar")}
                            </p>
                          </div>
                          <Link href={`/read/${history.titleId}/${history.chapterId}`}>
                            <Button variant="outline" size="sm">
                              متابعة القراءة
                            </Button>
                          </Link>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  قائمة التحميلات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">لا توجد تحميلات محفوظة</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">لا توجد إشعارات جديدة</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
