"use client"

import { Header } from "@/components/header"
import { ThemeSettings } from "@/components/theme-settings"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-lg text-muted-foreground">يجب تسجيل الدخول لعرض الإعدادات</p>
              <Link href="/login">
                <Button className="mt-4">تسجيل الدخول</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">إعدادات المظهر</h1>
          <p className="text-muted-foreground">تخصيص مظهر الموقع وألوانه حسب تفضيلاتك</p>
        </div>

        <div className="max-w-4xl">
          <ThemeSettings />
        </div>
      </div>
    </div>
  )
}
