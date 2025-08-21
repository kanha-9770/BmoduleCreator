import { DatabaseTransforms } from "./DatabaseTransforms"
import { DatabaseRecords } from "./DatabaseRecords"
import { DatabaseModules } from "./DatabaseModules"
import { DatabaseRoles } from "./DatabaseRoles"
import { AuthMiddleware } from "./auth-middleware"

export class DatabaseService {
  static getFieldById(subformId: any) {
    throw new Error("Method not implemented.")
  }
  static deleteSubformWithCleanup(subformId: string) {
    throw new Error("Method not implemented.")
  }
  // Data transformation methods
  static transformModule = DatabaseTransforms.transformModule
  static transformForm = DatabaseTransforms.transformForm
  static transformSection = DatabaseTransforms.transformSection
  static transformField = DatabaseTransforms.transformField
  static transformRecord = DatabaseTransforms.transformRecord
  static transformSubform = DatabaseTransforms.transformSubform
  static calculateRecordCount = DatabaseTransforms.calculateRecordCount
  static transformRecords = DatabaseTransforms.transformRecords
  static transformModuleHierarchy = DatabaseTransforms.transformModuleHierarchy
  static flattenModuleHierarchy = DatabaseTransforms.flattenModuleHierarchy
  static getFormRecordTable = DatabaseTransforms.getFormRecordTable

  // Module operations with permission filtering
  static createModule = DatabaseModules.createModule
  static getModule = DatabaseModules.getModule
  static updateModule = DatabaseModules.updateModule
  static moveModule = DatabaseModules.moveModule
  static deleteModule = DatabaseModules.deleteModule

  // Enhanced module hierarchy with permission filtering
  static async getModuleHierarchy(userPermissions?: any[]): Promise<any[]> {
    try {
      console.log("[DatabaseService] Getting module hierarchy with permission filtering")

      const modules = await DatabaseModules.getModuleHierarchy()
      console.log(`[DatabaseService] Found ${modules.length} total modules`)

      if (!userPermissions || userPermissions.length === 0) {
        console.log("[DatabaseService] No user permissions provided, returning all modules for now")
        // For development/testing, return all modules if no permissions
        // In production, you might want to return empty array
        return modules
      }

      // Filter modules based on user permissions
      const filteredModules = AuthMiddleware.filterModulesByPermissions(modules, userPermissions)
      console.log(`[DatabaseService] Filtered to ${filteredModules.length} accessible modules`)

      return filteredModules
    } catch (error: any) {
      console.error("[DatabaseService] Error getting module hierarchy:", error)
      return []
    }
  }

  // Enhanced modules list with permission filtering
  static async getModules(userPermissions?: any[]): Promise<any[]> {
    try {
      const hierarchyModules = await this.getModuleHierarchy(userPermissions)
      return DatabaseTransforms.flattenModuleHierarchy(hierarchyModules)
    } catch (error: any) {
      console.error("[DatabaseService] Error getting modules:", error)
      return []
    }
  }

  // Form operations with permission checks
  static createForm = DatabaseModules.createForm
  static deleteForm = DatabaseModules.deleteForm
  static publishForm = DatabaseModules.publishForm
  static unpublishForm = DatabaseModules.unpublishForm

  // Enhanced form operations with permission filtering
  static async getForms(moduleId?: string, userPermissions?: any[]): Promise<any[]> {
    try {
      const forms = await DatabaseModules.getForms(moduleId)
      if (!userPermissions || userPermissions.length === 0) {
        console.log("[DatabaseService] No user permissions provided for forms, returning all")
        return forms
      }

      // Filter forms based on user permissions
      return forms.filter(form => {
        return AuthMiddleware.hasFormPermission(
          userPermissions,
          form.moduleId,
          form.id,
          "view"
        )
      })
    } catch (error: any) {
      console.error("[DatabaseService] Error getting forms:", error)
      return []
    }
  }

  static async getForm(id: string, userPermissions?: any[]): Promise<any | null> {
    try {
      const form = await DatabaseModules.getForm(id)

      if (!form) return null

      if (!userPermissions || userPermissions.length === 0) {
        console.log("[DatabaseService] No user permissions provided for form access, allowing access")
        return form
      }

      // Check if user has permission to view this form
      const hasAccess = AuthMiddleware.hasFormPermission(
        userPermissions,
        form.moduleId,
        form.id,
        "view"
      )

      if (!hasAccess) {
        console.log(`[DatabaseService] User denied access to form ${form.name}`)
        return null
      }

      return form
    } catch (error: any) {
      console.error("[DatabaseService] Error getting form:", error)
      return null
    }
  }

  static async updateForm(id: string, data: any, userPermissions?: any[]): Promise<any> {
    // Check permissions before update
    if (userPermissions && userPermissions.length > 0) {
      const form = await DatabaseModules.getForm(id)
      if (form) {
        const hasAccess = AuthMiddleware.hasFormPermission(
          userPermissions,
          form.moduleId,
          form.id,
          "edit"
        )
        if (!hasAccess) {
          throw new Error("Insufficient permissions to update this form")
        }
      }
    }

    return DatabaseModules.updateForm(id, data)
  }
  // Section operations
  static createSection = DatabaseModules.createSection
  static getSections = DatabaseModules.getSections
  static updateSection = DatabaseModules.updateSection
  static deleteSection = DatabaseModules.deleteSection
  static deleteSectionWithCleanup = DatabaseModules.deleteSectionWithCleanup
  // Field operations
  static createField = DatabaseModules.createField
  static getFields = DatabaseModules.getFields
  static updateField = DatabaseModules.updateField
  static deleteField = DatabaseModules.deleteField

  // Field types
  static getFieldTypes = DatabaseModules.getFieldTypes
  static upsertFieldType = DatabaseModules.upsertFieldType
  static seedFieldTypes = DatabaseModules.seedFieldTypes

  // User authentication methods
  static getUserRecords = DatabaseRecords.getUserRecords
  static updateUserLastLogin = DatabaseRecords.updateUserLastLogin
  static createUser = DatabaseRecords.createUser
  static getUserById = DatabaseRecords.getUserById
  static updateUserProfile = DatabaseRecords.updateUserProfile

  // Form record operations
  static createFormRecord = DatabaseRecords.createFormRecord
  static getFormRecords = DatabaseRecords.getFormRecords
  static getFormSubmissionCount = DatabaseRecords.getFormSubmissionCount
  static getFormRecord = DatabaseRecords.getFormRecord
  static updateFormRecord = DatabaseRecords.updateFormRecord
  static deleteFormRecord = DatabaseRecords.deleteFormRecord

  // Analytics
  static trackFormEvent = DatabaseRecords.trackFormEvent
  static getFormAnalytics = DatabaseRecords.getFormAnalytics

  // Lookup and relationship methods
  static getLookupSources = DatabaseRecords.getLookupSources
  static getLinkedRecords = DatabaseRecords.getLinkedRecords

  // RBAC operations
  static createRole = DatabaseRoles.createRole
  static getRoles = DatabaseRoles.getRoles
  static getRole = DatabaseRoles.getRole
  static updateRole = DatabaseRoles.updateRole
  static deleteRole = DatabaseRoles.deleteRole
  static createPermission = DatabaseRoles.createPermission
  static getPermissions = DatabaseRoles.getPermissions
  static getPermission = DatabaseRoles.getPermission
  static updatePermission = DatabaseRoles.updatePermission
  static deletePermission = DatabaseRoles.deletePermission
  static assignRoleToUser = DatabaseRoles.assignRoleToUser
  static getUserPermissions = DatabaseRoles.getUserPermissions
  static getUserPermissionsWithResources = DatabaseRoles.getUserPermissionsWithResources
  static checkUserPermission = DatabaseRoles.checkUserPermission
  static grantUserPermission = DatabaseRoles.grantUserPermission
  static revokeUserPermission = DatabaseRoles.revokeUserPermission
  static updateUserPermission = DatabaseRoles.updateUserPermission
  static updateUserPermissionsBatch = DatabaseRoles.updateUserPermissionsBatch
  static createResourcePermissions = DatabaseRoles.createResourcePermissions
  static deleteResourcePermissions = DatabaseRoles.deleteResourcePermissions
  static seedDefaultRoles = DatabaseRoles.seedDefaultRoles
  static getEmployeesWithPermissions = DatabaseRoles.getEmployeesWithPermissions
  static getModulesWithSubmodules = DatabaseRoles.getModulesWithSubmodules
  static updateEmployeePermission = DatabaseRoles.updateEmployeePermission

  // Enhanced user context methods
  static async getUserContext(userId: string): Promise<{
    user: any
    permissions: any[]
    accessibleModules: any[]
    accessibleForms: any[]
  } | null> {
    try {
      console.log(`[DatabaseService] Getting user context for: ${userId}`)

      // Get user record
      const userRecord = await DatabaseRoles.getUserById(userId)
      if (!userRecord) {
        console.log(`[DatabaseService] User not found: ${userId}`)
        return null
      }

      // Get user permissions
      const permissions = await DatabaseRoles.getUserPermissionsWithResources(userId)
      console.log(`[DatabaseService] Found ${permissions.length} permissions for user`)

      // Get accessible modules
      const allModules = await DatabaseModules.getModuleHierarchy()
      const accessibleModules = AuthMiddleware.filterModulesByPermissions(allModules, permissions)

      // Get accessible forms
      const allForms = await DatabaseModules.getForms()
      const accessibleForms = allForms.filter(form => {
        return AuthMiddleware.hasFormPermission(permissions, form.moduleId, form.id, "view")
      })

      const recordData = userRecord.recordData as any

      return {
        user: {
          id: userRecord.id,
          email: recordData?.email || 'Unknown',
          name: recordData?.name || recordData?.fullName || 'Unknown User',
          role: recordData?.role || recordData?.roleName || 'No Role',
          department: recordData?.department || 'Unassigned',
          status: recordData?.status || 'Active'
        },
        permissions,
        accessibleModules,
        accessibleForms
      }
    } catch (error: any) {
      console.error("[DatabaseService] Error getting user context:", error)
      return null
    }
  }

  // Permission validation helpers
  static async validateUserAccess(
    userId: string,
    resourceType: 'module' | 'form',
    resourceId: string,
    action: string = 'view'
  ): Promise<boolean> {
    try {
      const permissions = await DatabaseRoles.getUserPermissionsWithResources(userId)

      if (resourceType === 'module') {
        return AuthMiddleware.hasModulePermission(permissions, resourceId, action as any)
      } else {
        // For forms, we need to get the moduleId
        const form = await DatabaseModules.getForm(resourceId)
        if (!form) return false

        return AuthMiddleware.hasFormPermission(permissions, form.moduleId, resourceId, action as any)
      }
    } catch (error: any) {
      console.error("[DatabaseService] Error validating user access:", error)
      return false
    }
  }
}