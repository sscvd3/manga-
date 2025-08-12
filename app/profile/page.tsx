"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Heart, Clock, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { getTitleById, getChapterById, type Title } from "@/lib/data"

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [favoritesTitles, setFavoritesTitles] = useState<Title[]>([])
  const [recentReading, setRecentReading] = useState<
    Array<{
      title: Title
      chapterNumber: number
      chapterTitle?: string
      lastPage: number
      timestamp: number
    }>
  >([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Load favorite titles
    const favorites = user.favorites.map((id) => getTitleById(id)).filter(Boolean) as Title[]
    setFavoritesTitles(favorites)

    // Load recent reading history
    const recentHistory = user.readingHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map((history) => {
        const title = getTitleById(history.titleId)
        const chapter = getChapterById(history.titleId, history.chapterId)
        if (title && chapter) {
          return {
            title,
            chapterNumber: chapter.chapterNumber,
            chapterTitle: chapter.chapterTitle,
            lastPage: history.lastPage,
            timestamp: history.timestamp,
          }
        }
        return null
      })
      .filter(Boolean) as any[]

    setRecentReading(recentHistory)
  }, [user, router])

  const removeFavorite = (titleId: string) => {
    if (!user) return
    const newFavorites = user.favorites.filter((id) => id !== titleId)
    user.updateUser?.({ favorites: newFavorites })
    setFavoritesTitles(favoritesTitles.filter((title) => title.id !== titleId))
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.username}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="mt-1">
                  {user.role}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/profile/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="favorites" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="favorites">
              <Heart className="h-4 w-4 mr-2" />
              Favorites ({favoritesTitles.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-2" />
              Reading History
            </TabsTrigger>
            <TabsTrigger value="stats">
              <User className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Favorite Titles</CardTitle>
              </CardHeader>
              <CardContent>
                {favoritesTitles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No favorites yet</p>
                    <p>Start reading and add titles to your favorites!</p>
                    <Button asChild className="mt-4">
                      <Link href="/">Browse Titles</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {favoritesTitles.map((title) => (
                      <div key={title.id} className="group relative">
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-0">
                            <Link href={`/title/${title.id}`}>
                              <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
                                <img
                                  src={title.coverImage || "/placeholder.svg"}
                                  alt={title.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
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
                                <p className="text-xs text-muted-foreground">{title.chapterCount} chapters</p>
                              </div>
                            </Link>
                          </CardContent>
                        </Card>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFavorite(title.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reading History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reading History</CardTitle>
              </CardHeader>
              <CardContent>
                {recentReading.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No reading history</p>
                    <p>Start reading to see your progress here!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReading.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                        <img
                          src={item.title.coverImage || "/placeholder.svg"}
                          alt={item.title.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.title.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Chapter {item.chapterNumber}
                            {item.chapterTitle && ` - ${item.chapterTitle}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last read: Page {item.lastPage + 1} • {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/title/${item.title.id}`}>View Title</Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/read/${item.title.id}/${item.title.id}-${item.chapterNumber}`}>
                              Continue Reading
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Favorites</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{favoritesTitles.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chapters Read</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{user.readingHistory.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-lg px-3 py-1">
                    {user.role}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Favorite Genres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(favoritesTitles.flatMap((title) => title.genres))).map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-sm">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
