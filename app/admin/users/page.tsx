"use client"

import { useEffect, useState } from "react"
import { Users, Shield, User, Trash2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserData {
  id: string
  username: string
  email: string
  role: "user" | "admin"
  favorites: string[]
  readingHistory: any[]
  createdAt?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    const usersData = JSON.parse(localStorage.getItem("manga-reader-users") || "[]")
    const processedUsers = usersData.map((user: any) => ({
      ...user,
      createdAt: user.createdAt || new Date().toISOString(),
    }))
    setUsers(processedUsers)
    setFilteredUsers(processedUsers)
  }, [])

  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      return matchesSearch && matchesRole
    })

    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter])

  const toggleUserRole = (userId: string) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return { ...user, role: user.role === "admin" ? ("user" as const) : ("admin" as const) }
      }
      return user
    })

    localStorage.setItem("manga-reader-users", JSON.stringify(updatedUsers))
    setUsers(updatedUsers)
  }

  const deleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`,
    )
    if (confirmed) {
      const updatedUsers = users.filter((u) => u.id !== userId)
      localStorage.setItem("manga-reader-users", JSON.stringify(updatedUsers))
      setUsers(updatedUsers)
    }
  }

  const exportUsers = () => {
    const exportData = users.map(({ id, username, email, role, createdAt }) => ({
      id,
      username,
      email,
      role,
      createdAt,
      favoritesCount: users.find((u) => u.id === id)?.favorites.length || 0,
      readingHistoryCount: users.find((u) => u.id === id)?.readingHistory.length || 0,
    }))

    const csv = [
      "ID,Username,Email,Role,Created At,Favorites Count,Reading History Count",
      ...exportData.map(
        (user) =>
          `${user.id},${user.username},${user.email},${user.role},${user.createdAt},${user.favoritesCount},${user.readingHistoryCount}`,
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={exportUsers}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.role === "user").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="text-sm text-muted-foreground pt-2">
                {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{user.username}</h3>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>{user.favorites.length} favorites</span>
                      <span>{user.readingHistory.length} chapters read</span>
                      <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleUserRole(user.id)}>
                    {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteUser(user.id)}>
                    <Trash2 className="h-4 w-4" />
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
