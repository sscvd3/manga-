"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/hooks/use-theme"
import { Upload, X, Palette, Moon, Sun } from "lucide-react"

export function ThemeSettings() {
  const { theme, setTheme, backgroundImage, setBackgroundImage, customColors, setCustomColors } = useTheme()
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleColorChange = (colorType: keyof typeof customColors, value: string) => {
    setCustomColors({
      ...customColors,
      [colorType]: value,
    })
  }

  return (
    <div className="space-y-6">
      {/* Dark Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            الوضع الليلي
          </CardTitle>
          <CardDescription>تبديل بين الوضع الفاتح والوضع المظلم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
            <Label>{theme === "dark" ? "الوضع المظلم" : "الوضع الفاتح"}</Label>
          </div>
        </CardContent>
      </Card>

      {/* Background Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            خلفية الموقع
          </CardTitle>
          <CardDescription>رفع صورة خلفية مخصصة للموقع</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="flex-1"
            />
            {backgroundImage && (
              <Button variant="outline" size="sm" onClick={() => setBackgroundImage(null)}>
                <X className="h-4 w-4" />
                إزالة
              </Button>
            )}
          </div>
          {backgroundImage && (
            <div className="relative w-full h-32 rounded-lg overflow-hidden border">
              <img
                src={backgroundImage || "/placeholder.svg"}
                alt="Background preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            ألوان الواجهة
          </CardTitle>
          <CardDescription>تخصيص ألوان الموقع حسب تفضيلاتك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>اللون الأساسي</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={customColors.primary}
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  className="w-12 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={customColors.primary}
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>اللون الثانوي</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={customColors.secondary}
                  onChange={(e) => handleColorChange("secondary", e.target.value)}
                  className="w-12 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={customColors.secondary}
                  onChange={(e) => handleColorChange("secondary", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>لون التمييز</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={customColors.accent}
                  onChange={(e) => handleColorChange("accent", e.target.value)}
                  className="w-12 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={customColors.accent}
                  onChange={(e) => handleColorChange("accent", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
