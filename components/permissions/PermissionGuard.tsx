import React from 'react'
import { AlertCircle, Lock } from 'lucide-react'
import { usePermissions } from '@/lib/permission-context'

interface PermissionGuardProps {
  children: React.ReactNode
  moduleId?: string
  submoduleId?: string
  formId?: string
  requiredPermission?: 'view' | 'create' | 'edit' | 'delete' | 'manage'
  fallback?: React.ReactNode
  showError?: boolean
}

export function PermissionGuard({
  children,
  moduleId,
  submoduleId,
  formId,
  requiredPermission = 'view',
  fallback,
  showError = true
}: PermissionGuardProps) {
  const { isLoading, isSystemAdmin, getAccessibleActions } = usePermissions()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // System admin has access to everything
  if (isSystemAdmin) {
    return <>{children}</>
  }

  // Check permissions based on the context
  if (!moduleId) {
    // No module specified, deny access
    if (fallback) return <>{fallback}</>
    if (!showError) return null
    
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <div className="text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Access Required</p>
          <p className="text-sm">Module access is required to view this content.</p>
        </div>
      </div>
    )
  }

  const actions = getAccessibleActions(moduleId, submoduleId, formId)
  
  let hasPermission = false
  switch (requiredPermission) {
    case 'view':
      hasPermission = actions.canView
      break
    case 'create':
      hasPermission = actions.canAdd
      break
    case 'edit':
      hasPermission = actions.canEdit
      break
    case 'delete':
      hasPermission = actions.canDelete
      break
    case 'manage':
      hasPermission = actions.canManage
      break
  }

  if (hasPermission) {
    return <>{children}</>
  }

  // Access denied
  if (fallback) {
    return <>{fallback}</>
  }

  if (!showError) {
    return null
  }

  return (
    <div className="flex items-center justify-center p-8 text-gray-500">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
        <p className="text-lg font-medium">Access Denied</p>
        <p className="text-sm">
          You don't have permission to {requiredPermission} this {formId ? 'form' : submoduleId ? 'submodule' : 'module'}.
        </p>
      </div>
    </div>
  )
}