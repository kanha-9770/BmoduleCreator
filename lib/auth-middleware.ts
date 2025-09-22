import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { DatabaseRoles } from "@/lib/DatabaseRoles"

export interface AuthContext {
  userId: string
  userEmail: string
  roleId?: string
  roleName?: string
  permissions: Array<{
    resourceType: 'module' | 'form'
    resourceId: string
    permissions: {
      canView: boolean
      canCreate: boolean
      canEdit: boolean
      canDelete: boolean
    }
    isSystemAdmin: boolean
    resource?: {
      id: string
      name: string
      description?: string
      moduleId?: string // For forms
    }
  }>
}

export class AuthMiddleware {
  /**
   * Extract user information from JWT token
   */
  static async getUserFromRequest(request: NextRequest): Promise<AuthContext | null> {
    try {
      // Try JWT token first (preferred method)
      const authHeader = request.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7)
        
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
          const userId = decoded.userId
          const userEmail = decoded.email
          
          if (userId && userEmail) {
            console.log(`[AuthMiddleware] JWT auth successful for user: ${userEmail}`)
            
            // Get user permissions
            const userPermissions = await DatabaseRoles.getUserPermissionsWithResources(userId)
            
            return {
              userId,
              userEmail,
              roleId: decoded.roleId,
              roleName: decoded.role,
              permissions: userPermissions
            }
          }
        } catch (jwtError) {
          console.log("[AuthMiddleware] JWT verification failed, trying header auth")
        }
      }

      // Fallback to header-based auth (for development)
      const userId = request.headers.get("x-user-id")
      const userEmail = request.headers.get("x-user-email")

      if (!userId || !userEmail) {
        console.log("[AuthMiddleware] No authentication credentials found")
        return null
      }

      console.log(`[AuthMiddleware] Header auth for user: ${userEmail}`)

      // Get user record to fetch role info
      const userRecord = await DatabaseRoles.getUserById(userId)
      if (!userRecord) {
        console.log("[AuthMiddleware] User record not found:", userId)
        return null
      }

      const recordData = userRecord.recordData as any
      const roleId = recordData?.roleId
      const roleName = recordData?.roleName

      // Get user permissions with resource details from UserPermission table
      const userPermissions = await DatabaseRoles.getUserPermissionsWithResources(userId)

      console.log(`[AuthMiddleware] User ${userEmail} has ${userPermissions.length} permissions`)

      return {
        userId,
        userEmail,
        roleId,
        roleName,
        permissions: userPermissions
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
    userPermissions: AuthContext['permissions'],
    moduleId: string,
    action: "view"  = "view"
  ): boolean {
    // Check for system admin permission
    const hasSystemAdmin = userPermissions.some(perm => perm.isSystemAdmin)
    if (hasSystemAdmin) {
      return true
    }

    // Check for module-level permission
    const modulePermission = userPermissions.find(perm => 
      perm.resourceType === 'module' && perm.resourceId === moduleId
    )

    if (modulePermission) {
      switch (action) {
        case "view":
          return modulePermission.permissions.canView
        default:
          return false
      }
    }

    // Check if user has any form permissions within this module
    const hasAnyFormPermission = userPermissions.some(perm => {
      if (perm.resourceType === 'form' && perm.resource) {
        const form = perm.resource as any
        return form.moduleId === moduleId && (
          perm.permissions.canView || 
          perm.permissions.canCreate || 
          perm.permissions.canEdit || 
          perm.permissions.canDelete 
        )
      }
      return false
    })

    console.log(`[AuthMiddleware] Module ${moduleId} permission check: ${hasAnyFormPermission}`)
    return hasAnyFormPermission
  }

  /**
   * Check if user has permission to access a form (submodule)
   */
  static hasFormPermission(
    userPermissions: AuthContext['permissions'],
    moduleId: string,
    formId: string,
    action: "view" | "create" | "edit" | "delete" = "view"
  ): boolean {
    // Check for system admin permission
    const hasSystemAdmin = userPermissions.some(perm => perm.isSystemAdmin)
    if (hasSystemAdmin) {
      return true
    }

    // Check for module manage permission (grants all form permissions)
    const modulePermission = userPermissions.find(perm => 
      perm.resourceType === 'module' && perm.resourceId === moduleId
    )

    

    // Check for specific form permission
    const formPermission = userPermissions.find(perm => 
      perm.resourceType === 'form' && perm.resourceId === formId
    )

    if (formPermission) {
      switch (action) {
        case "view":
          return formPermission.permissions.canView 
        case "create":
          return formPermission.permissions.canCreate 
        case "edit":
          return formPermission.permissions.canEdit 
        case "delete":
          return formPermission.permissions.canDelete
        default:
          return false
      }
    }

    console.log(`[AuthMiddleware] Form ${moduleId}:${formId}:${action} permission check: false`)
    return false
  }

  /**
   * Filter modules based on user permissions - COMPLETELY SECURE
   */
  static filterModulesByPermissions(modules: any[], userPermissions: any[], rolePermissions: any[]): any[] {
  // System admin sees everything
  const hasSystemAdmin = userPermissions.some(perm => perm.isSystemAdmin);
  if (hasSystemAdmin) {
    console.log("[AuthMiddleware] System admin - showing all modules");
    return modules;
  }

  console.log(`[AuthMiddleware] Filtering ${modules.length} modules by ${userPermissions.length} user permissions and ${rolePermissions.length} role permissions`);

  const filteredModules = modules.filter(module => {
    // Check if user has any permission on this module
    const hasModuleAccess = userPermissions.some(
      up => up.moduleId === module.id && up.granted && up.isActive && up.canView
    ) || rolePermissions.some(
      rp => rp.moduleId === module.id && rp.granted
    );

    // Check if user has access to any forms in this module
    let hasAnyFormAccess = false;
    if (module.forms) {
      hasAnyFormAccess = module.forms.some((form: any) =>
        userPermissions.some(
          up => up.moduleId === module.id && up.resourceId === form.id && up.granted && up.isActive && up.canView
        ) || rolePermissions.some(
          rp => rp.moduleId === module.id && rp.granted
        )
      );
    }

    // Check if user has permission on any child modules
    let hasChildModuleAccess = false;
    if (module.children) {
      const filteredChildren = this.filterModulesByPermissions(module.children, userPermissions, rolePermissions);
      hasChildModuleAccess = filteredChildren.length > 0;
    }

    // Module is visible if user has access to module, its forms, or child modules
    if (!hasModuleAccess && !hasAnyFormAccess && !hasChildModuleAccess) {
      console.log(`[AuthMiddleware] Filtering out module "${module.name}" (${module.id}) - no access`);
      return false;
    }

    console.log(`[AuthMiddleware] Module "${module.name}" (${module.id}) is accessible`);
    return true;
  }).map(module => {
    const filteredModule = { ...module };

    // Filter child modules recursively
    if (module.children) {
      filteredModule.children = this.filterModulesByPermissions(module.children, userPermissions, rolePermissions);
    }

    // Filter forms within the module
    if (module.forms) {
      const originalFormsCount = module.forms.length;
      filteredModule.forms = module.forms.filter((form: any) =>
        userPermissions.some(
          up => up.moduleId === module.id && up.resourceId === form.id && up.granted && up.isActive && up.canView
        ) || rolePermissions.some(
          rp => rp.moduleId === module.id && rp.granted
        )
      );
      console.log(`[AuthMiddleware] Module "${module.name}": filtered forms from ${originalFormsCount} to ${filteredModule.forms.length}`);
    }

    return filteredModule;
  });

  console.log(`[AuthMiddleware] Final filtered modules: ${filteredModules.length} out of ${modules.length}`);
  return filteredModules;
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
    userPermissions: AuthContext['permissions'],
    moduleId: string,
    formId?: string
  ): {
    canView: boolean
    canAdd: boolean
    canEdit: boolean
    canDelete: boolean
  } {
    // System admin can do everything
    const hasSystemAdmin = userPermissions.some(perm => perm.isSystemAdmin)
    if (hasSystemAdmin) {
      return {
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true
      }
    }

    if (formId) {
      // Form-level permissions
      return {
        canView: this.hasFormPermission(userPermissions, moduleId, formId, "view"),
        canAdd: this.hasFormPermission(userPermissions, moduleId, formId, "create"),
        canEdit: this.hasFormPermission(userPermissions, moduleId, formId, "edit"),
        canDelete: this.hasFormPermission(userPermissions, moduleId, formId, "delete")
      }
    } else {
      // Module-level permissions
      return {
        canView: this.hasModulePermission(userPermissions, moduleId, "view"),
        canAdd: this.hasModulePermission(userPermissions, moduleId, "view"),
        canEdit: this.hasModulePermission(userPermissions, moduleId, "view"),
        canDelete: this.hasModulePermission(userPermissions, moduleId, "view")
      }
    }
  }

  /**
   * Middleware function to protect API routes
   */
  static async requireAuth(request: NextRequest): Promise<{ authorized: boolean; user?: AuthContext; error?: string }> {
    const user = await this.getUserFromRequest(request)
    
    if (!user) {
      return {
        authorized: false,
        error: "Authentication required"
      }
    }

    return {
      authorized: true,
      user
    }
  }

  /**
   * Middleware function to require specific permission
   */
  static async requirePermission(
    request: NextRequest,
    resourceType: "module" | "form",
    resourceId: string,
    action: string,
    moduleId?: string
  ): Promise<{ authorized: boolean; user?: AuthContext; error?: string }> {
    return this.checkPermission(request, resourceType, resourceId, action, moduleId)
  }
}