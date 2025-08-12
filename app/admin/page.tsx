"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, FileText, Users, Eye, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTitles, type Title } from "@/lib/data"

export default function AdminDashboard() {
  const [titles, setTitles] = useState<Title[]>([])
  const [stats, setStats] = useState({
    totalTitles: 0,
    totalChapters: 0,
    totalUsers: 0,
    totalViews: 0,
  })

  useEffect(() => {
    const titlesData = getTitles()
    setTitles(titlesData)

    // Calculate stats
    const totalChapters = titlesData.reduce((sum, title) => sum + title.chapterCount, 0)
    const totalViews = titlesData.reduce((sum, title) => sum + title.views, 0)
    const users = JSON.parse(localStorage.getItem("manga-reader-users") || "[]")

    setStats({
      totalTitles: titlesData.length,
      totalChapters,
      totalUsers: users.length,
      totalViews,
    })
  }, [])

  const recentTitles = [...titles].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/titles/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Title
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Titles</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTitles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChapters}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Titles */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Titles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTitles.map((title) => (
              <div key={title.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={title.coverImage || "/placeholder.svg"}
                    alt={title.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium">{title.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {title.chapterCount} chapters • {title.views} views
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/titles/${title.id}/chapters/add`}>Add Chapter</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/titles/${title.id}/edit`}>Edit</Link>
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
