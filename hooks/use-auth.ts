"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { ApiClient } from "@/lib/api-client"
import type { PermissionMatrix } from "@/types/auth"

interface AuthUser {
  id: string
  email: string
  roleId?: string
  roleName?: string
}

interface AuthContextType {
  user: AuthUser | null
  permissions: string[]
  permissionMatrix: PermissionMatrix
  systemPermissions: {
    isAdmin: boolean
    canManageUsers: boolean
    canManageRoles: boolean
    canManagePermissions: boolean
  }
  isLoading: boolean
  login: (userId: string, userEmail: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasModulePermission: (moduleId: string, action: string) => boolean
  hasFormPermission: (moduleId: string, formId: string, action: string) => boolean
  refreshPermissions: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthProvider() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({})
  const [systemPermissions, setSystemPermissions] = useState({
    isAdmin: false,
    canManageUsers: false,
    canManageRoles: false,
    canManagePermissions: false
  })
  const [isLoading, setIsLoading] = useState(true)

  const login = async (userId: string, userEmail: string) => {
    try {
      setIsLoading(true)
      
      // Store user credentials in localStorage for persistence
      localStorage.setItem("auth_user_id", userId)
      localStorage.setItem("auth_user_email", userEmail)
      console.log("[AuthProvider] Logging in user:", userEmail);
      
      // Fetch user permissions
      const response = await ApiClient.get("/api/users/permissions", userId, userEmail)
      
      if (response.success && response.data) {
        setUser(response.data.user)
        setPermissions(response.data.permissions.map((p: any) => p.name))
        setPermissionMatrix(response.data.permissionMatrix)
        setSystemPermissions(response.data.systemPermissions)
      } else {
        throw new Error(response.error || "Failed to fetch user permissions")
      }
    } catch (error: any) {
      console.error("Login failed:", error)
      logout()
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setPermissions([])
    setPermissionMatrix({})
    setSystemPermissions({
      isAdmin: false,
      canManageUsers: false,
      canManageRoles: false,
      canManagePermissions: false
    })
    localStorage.removeItem("auth_user_id")
    localStorage.removeItem("auth_user_email")
    setIsLoading(false)
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
      const userId = localStorage.getItem("auth_user_id")
      const userEmail = localStorage.getItem("auth_user_email")
      
      if (userId && userEmail) {
        await login(userId, userEmail)
      }
    }
  }

  // Auto-login on app start if credentials exist
  useEffect(() => {
    const userId = localStorage.getItem("auth_user_id")
    const userEmail = localStorage.getItem("auth_user_email")
    
    if (userId && userEmail) {
      login(userId, userEmail).catch(() => {
        // If auto-login fails, just set loading to false
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [])

  return {
    user,
    permissions,
    permissionMatrix,
    systemPermissions,
    isLoading,
    login,
    logout,
    hasPermission,
    hasModulePermission,
    hasFormPermission,
    refreshPermissions
  }
}

export { AuthContext }