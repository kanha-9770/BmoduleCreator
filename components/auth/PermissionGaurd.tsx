"use client"

import { ReactNode } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"
import { useAuth } from "../context/AuthContext"

interface PermissionGuardProps {
  children: ReactNode
  permission?: string
  moduleId?: string
  formId?: string
  action?: "view" | "add" | "edit" | "delete" | "manage"
  fallback?: ReactNode
  showError?: boolean
}

export function PermissionGuard({
  children,
  permission,
  moduleId,
  formId,
  action = "view",
  fallback,
  showError = true
}: PermissionGuardProps) {
  const { hasPermission, hasModulePermission, hasFormPermission, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>
  }

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (moduleId && formId) {
    hasAccess = hasFormPermission(moduleId, formId, action)
  } else if (moduleId) {
    hasAccess = hasModulePermission(moduleId, action)
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showError) {
      return (
        <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this resource.
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return <>{children}</>
}