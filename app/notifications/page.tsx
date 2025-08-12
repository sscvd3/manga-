"use client"

import { useEffect, useState } from "react"
import { Bell, Check, Trash2, BookOpen, Heart, MessageCircle, Trophy, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"

interface Notification {
  id: string
  type: "new_chapter" | "comment" | "like" | "achievement" | "system"
  title: string
  message: string
  timestamp: number
  read: boolean
  actionUrl?: string
  icon?: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    if (user) {
      const savedNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || "[]")

      // Add some sample notifications if none exist
      if (savedNotifications.length === 0) {
        const sampleNotifications: Notification[] = [
          {
            id: "1",
            type: "new_chapter",
            title: "New Chapter Available",
            message: "Solo Leveling - Chapter 180 has been released!",
            timestamp: Date.now() - 3600000,
            read: false,
            actionUrl: "/title/solo-leveling",
          },
          {
            id: "2",
            type: "achievement",
            title: "Achievement Unlocked!",
            message: "You've earned the 'Bookworm' badge for reading 50 chapters!",
            timestamp: Date.now() - 7200000,
            read: false,
          },
          {
            id: "3",
            type: "comment",
            title: "New Comment",
            message: "Someone replied to your comment on Tower of God - Chapter 120",
            timestamp: Date.now() - 86400000,
            read: true,
            actionUrl: "/read/tower-of-god/120",
          },
          {
            id: "4",
            type: "like",
            title: "Your Comment Got Liked",
            message: "Your comment on Attack on Titan received 5 likes!",
            timestamp: Date.now() - 172800000,
            read: true,
          },
          {
            id: "5",
            type: "system",
            title: "Welcome to MangaReader!",
            message: "Thanks for joining our community. Start exploring your favorite manga!",
            timestamp: Date.now() - 259200000,
            read: true,
          },
        ]
        setNotifications(sampleNotifications)
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(sampleNotifications))
      } else {
        setNotifications(savedNotifications)
      }
    }
  }, [user])

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    setNotifications(updatedNotifications)
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications))
    }
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((n) => ({ ...n, read: true }))
    setNotifications(updatedNotifications)
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications))
    }
  }

  const deleteNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter((n) => n.id !== notificationId)
    setNotifications(updatedNotifications)
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications))
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "new_chapter":
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case "comment":
        return <MessageCircle className="h-5 w-5 text-green-500" />
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />
      case "achievement":
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case "system":
        return <Gift className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.read) : notifications

  const unreadCount = notifications.filter((n) => !n.read).length

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view notifications.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "All caught up!"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Unread ({unreadCount})
              </Button>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground text-center">
                    {filter === "unread"
                      ? "You're all caught up! No unread notifications."
                      : "You don't have any notifications yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification, index) => (
                <Card key={notification.id} className={`${!notification.read ? "border-primary/50 bg-primary/5" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
