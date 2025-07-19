
import type { ResourceType, PermissionAction } from "@/types/rbac"
import { DatabaseRoles } from "./DatabaseRoles"

export class PermissionUtils {
  // Generate permission name for resource actions
  static getPermissionName(
    resourceType: ResourceType,
    action: PermissionAction,
    resourceId?: string
  ): string {
    if (resourceId) {
      return `${resourceType.toLowerCase()}:${action}:${resourceId}`
    }
    return `${resourceType.toLowerCase()}:${action}`
  }

  // Check if user has permission for a specific resource
  static async checkResourcePermission(
    userId: string,
    resourceType: ResourceType,
    action: PermissionAction,
    resourceId?: string
  ): Promise<boolean> {
    const permissionName = this.getPermissionName(resourceType, action, resourceId)
    return await DatabaseRoles.checkUserPermission(userId, permissionName, resourceId)
  }

  // Check multiple permissions at once
  static async checkMultiplePermissions(
    userId: string,
    permissions: Array<{
      resourceType: ResourceType
      action: PermissionAction
      resourceId?: string
    }>
  ): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {}

    for (const perm of permissions) {
      const permissionName = this.getPermissionName(perm.resourceType, perm.action, perm.resourceId)
      const hasPermission = await DatabaseRoles.checkUserPermission(userId, permissionName, perm.resourceId)
      results[permissionName] = hasPermission
    }

    return results
  }

  // Get available actions for a resource based on user permissions
  static async getAvailableActions(
    userId: string,
    resourceType: ResourceType,
    resourceId?: string
  ): Promise<PermissionAction[]> {
    const actions: PermissionAction[] = ['view', 'create', 'edit', 'delete']
    if (resourceType === 'Form') {
      actions.push('publish')
    }

    const availableActions: PermissionAction[] = []

    for (const action of actions) {
      const hasPermission = await this.checkResourcePermission(userId, resourceType, action, resourceId)
      if (hasPermission) {
        availableActions.push(action)
      }
    }

    return availableActions
  }

  // Create permissions for a new resource
  static async createResourcePermissions(
    resourceType: ResourceType,
    resourceId: string,
    resourceName: string
  ): Promise<void> {
    await DatabaseRoles.createResourcePermissions(resourceType, resourceId, resourceName)
  }

  // Delete permissions for a resource
  static async deleteResourcePermissions(
    resourceType: ResourceType,
    resourceId: string
  ): Promise<void> {
    await DatabaseRoles.deleteResourcePermissions(resourceType, resourceId)
  }

  // Check if user can access a form module
  static async canAccessModule(userId: string, moduleId: string): Promise<boolean> {
    // Check general module view permission
    const hasGeneralPermission = await DatabaseRoles.checkUserPermission(userId, "module:view")
    if (hasGeneralPermission) return true

    // Check specific module permission
    return await this.checkResourcePermission(userId, "FormModule", "view", moduleId)
  }

  // Check if user can access a form
  static async canAccessForm(userId: string, formId: string): Promise<boolean> {
    // Check general form view permission
    const hasGeneralPermission = await DatabaseRoles.checkUserPermission(userId, "form:view")
    if (hasGeneralPermission) return true

    // Check specific form permission
    return await this.checkResourcePermission(userId, "Form", "view", formId)
  }

  // Check if user can manage users
  static async canManageUsers(userId: string): Promise<boolean> {
    return await DatabaseRoles.checkUserPermission(userId, "user:edit") ||
           await DatabaseRoles.checkUserPermission(userId, "system:admin")
  }

  // Check if user has admin privileges
  static async isAdmin(userId: string): Promise<boolean> {
    return await DatabaseRoles.checkUserPermission(userId, "system:admin")
  }

  // Get user's role name
  static async getUserRole(userId: string): Promise<string | null> {
    try {
      const userRecord = await DatabaseRoles.getUserById?.(userId)
      if (!userRecord) return null

      const recordData = userRecord.recordData as any
      return recordData?.roleName || null
    } catch (error) {
      console.error("Error getting user role:", error)
      return null
    }
  }

  // Permission-based UI helpers
  static createPermissionGuard(userId: string) {
    return {
      canView: (resourceType: ResourceType, resourceId?: string) =>
        this.checkResourcePermission(userId, resourceType, "view", resourceId),
      
      canCreate: (resourceType: ResourceType, resourceId?: string) =>
        this.checkResourcePermission(userId, resourceType, "create", resourceId),
      
      canEdit: (resourceType: ResourceType, resourceId?: string) =>
        this.checkResourcePermission(userId, resourceType, "edit", resourceId),
      
      canDelete: (resourceType: ResourceType, resourceId?: string) =>
        this.checkResourcePermission(userId, resourceType, "delete", resourceId),
      
      canPublish: (formId?: string) =>
        this.checkResourcePermission(userId, "Form", "publish", formId),
      
      isAdmin: () => this.isAdmin(userId),
      
      canManageUsers: () => this.canManageUsers(userId),
      
      getRole: () => this.getUserRole(userId)
    }
  }
}

// React hook for permissions (if using React)
export function usePermissions(userId: string) {
  return PermissionUtils.createPermissionGuard(userId)
}