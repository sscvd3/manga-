"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, User, Menu, X, Moon, Sun, Settings, Bell, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "@/hooks/use-theme"

interface HeaderProps {
  onSearch?: (query: string) => void
  searchQuery?: string
}

export function Header({ onSearch, searchQuery = "" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [newAchievements, setNewAchievements] = useState(0)
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (user) {
      const notifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || "[]")
      const unreadCount = notifications.filter((n: any) => !n.read).length
      setUnreadNotifications(unreadCount)

      const achievements = JSON.parse(localStorage.getItem(`achievements_${user.id}`) || "[]")
      const newCount = achievements.filter((a: any) => a.isNew).length
      setNewAchievements(newCount)
    }
  }, [user])

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MR</span>
            </div>
            <span className="font-bold text-lg md:text-xl">قارئ المانجا</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ابحث بالعنوان..."
                className="pl-10"
                value={localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">الأنواع</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>أكشن</DropdownMenuItem>
                <DropdownMenuItem>رومانسي</DropdownMenuItem>
                <DropdownMenuItem>خيال</DropdownMenuItem>
                <DropdownMenuItem>دراما</DropdownMenuItem>
                <DropdownMenuItem>كوميدي</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center space-x-2"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline">{theme === "dark" ? "فاتح" : "داكن"}</span>
            </Button>

            {user && (
              <>
                <Button variant="ghost" size="sm" asChild className="relative">
                  <Link href="/notifications">
                    <Bell className="h-4 w-4" />
                    {unreadNotifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {unreadNotifications > 9 ? "9+" : unreadNotifications}
                      </Badge>
                    )}
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" asChild className="relative">
                  <Link href="/achievements">
                    <Trophy className="h-4 w-4" />
                    {newAchievements > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-yellow-500">
                        {newAchievements > 9 ? "9+" : newAchievements}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">الملف الشخصي</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites">المفضلة</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/lists">قوائمي</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/notifications" className="flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      الإشعارات
                      {unreadNotifications > 0 && (
                        <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {unreadNotifications}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/achievements" className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2" />
                      الإنجازات
                      {newAchievements > 0 && (
                        <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-yellow-500">
                          {newAchievements}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      إعدادات المظهر
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">لوحة الإدارة</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout}>تسجيل الخروج</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">دخول</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">تسجيل</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="ابحث بالعنوان..."
                  className="pl-10"
                  value={localSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <Button variant="outline" className="w-full justify-start">
                الأنواع
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
              </Button>
              {user && (
                <>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/notifications">
                      <Bell className="h-4 w-4 mr-2" />
                      الإشعارات
                      {unreadNotifications > 0 && (
                        <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {unreadNotifications}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/achievements">
                      <Trophy className="h-4 w-4 mr-2" />
                      الإنجازات
                      {newAchievements > 0 && (
                        <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-yellow-500">
                          {newAchievements}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/profile">الملف الشخصي</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/favorites">المفضلة</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/lists">قوائمي</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
