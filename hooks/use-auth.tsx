"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  username: string
  email: string
  role: "user" | "admin"
  favorites: string[]
  readingHistory: Array<{
    titleId: string
    chapterId: string
    lastPage: number
    timestamp: number
  }>
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem("manga-reader-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    const users = JSON.parse(localStorage.getItem("manga-reader-users") || "[]")
    if (users.length === 0) {
      const defaultAdmin = {
        id: "admin-1",
        username: "admin",
        email: "admin@example.com",
        password: "admin123", // In real app, this would be hashed
        role: "admin" as const,
        favorites: [],
        readingHistory: [],
      }
      localStorage.setItem("manga-reader-users", JSON.stringify([defaultAdmin]))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call - in real app, this would be a server request
    const users = JSON.parse(localStorage.getItem("manga-reader-users") || "[]")
    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("manga-reader-user", JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem("manga-reader-users") || "[]")

    // Check if user already exists
    if (users.find((u: any) => u.email === email || u.username === username)) {
      return false
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password, // In real app, this would be hashed
      role: "user" as const,
      favorites: [],
      readingHistory: [],
    }

    users.push(newUser)
    localStorage.setItem("manga-reader-users", JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("manga-reader-user", JSON.stringify(userWithoutPassword))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("manga-reader-user")
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("manga-reader-user", JSON.stringify(updatedUser))

    // Also update in users array
    const users = JSON.parse(localStorage.getItem("manga-reader-users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      localStorage.setItem("manga-reader-users", JSON.stringify(users))
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
