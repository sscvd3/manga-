"use client"

import { useEffect, useState } from "react"
import { Trophy, Star, BookOpen, Heart, MessageCircle, Calendar, Award, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: "reading" | "social" | "milestone" | "special"
  requirement: number
  progress: number
  unlocked: boolean
  unlockedAt?: number
  isNew?: boolean
  rarity: "common" | "rare" | "epic" | "legendary"
}

export default function AchievementsPage() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all")

  useEffect(() => {
    if (user) {
      const savedAchievements = JSON.parse(localStorage.getItem(`achievements_${user.id}`) || "[]")

      // Initialize achievements if none exist
      if (savedAchievements.length === 0) {
        const defaultAchievements: Achievement[] = [
          {
            id: "first_read",
            title: "First Steps",
            description: "Read your first chapter",
            icon: "BookOpen",
            category: "reading",
            requirement: 1,
            progress: 1,
            unlocked: true,
            unlockedAt: Date.now() - 86400000,
            rarity: "common",
          },
          {
            id: "bookworm",
            title: "Bookworm",
            description: "Read 50 chapters",
            icon: "BookOpen",
            category: "reading",
            requirement: 50,
            progress: 23,
            unlocked: false,
            rarity: "rare",
          },
          {
            id: "speed_reader",
            title: "Speed Reader",
            description: "Read 10 chapters in one day",
            icon: "Target",
            category: "reading",
            requirement: 10,
            progress: 3,
            unlocked: false,
            rarity: "epic",
          },
          {
            id: "social_butterfly",
            title: "Social Butterfly",
            description: "Leave 25 comments",
            icon: "MessageCircle",
            category: "social",
            requirement: 25,
            progress: 8,
            unlocked: false,
            rarity: "rare",
          },
          {
            id: "heart_collector",
            title: "Heart Collector",
            description: "Add 20 titles to favorites",
            icon: "Heart",
            category: "social",
            requirement: 20,
            progress: 5,
            unlocked: false,
            rarity: "common",
          },
          {
            id: "early_bird",
            title: "Early Bird",
            description: "Be among the first 100 users",
            icon: "Star",
            category: "special",
            requirement: 1,
            progress: 1,
            unlocked: true,
            unlockedAt: Date.now() - 172800000,
            isNew: true,
            rarity: "legendary",
          },
          {
            id: "loyal_reader",
            title: "Loyal Reader",
            description: "Visit the site for 30 consecutive days",
            icon: "Calendar",
            category: "milestone",
            requirement: 30,
            progress: 12,
            unlocked: false,
            rarity: "epic",
          },
          {
            id: "manga_master",
            title: "Manga Master",
            description: "Read 500 chapters",
            icon: "Award",
            category: "milestone",
            requirement: 500,
            progress: 23,
            unlocked: false,
            rarity: "legendary",
          },
        ]
        setAchievements(defaultAchievements)
        localStorage.setItem(`achievements_${user.id}`, JSON.stringify(defaultAchievements))
      } else {
        setAchievements(savedAchievements)
      }
    }
  }, [user])

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "BookOpen":
        return <BookOpen className="h-6 w-6" />
      case "Heart":
        return <Heart className="h-6 w-6" />
      case "MessageCircle":
        return <MessageCircle className="h-6 w-6" />
      case "Star":
        return <Star className="h-6 w-6" />
      case "Calendar":
        return <Calendar className="h-6 w-6" />
      case "Award":
        return <Award className="h-6 w-6" />
      case "Target":
        return <Target className="h-6 w-6" />
      default:
        return <Trophy className="h-6 w-6" />
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-500 border-gray-200"
      case "rare":
        return "text-blue-500 border-blue-200"
      case "epic":
        return "text-purple-500 border-purple-200"
      case "legendary":
        return "text-yellow-500 border-yellow-200"
      default:
        return "text-gray-500 border-gray-200"
    }
  }

  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === "unlocked") return achievement.unlocked
    if (filter === "locked") return !achievement.unlocked
    return true
  })

  const groupedAchievements = filteredAchievements.reduce(
    (groups, achievement) => {
      const category = achievement.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(achievement)
      return groups
    },
    {} as Record<string, Achievement[]>,
  )

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length
  const completionPercentage = (unlockedCount / totalCount) * 100

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view achievements.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Achievements</h1>
            <p className="text-muted-foreground mb-4">Track your progress and unlock rewards as you explore manga!</p>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Overall Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      {unlockedCount} of {totalCount} achievements unlocked
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{Math.round(completionPercentage)}%</div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </CardContent>
            </Card>
          </div>

          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked ({unlockedCount})</TabsTrigger>
              <TabsTrigger value="locked">Locked ({totalCount - unlockedCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
                <div key={category} className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 capitalize">
                    {category === "reading" && "📚 Reading"}
                    {category === "social" && "👥 Social"}
                    {category === "milestone" && "🎯 Milestones"}
                    {category === "special" && "⭐ Special"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryAchievements.map((achievement) => (
                      <Card
                        key={achievement.id}
                        className={`${achievement.unlocked ? getRarityColor(achievement.rarity) : "opacity-60"} ${
                          achievement.isNew ? "ring-2 ring-yellow-400" : ""
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${achievement.unlocked ? "bg-primary/10" : "bg-muted"}`}>
                              {getIcon(achievement.icon)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{achievement.title}</h3>
                                {achievement.isNew && <Badge className="bg-yellow-500">New!</Badge>}
                                <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                                  {achievement.rarity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>

                              {achievement.unlocked ? (
                                <div className="flex items-center gap-2">
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm font-medium text-green-600">Unlocked!</span>
                                  {achievement.unlockedAt && (
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>
                                      {achievement.progress}/{achievement.requirement}
                                    </span>
                                  </div>
                                  <Progress
                                    value={(achievement.progress / achievement.requirement) * 100}
                                    className="h-2"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
