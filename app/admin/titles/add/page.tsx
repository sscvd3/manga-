"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTitles, type Title } from "@/lib/data"

const availableGenres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Romance", "Sci-Fi", "Slice of Life"]

export default function AddTitlePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [coverImage, setCoverImage] = useState<string>("")
  const [formData, setFormData] = useState({
    title: "",
    alternateTitle: "",
    author: "",
    shortDescription: "",
    fullDescription: "",
    status: "ongoing" as "ongoing" | "completed" | "hiatus",
  })
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addGenre = (genre: string) => {
    if (!selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  const removeGenre = (genre: string) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const titles = getTitles()
      const newTitle: Title = {
        id: Date.now().toString(),
        title: formData.title,
        alternateTitle: formData.alternateTitle || undefined,
        author: formData.author || undefined,
        genres: selectedGenres,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        coverImage: coverImage || "/placeholder.svg",
        status: formData.status,
        chapterCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        views: 0,
      }

      const updatedTitles = [...titles, newTitle]
      localStorage.setItem("manga-reader-titles", JSON.stringify(updatedTitles))

      router.push("/admin/titles")
    } catch (error) {
      console.error("Error adding title:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Add New Title</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cover Image */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-[2/3] border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center relative overflow-hidden">
              {coverImage ? (
                <img
                  src={coverImage || "/placeholder.svg"}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload cover image</p>
                </div>
              )}
            </div>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
          </CardContent>
        </Card>

        {/* Title Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternateTitle">Alternate Title</Label>
                  <Input
                    id="alternateTitle"
                    value={formData.alternateTitle}
                    onChange={(e) => setFormData({ ...formData, alternateTitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="hiatus">Hiatus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Genres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedGenres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                    {genre}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeGenre(genre)} />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Add genre" />
                </SelectTrigger>
                <SelectContent>
                  {availableGenres
                    .filter((genre) => !selectedGenres.includes(genre))
                    .map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description *</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief description for cards..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullDescription">Full Description *</Label>
                <Textarea
                  id="fullDescription"
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Detailed description..."
                  rows={6}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Title"}
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
