"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    setFormData({
      username: user.username,
      email: user.email,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }, [user, router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters"
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required to change password"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !validateForm()) return

    setIsLoading(true)

    try {
      // In a real app, you'd validate the current password on the server
      // For demo purposes, we'll just update the user data
      const updates: any = {
        username: formData.username,
        email: formData.email,
      }

      // If changing password, update it in the users array
      if (formData.newPassword) {
        const users = JSON.parse(localStorage.getItem("manga-reader-users") || "[]")
        const userIndex = users.findIndex((u: any) => u.id === user.id)
        if (userIndex !== -1) {
          users[userIndex].password = formData.newPassword
          localStorage.setItem("manga-reader-users", JSON.stringify(users))
        }
      }

      updateUser(updates)

      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      alert("Settings updated successfully!")
    } catch (error) {
      console.error("Error updating settings:", error)
      alert("Failed to update settings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    if (!user) return

    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.")

    if (confirmed) {
      const doubleConfirmed = window.confirm(
        "This will permanently delete all your data including favorites and reading history. Are you absolutely sure?",
      )

      if (doubleConfirmed) {
        // Remove user from users array
        const users = JSON.parse(localStorage.getItem("manga-reader-users") || "[]")
        const filteredUsers = users.filter((u: any) => u.id !== user.id)
        localStorage.setItem("manga-reader-users", JSON.stringify(filteredUsers))

        logout()
        router.push("/")
      }
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Enter current password to change"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Enter new password (optional)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>

        <Separator className="my-8" />

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Delete Account</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
