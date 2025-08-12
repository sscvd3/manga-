"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Save, Globe, Upload, Shield, Database, BarChart3, ImageIcon, Paintbrush } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Type } from "lucide-react" // Declare the Type variable

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteLogo: string
  siteIcon: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  customCSS: string
  adminEmail: string
  allowRegistration: boolean
  defaultLanguage: string
  enableDarkMode: boolean
  maxFileSize: number
  allowedFileTypes: string[]
  enableComments: boolean
  enableRatings: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
  socialLinks: {
    twitter: string
    facebook: string
    discord: string
    reddit: string
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "MangaReader",
    siteDescription: "Read your favorite manga and manhwa online for free",
    siteLogo: "",
    siteIcon: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#64748b",
    accentColor: "#f59e0b",
    customCSS: "",
    adminEmail: "admin@example.com",
    allowRegistration: true,
    defaultLanguage: "en",
    enableDarkMode: true,
    maxFileSize: 5,
    allowedFileTypes: ["jpg", "jpeg", "png", "webp"],
    enableComments: false,
    enableRatings: false,
    maintenanceMode: false,
    maintenanceMessage: "Site is under maintenance. Please check back later.",
    socialLinks: {
      twitter: "",
      facebook: "",
      discord: "",
      reddit: "",
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalStorage: 0,
    totalFiles: 0,
    lastBackup: null as Date | null,
    totalUsers: 0,
    totalTitles: 0,
    totalChapters: 0,
    totalViews: 0,
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
  })

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("manga-reader-settings")
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) })
    }

    // Calculate comprehensive stats
    const users = JSON.parse(localStorage.getItem("manga-reader-users") || "[]")
    const titles = JSON.parse(localStorage.getItem("manga-reader-titles") || "[]")

    let totalChapters = 0
    let totalViews = 0
    titles.forEach((title: any) => {
      totalChapters += title.chapterCount || 0
      totalViews += title.views || 0
    })

    setStats({
      totalStorage: Math.floor(Math.random() * 1000) + 500,
      totalFiles: Math.floor(Math.random() * 5000) + 1000,
      lastBackup: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      totalUsers: users.length,
      totalTitles: titles.length,
      totalChapters,
      totalViews,
      dailyActiveUsers: Math.floor(users.length * 0.3),
      weeklyActiveUsers: Math.floor(users.length * 0.6),
      monthlyActiveUsers: Math.floor(users.length * 0.8),
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      localStorage.setItem("manga-reader-settings", JSON.stringify(settings))

      // Apply custom CSS
      const existingStyle = document.getElementById("custom-site-styles")
      if (existingStyle) {
        existingStyle.remove()
      }

      if (settings.customCSS) {
        const style = document.createElement("style")
        style.id = "custom-site-styles"
        style.textContent = settings.customCSS
        document.head.appendChild(style)
      }

      // Apply color scheme
      document.documentElement.style.setProperty("--primary", settings.primaryColor)
      document.documentElement.style.setProperty("--secondary", settings.secondaryColor)
      document.documentElement.style.setProperty("--accent", settings.accentColor)

      alert("Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSettings({ ...settings, siteLogo: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSettings({ ...settings, siteIcon: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackup = () => {
    const data = {
      titles: localStorage.getItem("manga-reader-titles"),
      users: localStorage.getItem("manga-reader-users"),
      settings: localStorage.getItem("manga-reader-settings"),
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `manga-reader-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    setStats({ ...stats, lastBackup: new Date() })
  }

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        if (data.titles) localStorage.setItem("manga-reader-titles", data.titles)
        if (data.users) localStorage.setItem("manga-reader-users", data.users)
        if (data.settings) localStorage.setItem("manga-reader-settings", data.settings)

        alert("Data restored successfully! Please refresh the page.")
      } catch (error) {
        alert("Invalid backup file format.")
      }
    }
    reader.readAsText(file)
  }

  const clearAllData = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all data? This will delete all titles, chapters, users, and settings. This action cannot be undone.",
    )

    if (confirmed) {
      const doubleConfirmed = window.confirm(
        "This is your final warning. All data will be permanently deleted. Are you absolutely sure?",
      )

      if (doubleConfirmed) {
        localStorage.clear()
        alert("All data has been cleared. The page will now reload.")
        window.location.reload()
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Site Settings & Statistics</h1>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <form onSubmit={handleSave} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Select
                    value={settings.defaultLanguage}
                    onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Media Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter URL</Label>
                    <Input
                      id="twitter"
                      placeholder="https://twitter.com/yoursite"
                      value={settings.socialLinks.twitter}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook URL</Label>
                    <Input
                      id="facebook"
                      placeholder="https://facebook.com/yoursite"
                      value={settings.socialLinks.facebook}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discord">Discord URL</Label>
                    <Input
                      id="discord"
                      placeholder="https://discord.gg/yourserver"
                      value={settings.socialLinks.discord}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: { ...settings.socialLinks, discord: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reddit">Reddit URL</Label>
                    <Input
                      id="reddit"
                      placeholder="https://reddit.com/r/yoursubreddit"
                      value={settings.socialLinks.reddit}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: { ...settings.socialLinks, reddit: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="branding">
          <form onSubmit={handleSave} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Logo & Icon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Site Logo</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      {settings.siteLogo ? (
                        <img
                          src={settings.siteLogo || "/placeholder.svg"}
                          alt="Site Logo"
                          className="max-h-20 mx-auto mb-4"
                        />
                      ) : (
                        <div className="h-20 flex items-center justify-center text-muted-foreground">
                          No logo uploaded
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("logo-upload")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label>Site Icon (Favicon)</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      {settings.siteIcon ? (
                        <img
                          src={settings.siteIcon || "/placeholder.svg"}
                          alt="Site Icon"
                          className="w-8 h-8 mx-auto mb-4"
                        />
                      ) : (
                        <div className="h-8 flex items-center justify-center text-muted-foreground">
                          No icon uploaded
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleIconUpload}
                        className="hidden"
                        id="icon-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("icon-upload")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Icon
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paintbrush className="h-5 w-5" />
                  Color Scheme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        placeholder="#64748b"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Custom CSS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="customCSS">Custom CSS Code</Label>
                  <Textarea
                    id="customCSS"
                    value={settings.customCSS}
                    onChange={(e) => setSettings({ ...settings, customCSS: e.target.value })}
                    rows={10}
                    placeholder="/* Add your custom CSS here */
.header { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); }
.title-card:hover { transform: scale(1.05); }"
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Add custom CSS to personalize your site's appearance. Changes will be applied immediately after
                    saving.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Branding"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="features">
          <form onSubmit={handleSave} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  User Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow User Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to create accounts</p>
                  </div>
                  <Switch
                    checked={settings.allowRegistration}
                    onCheckedChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Comments</Label>
                    <p className="text-sm text-muted-foreground">Allow users to comment on chapters</p>
                  </div>
                  <Switch
                    checked={settings.enableComments}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableComments: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Ratings</Label>
                    <p className="text-sm text-muted-foreground">Allow users to rate titles</p>
                  </div>
                  <Switch
                    checked={settings.enableRatings}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableRatings: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Features"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="statistics">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Site Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{stats.totalTitles.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Titles</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">{stats.totalChapters.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Chapters</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">{stats.totalViews.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.dailyActiveUsers}</div>
                    <div className="text-sm text-muted-foreground">Daily Active Users</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.weeklyActiveUsers}</div>
                    <div className="text-sm text-muted-foreground">Weekly Active Users</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.monthlyActiveUsers}</div>
                    <div className="text-sm text-muted-foreground">Monthly Active Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage & Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{stats.totalStorage} MB</div>
                    <div className="text-sm text-muted-foreground">Storage Used</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{stats.totalFiles.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Files</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {stats.lastBackup ? stats.lastBackup.toLocaleDateString() : "Never"}
                    </div>
                    <div className="text-sm text-muted-foreground">Last Backup</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Backup & Restore</h3>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={handleBackup}>
                    <Database className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                  <div>
                    <Input type="file" accept=".json" onChange={handleRestore} className="hidden" id="restore-file" />
                    <Button variant="outline" onClick={() => document.getElementById("restore-file")?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Restore from Backup
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                <div className="p-4 border border-destructive rounded-lg">
                  <h4 className="font-semibold mb-2">Clear All Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    This will permanently delete all titles, chapters, users, and settings. This action cannot be
                    undone.
                  </p>
                  <Button variant="destructive" onClick={clearAllData}>
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
