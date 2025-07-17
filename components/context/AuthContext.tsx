"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
    id: string
    email: string
    name: string
    role: "admin" | "user"
}

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    loading: boolean
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"]

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/login", "/register"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    const isAuthenticated = !!user

    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))

    // Initialize auth state
    useEffect(() => {
        initializeAuth()
    }, [])

    // Handle route protection
    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated && !isPublicRoute) {
                // Redirect to login if not authenticated and trying to access protected route
                const redirectUrl = encodeURIComponent(pathname)
                router.push(`/login?redirect=${redirectUrl}`)
            } else if (isAuthenticated && isAuthRoute) {
                // Redirect to dashboard if authenticated and trying to access auth routes
                router.push("/dashboard")
            }
        }
    }, [isAuthenticated, loading, pathname, isPublicRoute, isAuthRoute, router])

    const initializeAuth = async () => {
        try {
            const token = localStorage.getItem("authToken")
            if (!token) {
                setLoading(false)
                return
            }

            // Validate token with server
            const response = await fetch("/api/auth/validate", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const userData = await response.json()
                setUser(userData.user)
            } else {
                // Token is invalid, remove it
                localStorage.removeItem("authToken")
            }
        } catch (error) {
            console.error("Auth initialization error:", error)
            localStorage.removeItem("authToken")
        } finally {
            setLoading(false)
        }
    }

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            })

            const result = await response.json()

            if (!response.ok) {
                return { success: false, error: result.error || "Login failed" }
            }

            if (result.success && result.token) {
                // Store token
                localStorage.setItem("authToken", result.token)

                // Set user data
                setUser(result.user)

                return { success: true }
            } else {
                return { success: false, error: result.error || "Login failed" }
            }
        } catch (error) {
            console.error("Login error:", error)
            return { success: false, error: "Network error. Please try again." }
        }
    }

    const logout = () => {
        localStorage.removeItem("authToken")
        setUser(null)
        router.push("/login")
    }

    const value: AuthContextType = {
        user,
        login,
        logout,
        loading,
        isAuthenticated,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}