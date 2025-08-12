"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Eye,
  Heart,
  Share2,
  Star,
  Facebook,
  Twitter,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { getTitleById, getChaptersByTitleId, updateTitleViews, type Title, type Chapter } from "@/lib/data"

export default function TitlePage() {
  const params = useParams()
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [title, setTitle] = useState<Title | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  const toggleFavorite = () => {
    if (!user || !title) return

    const newFavorites = user.favorites.includes(title.id)
      ? user.favorites.filter((id) => id !== title.id)
      : [...user.favorites, title.id]

    updateUser({ favorites: newFavorites })
    setIsFavorite(!isFavorite)
  }

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Check out ${title?.title} - ${title?.shortDescription}`)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, "_blank")
  }

  const shareToTwitter = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Reading ${title?.title} - ${title?.shortDescription}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank")
  }

  const shareToWhatsApp = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Check out ${title?.title} - ${title?.shortDescription} ${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const toggleLike = () => {
    if (!user || !title) return

    const newLiked = !isLiked
    setIsLiked(newLiked)
    setLikes((prev) => (newLiked ? prev + 1 : prev - 1))

    // Save to user data
    const newLikes = user.likedTitles || []
    const updatedLikes = newLiked ? [...newLikes, title.id] : newLikes.filter((id) => id !== title.id)

    updateUser({ likedTitles: updatedLikes })
  }

  useEffect(() => {
    const titleId = params.id as string
    if (!titleId) return

    const titleData = getTitleById(titleId)
    if (!titleData) {
      router.push("/")
      return
    }

    setTitle(titleData)
    setChapters(getChaptersByTitleId(titleId))
    updateTitleViews(titleId)

    // Check if title is in user's favorites
    if (user) {
      setIsFavorite(user.favorites.includes(titleId))
      const userTitleRating = user.ratings?.find((r) => r.titleId === titleId)
      setUserRating(userTitleRating?.rating || 0)
      setIsLiked(user.likedTitles?.includes(titleId) || false)
    }

    setLikes(Math.floor(titleData.views * 0.1))
    setLoading(false)
  }, [params.id, user, router])

  const handleRating = (rating: number) => {
    if (!user || !title) return

    const existingRatingIndex = user.ratings?.findIndex((r) => r.titleId === title.id) ?? -1
    const newRatings = [...(user.ratings || [])]

    if (existingRatingIndex >= 0) {
      newRatings[existingRatingIndex] = { titleId: title.id, rating }
    } else {
      newRatings.push({ titleId: title.id, rating })
    }

    updateUser({ ratings: newRatings })
    setUserRating(rating)
  }

  const getLastReadChapter = () => {
    if (!user || !title) return null
    const lastRead = user.readingHistory.find((h) => h.titleId === title.id)
    return lastRead ? chapters.find((c) => c.id === lastRead.chapterId) : null
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!title) {
    return <div className="min-h-screen flex items-center justify-center">Title not found</div>
  }

  const lastReadChapter = getLastReadChapter()
  const sortedChapters = [...chapters].sort((a, b) => b.chapterNumber - a.chapterNumber)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Title Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <img
                    src={title.coverImage || "/placeholder.svg"}
                    alt={title.title}
                    className="w-full aspect-[2/3] object-cover rounded-lg"
                  />

                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold">{title.title}</h1>
                    {title.author && <p className="text-muted-foreground">by {title.author}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {title.genres.map((genre) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                    <Badge variant={title.status === "ongoing" ? "default" : "outline"}>{title.status}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {title.chapterCount} chapters
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {title.views.toLocaleString()} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {title.averageRating?.toFixed(1) || "N/A"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    {likes.toLocaleString()} likes
                  </div>

                  <div className="flex items-center gap-1 text-sm text-text-foreground">
                    <Calendar className="h-4 w-4" />
                    Updated {title.lastUpdated.toLocaleDateString()}
                  </div>

                  {user && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Your Rating:</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-colors"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                star <= (hoverRating || userRating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                        {userRating > 0 && <span className="ml-2 text-sm text-muted-foreground">{userRating}/5</span>}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {lastReadChapter ? (
                      <Button asChild className="w-full">
                        <Link href={`/read/${title.id}/${lastReadChapter.id}`}>
                          Continue Reading - Chapter {lastReadChapter.chapterNumber}
                        </Link>
                      </Button>
                    ) : chapters.length > 0 ? (
                      <Button asChild className="w-full">
                        <Link href={`/read/${title.id}/${chapters[0].id}`}>Start Reading</Link>
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        No Chapters Available
                      </Button>
                    )}

                    <div className="flex gap-2">
                      {user && (
                        <Button variant="outline" onClick={toggleFavorite} className="flex-1 bg-transparent">
                          <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                          {isFavorite ? "Favorited" : "Add to Favorites"}
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={shareToFacebook}>
                            <Facebook className="h-4 w-4 mr-2" />
                            Share on Facebook
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={shareToTwitter}>
                            <Twitter className="h-4 w-4 mr-2" />
                            Share on Twitter
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={shareToWhatsApp}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Share on WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={copyToClipboard}>
                            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            {copied ? "Copied!" : "Copy Link"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {user && (
                        <Button variant="outline" size="icon" onClick={toggleLike}>
                          <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description and Chapters */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{title.fullDescription}</p>
              </CardContent>
            </Card>

            {/* Chapters */}
            <Card>
              <CardHeader>
                <CardTitle>Chapters ({chapters.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sortedChapters.map((chapter, index) => (
                    <div key={chapter.id}>
                      <Link href={`/read/${title.id}/${chapter.id}`}>
                        <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors group">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-medium group-hover:text-primary transition-colors">
                                Chapter {chapter.chapterNumber}
                                {chapter.chapterTitle && ` - ${chapter.chapterTitle}`}
                              </span>
                              {lastReadChapter?.id === chapter.id && (
                                <Badge variant="outline" className="text-xs">
                                  Last Read
                                </Badge>
                              )}
                              {chapter.averageRating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">{chapter.averageRating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{chapter.publishDate.toLocaleDateString()}</span>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {chapter.views}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Read
                          </Button>
                        </div>
                      </Link>
                      {index < sortedChapters.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
