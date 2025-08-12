"use client"

import { useEffect, useState } from "react"
import { BarChart3, TrendingUp, Users, BookOpen, Eye, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTitles, getChaptersByTitleId, type Title } from "@/lib/data"

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState({
    totalTitles: 0,
    totalChapters: 0,
    totalUsers: 0,
    totalViews: 0,
    avgChaptersPerTitle: 0,
    avgViewsPerTitle: 0,
    topTitles: [] as Title[],
    recentActivity: [] as any[],
    genreStats: {} as Record<string, number>,
    statusStats: {} as Record<string, number>,
  })

  useEffect(() => {
    const titles = getTitles()
    const users = JSON.parse(localStorage.getItem("manga-reader-users") || "[]")

    // Calculate total chapters and views
    let totalChapters = 0
    let totalViews = 0
    const allChapters: any[] = []

    titles.forEach((title) => {
      const chapters = getChaptersByTitleId(title.id)
      totalChapters += chapters.length
      totalViews += title.views

      chapters.forEach((chapter) => {
        totalViews += chapter.views
        allChapters.push({
          ...chapter,
          titleName: title.title,
        })
      })
    })

    // Top titles by views
    const topTitles = [...titles].sort((a, b) => b.views - a.views).slice(0, 5)

    // Recent activity (last 10 chapters)
    const recentActivity = allChapters.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime()).slice(0, 10)

    // Genre statistics
    const genreStats: Record<string, number> = {}
    titles.forEach((title) => {
      title.genres.forEach((genre) => {
        genreStats[genre] = (genreStats[genre] || 0) + 1
      })
    })

    // Status statistics
    const statusStats: Record<string, number> = {}
    titles.forEach((title) => {
      statusStats[title.status] = (statusStats[title.status] || 0) + 1
    })

    setStats({
      totalTitles: titles.length,
      totalChapters,
      totalUsers: users.length,
      totalViews,
      avgChaptersPerTitle: titles.length > 0 ? Math.round(totalChapters / titles.length) : 0,
      avgViewsPerTitle: titles.length > 0 ? Math.round(totalViews / titles.length) : 0,
      topTitles,
      recentActivity,
      genreStats,
      statusStats,
    })
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Statistics & Analytics</h1>

      {/* Overview Stats */}
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
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
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

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Chapters per Title</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgChaptersPerTitle}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Views per Title</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgViewsPerTitle.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Titles */}
        <Card>
          <CardHeader>
            <CardTitle>Top Titles by Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topTitles.map((title, index) => (
                <div key={title.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                  <img
                    src={title.coverImage || "/placeholder.svg"}
                    alt={title.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{title.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {title.views.toLocaleString()} views • {title.chapterCount} chapters
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Chapter Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((chapter, index) => (
                <div key={chapter.id} className="flex items-center gap-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">
                      {chapter.titleName} - Chapter {chapter.chapterNumber}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {chapter.publishDate.toLocaleDateString()} • {chapter.views} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Genre Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.genreStats)
                .sort(([, a], [, b]) => b - a)
                .map(([genre, count]) => (
                  <div key={genre} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{genre}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(count / Math.max(...Object.values(stats.genreStats))) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Title Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.statusStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(count / stats.totalTitles) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
