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
                
                // Store user credentials for API calls
                localStorage.setItem('auth_user_id', userData.user.id)
                localStorage.setItem('auth_user_email', userData.user.email)
                
                // Load permissions after setting user
                await loadUserPermissions(userData.user.id, userData.user.email)
            } else {
                // Token is invalid, remove it
                localStorage.removeItem("authToken")
                localStorage.removeItem('auth_user_id')
                localStorage.removeItem('auth_user_email')
                clearAuthState()
            }
        } catch (error) {
            console.error("Auth initialization error:", error)
            localStorage.removeItem("authToken")
            localStorage.removeItem('auth_user_id')
            localStorage.removeItem('auth_user_email')
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
                setPermissions(response.data.permissions || [])
                setPermissionMatrix(response.data.permissionMatrix || {})
                setSystemPermissions(response.data.systemPermissions || {
                    isAdmin: false,
                    canManageUsers: false,
                    canManageRoles: false,
                    canManagePermissions: false
                })
                
                console.log("[AuthProvider] Permissions loaded successfully:", response.data.permissions?.length || 0)
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
            console.error("[AuthProvider] Failed to load permissions:", error?.message)
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
                // Store token and user credentials
                localStorage.setItem("authToken", result.token)
                localStorage.setItem('auth_user_id', result.user.id)
                localStorage.setItem('auth_user_email', result.user.email)

                // Set user data
                setUser(result.user)

                // Load user permissions if they were returned with login
                if (result.user.permissions) {
                    // Process permissions from login response
                    const userPermissions = result.user.permissions
                    
                    // Transform permissions into the format expected by frontend
                    const permissionMatrix: any = {}
                    const permissionsList: string[] = []
                    
                    for (const perm of userPermissions) {
                        if (perm.resourceType === 'module') {
                            const moduleId = perm.resourceId
                            if (!permissionMatrix[moduleId]) {
                                permissionMatrix[moduleId] = {
                                    permissions: {
                                        canView: false,
                                        canAdd: false,
                                        canEdit: false,
                                        canDelete: false,
                                        canManage: false
                                    },
                                    subModules: {}
                                }
                            }
                            
                            permissionMatrix[moduleId].permissions = {
                                canView: perm.permissions.canView,
                                canAdd: perm.permissions.canCreate,
                                canEdit: perm.permissions.canEdit,
                                canDelete: perm.permissions.canDelete,
                                canManage: perm.permissions.canManage
                            }
                            
                            // Add to permissions list
                            if (perm.permissions.canView) permissionsList.push(`${moduleId}:view`)
                            if (perm.permissions.canCreate) permissionsList.push(`${moduleId}:create`)
                            if (perm.permissions.canEdit) permissionsList.push(`${moduleId}:edit`)
                            if (perm.permissions.canDelete) permissionsList.push(`${moduleId}:delete`)
                            if (perm.permissions.canManage) permissionsList.push(`${moduleId}:manage`)
                            
                        } else if (perm.resourceType === 'form' && perm.resource) {
                            const form = perm.resource as any
                            const moduleId = form.moduleId
                            const formId = perm.resourceId
                            
                            if (!permissionMatrix[moduleId]) {
                                permissionMatrix[moduleId] = {
                                    permissions: {
                                        canView: false,
                                        canAdd: false,
                                        canEdit: false,
                                        canDelete: false,
                                        canManage: false
                                    },
                                    subModules: {}
                                }
                            }
                            
                            permissionMatrix[moduleId].subModules[formId] = {
                                permissions: {
                                    canView: perm.permissions.canView,
                                    canAdd: perm.permissions.canCreate,
                                    canEdit: perm.permissions.canEdit,
                                    canDelete: perm.permissions.canDelete,
                                    canManage: perm.permissions.canManage
                                }
                            }
                            
                            // Add to permissions list
                            if (perm.permissions.canView) permissionsList.push(`${moduleId}:${formId}:view`)
                            if (perm.permissions.canCreate) permissionsList.push(`${moduleId}:${formId}:create`)
                            if (perm.permissions.canEdit) permissionsList.push(`${moduleId}:${formId}:edit`)
                            if (perm.permissions.canDelete) permissionsList.push(`${moduleId}:${formId}:delete`)
                            if (perm.permissions.canManage) permissionsList.push(`${moduleId}:${formId}:manage`)
                        }
                    }

                    // Check for system admin
                    const hasSystemAdmin = userPermissions.some((p: any) => p.isSystemAdmin)
                    
                    setPermissions(permissionsList)
                    setPermissionMatrix(permissionMatrix)
                    setSystemPermissions({
                        isAdmin: hasSystemAdmin,
                        canManageUsers: hasSystemAdmin,
                        canManageRoles: hasSystemAdmin,
                        canManagePermissions: hasSystemAdmin
                    })
                    
                    console.log("[AuthProvider] Permissions loaded from login response:", permissionsList.length)
                } else {
                    // Load permissions separately if not included in login response
                    await loadUserPermissions(result.user.id, result.user.email)
                }

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
        localStorage.removeItem('auth_user_id')
        localStorage.removeItem('auth_user_email')
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