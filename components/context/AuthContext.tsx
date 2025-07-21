"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import type { PermissionMatrix } from "@/types/auth"

interface User {
    id: string
    email: string
    name: string
    role: "admin" | "user"
    roleId?: string
    roleName?: string
}

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    loading: boolean
    isAuthenticated: boolean
    // RBAC additions
    permissions: string[]
    permissionMatrix: PermissionMatrix
    systemPermissions: {
        isAdmin: boolean
        canManageUsers: boolean
        canManageRoles: boolean
        canManagePermissions: boolean
    }
    hasPermission: (permission: string) => boolean
    hasModulePermission: (moduleId: string, action: string) => boolean
    hasFormPermission: (moduleId: string, formId: string, action: string) => boolean
    refreshPermissions: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"]

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/login", "/register"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [permissions, setPermissions] = useState<string[]>([])
    const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({})
    const [systemPermissions, setSystemPermissions] = useState({
        isAdmin: false,
        canManageUsers: false,
        canManageRoles: false,
        canManagePermissions: false
    })
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
                
                // Load permissions after setting user
                await loadUserPermissions(userData.user.id, userData.user.email)
            } else {
                // Token is invalid, remove it
                localStorage.removeItem("authToken")
                clearAuthState()
            }
        } catch (error) {
            console.error("Auth initialization error:", error)
            localStorage.removeItem("authToken")
            clearAuthState()
        } finally {
            setLoading(false)
        }
    }

    const loadUserPermissions = async (userId: string, userEmail: string) => {
        try {
            console.log("[AuthProvider] Loading permissions for user:", userEmail)
            
            // Use token-based authentication for permissions endpoint
            const response = await ApiClient.get("/api/users/permissions", userId, userEmail, true)
            
            if (response.success && response.data) {
                setPermissions(response.data.permissions.map((p: any) => p.name))
                setPermissionMatrix(response.data.permissionMatrix)
                setSystemPermissions(response.data.systemPermissions)
                
                console.log("[AuthProvider] Permissions loaded successfully:", response.data.permissions.length)
            } else {
                console.error("[AuthProvider] Failed to load permissions:", response.error)
                // Don't fail auth if permissions can't be loaded, just log the error
                setPermissions([])
                setPermissionMatrix({})
                setSystemPermissions({
                    isAdmin: false,
                    canManageUsers: false,
                    canManageRoles: false,
                    canManagePermissions: false
                })
            }
        } catch (error: any) {
            console.error("[AuthProvider] Error loading permissions:", error)
            // Don't fail auth if permissions can't be loaded
            setPermissions([])
            setPermissionMatrix({})
            setSystemPermissions({
                isAdmin: false,
                canManageUsers: false,
                canManageRoles: false,
                canManagePermissions: false
            })
        }
    }

    const clearAuthState = () => {
        setUser(null)
        setPermissions([])
        setPermissionMatrix({})
        setSystemPermissions({
            isAdmin: false,
            canManageUsers: false,
            canManageRoles: false,
            canManagePermissions: false
        })
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

                // Load user permissions
                await loadUserPermissions(result.user.id, result.user.email)

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
        clearAuthState()
        router.push("/login")
    }

    const hasPermission = (permission: string): boolean => {
        return permissions.includes(permission) || systemPermissions.isAdmin
    }

    const hasModulePermission = (moduleId: string, action: string): boolean => {
        if (systemPermissions.isAdmin) return true
        
        const modulePerms = permissionMatrix[moduleId]?.permissions
        if (!modulePerms) return false
        
        switch (action) {
            case "view":
                return modulePerms.canView
            case "manage":
                return modulePerms.canManage
            case "add":
                return modulePerms.canAdd
            case "edit":
                return modulePerms.canEdit
            case "delete":
                return modulePerms.canDelete
            default:
                return false
        }
    }

    const hasFormPermission = (moduleId: string, formId: string, action: string): boolean => {
        if (systemPermissions.isAdmin) return true
        
        const formPerms = permissionMatrix[moduleId]?.subModules[formId]?.permissions
        if (!formPerms) return false
        
        switch (action) {
            case "view":
                return formPerms.canView
            case "add":
                return formPerms.canAdd
            case "edit":
                return formPerms.canEdit
            case "delete":
                return formPerms.canDelete
            default:
                return false
        }
    }

    const refreshPermissions = async () => {
        if (user) {
            await loadUserPermissions(user.id, user.email)
        }
    }

    const value: AuthContextType = {
        user,
        login,
        logout,
        loading,
        isAuthenticated,
        // RBAC additions
        permissions,
        permissionMatrix,
        systemPermissions,
        hasPermission,
        hasModulePermission,
        hasFormPermission,
        refreshPermissions,
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