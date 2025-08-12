"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { getTitleById, type Title } from "@/lib/data"

export default function FavoritesPage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [favoritesTitles, setFavoritesTitles] = useState<Title[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const favorites = user.favorites.map((id) => getTitleById(id)).filter(Boolean) as Title[]
    setFavoritesTitles(favorites)
  }, [user, router])

  const removeFavorite = (titleId: string) => {
    if (!user) return
    const newFavorites = user.favorites.filter((id) => id !== titleId)
    updateUser({ favorites: newFavorites })
    setFavoritesTitles(favoritesTitles.filter((title) => title.id !== titleId))
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <p className="text-muted-foreground">{favoritesTitles.length} titles in your favorites</p>
          </div>
        </div>

        {favoritesTitles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-6">
                Start exploring and add your favorite manga and manhwa to this list!
              </p>
              <Button asChild>
                <Link href="/">Browse Titles</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 left-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => {
                    e.preventDefault()
                    removeFavorite(title.id)
                  }}
                  title="Remove from favorites"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
