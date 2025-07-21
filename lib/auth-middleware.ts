import { NextRequest } from "next/server"
import { DatabaseRoles } from "@/lib/DatabaseRoles"

export interface AuthContext {
  userId: string
  userEmail: string
  roleId?: string
  roleName?: string
  permissions: string[]
}

export class AuthMiddleware {
  /**
   * Extract user information from request headers or session
   * In a real application, this would validate JWT tokens or session cookies
   */
  static async getUserFromRequest(request: NextRequest): Promise<AuthContext | null> {
    try {
      // For now, we'll get user info from headers
      // In production, you'd validate JWT tokens or session cookies here
      const userId = request.headers.get("x-user-id")
      const userEmail = request.headers.get("x-user-email")

      if (!userId || !userEmail) {
        console.log("[AuthMiddleware] No user credentials found in request")
        return null
      }

      // Get user record to fetch role information
      const userRecord = await DatabaseRoles.getUserById(userId)
      if (!userRecord) {
        console.log("[AuthMiddleware] User record not found:", userId)
        return null
      }

      const recordData = userRecord.recordData as any
      const roleId = recordData?.roleId
      const roleName = recordData?.roleName

      // Get user permissions
      const permissions = await DatabaseRoles.getUserPermissions(userId)
      const permissionNames = permissions.map(p => p.name)

      console.log(`[AuthMiddleware] User ${userEmail} has ${permissionNames.length} permissions`)

      return {
        userId,
        userEmail,
        roleId,
        roleName,
        permissions: permissionNames
      }
    } catch (error: any) {
      console.error("[AuthMiddleware] Error getting user from request:", error)
      return null
    }
  }

  /**
   * Check if user has permission to access a module
   */
  static hasModulePermission(
    userPermissions: string[],
    moduleId: string,
    action: "view" | "manage" = "view"
  ): boolean {
    // Check for system admin permission
    if (userPermissions.includes("system:admin")) {
      return true
    }

    // Check for specific module permission
    const modulePermission = `${moduleId}:${action}`
    if (userPermissions.includes(modulePermission)) {
      return true
    }

    // For view action, also check if user has manage permission
    if (action === "view" && userPermissions.includes(`${moduleId}:manage`)) {
      return true
    }

    return false
  }

  /**
   * Check if user has permission to access a form (submodule)
   */
  static hasFormPermission(
    userPermissions: string[],
    moduleId: string,
    formId: string,
    action: "view" | "add" | "edit" | "delete" = "view"
  ): boolean {
    // Check for system admin permission
    if (userPermissions.includes("system:admin")) {
      return true
    }

    // Check for module manage permission (grants all form permissions)
    if (userPermissions.includes(`${moduleId}:manage`)) {
      return true
    }

    // Check for specific form permission
    const formPermission = `${moduleId}:${formId}:${action}`
    if (userPermissions.includes(formPermission)) {
      return true
    }

    // For view action, also check if user has any other permission on this form
    if (action === "view") {
      const hasAnyFormPermission = ["add", "edit", "delete"].some(act =>
        userPermissions.includes(`${moduleId}:${formId}:${act}`)
      )
      if (hasAnyFormPermission) {
        return true
      }
    }

    return false
  }

  /**
   * Filter modules based on user permissions
   */
  static filterModulesByPermissions(modules: any[], userPermissions: string[]): any[] {
    // System admin sees everything
    if (userPermissions.includes("system:admin")) {
      return modules
    }

    return modules.filter(module => {
      // Check if user has any permission on this module
      const hasModuleAccess = this.hasModulePermission(userPermissions, module.id, "view")
      
      if (!hasModuleAccess) {
        // Check if user has permission on any forms in this module
        const hasFormAccess = module.forms?.some((form: any) =>
          this.hasFormPermission(userPermissions, module.id, form.id, "view")
        )
        
        if (!hasFormAccess) {
          return false
        }
      }

      // Filter forms within the module
      if (module.forms) {
        module.forms = module.forms.filter((form: any) =>
          this.hasFormPermission(userPermissions, module.id, form.id, "view")
        )
      }

      // Filter child modules recursively
      if (module.children) {
        module.children = this.filterModulesByPermissions(module.children, userPermissions)
      }

      return true
    })
  }

  /**
   * Check if user can perform a specific action on a resource
   */
  static async checkPermission(
    request: NextRequest,
    resourceType: "module" | "form",
    resourceId: string,
    action: string,
    moduleId?: string
  ): Promise<{ authorized: boolean; user?: AuthContext; error?: string }> {
    try {
      const user = await this.getUserFromRequest(request)
      
      if (!user) {
        return {
          authorized: false,
          error: "Authentication required"
        }
      }

      let hasPermission = false

      if (resourceType === "module") {
        hasPermission = this.hasModulePermission(user.permissions, resourceId, action as any)
      } else if (resourceType === "form" && moduleId) {
        hasPermission = this.hasFormPermission(user.permissions, moduleId, resourceId, action as any)
      }

      return {
        authorized: hasPermission,
        user,
        error: hasPermission ? undefined : "Insufficient permissions"
      }
    } catch (error: any) {
      console.error("[AuthMiddleware] Error checking permission:", error)
      return {
        authorized: false,
        error: "Permission check failed"
      }
    }
  }

  /**
   * Get user's accessible actions for a resource
   */
  static getAccessibleActions(
    userPermissions: string[],
    moduleId: string,
    formId?: string
  ): {
    canView: boolean
    canAdd: boolean
    canEdit: boolean
    canDelete: boolean
    canManage: boolean
  } {
    // System admin can do everything
    if (userPermissions.includes("system:admin")) {
      return {
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      }
    }

    const canManage = userPermissions.includes(`${moduleId}:manage`)

    if (formId) {
      // Form-level permissions
      return {
        canView: canManage || this.hasFormPermission(userPermissions, moduleId, formId, "view"),
        canAdd: canManage || this.hasFormPermission(userPermissions, moduleId, formId, "add"),
        canEdit: canManage || this.hasFormPermission(userPermissions, moduleId, formId, "edit"),
        canDelete: canManage || this.hasFormPermission(userPermissions, moduleId, formId, "delete"),
        canManage
      }
    } else {
      // Module-level permissions
      return {
        canView: canManage || this.hasModulePermission(userPermissions, moduleId, "view"),
        canAdd: canManage,
        canEdit: canManage,
        canDelete: canManage,
        canManage
      }
    }
  }
}