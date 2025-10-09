import { DatabaseTransforms } from "./DatabaseTransforms"
import { DatabaseRecords } from "./DatabaseRecords"
import { DatabaseModules } from "./DatabaseModules"
import { DatabaseRoles } from "./DatabaseRoles"
import { AuthMiddleware, UserPermission, RolePermission } from "./auth-middleware"
import { prisma } from "./prisma"

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

  // Enhanced module hierarchy with permission filtering - UPDATED LOGIC
  static async getModuleHierarchy(userId?: string, organizationId?: string): Promise<any[]> {
    try {
      console.log(`[DatabaseService] Getting module hierarchy for userId: ${userId || 'unauthenticated'}`);

      if (!userId) {
        console.log("[DatabaseService] No user ID provided, returning all modules for unauthenticated access");
        return await DatabaseModules.getModuleHierarchy();
      }

      // Step 1: Get modules via role permissions (equivalent to first part of UNION)
      const modulesViaRoles = await prisma.$queryRaw`
        SELECT DISTINCT m.id, m.name, m.description, m.icon, m.color, m.settings, 
               m.parent_id, m.module_type, m.level, m.path, m.is_active, 
               m.sort_order, m.created_at, m.updated_at
        FROM users u
        JOIN user_unit_assignments uua ON uua.user_id = u.id
        JOIN roles r ON r.id = uua.role_id
        JOIN role_permissions rp ON rp.role_id = r.id AND rp.granted = TRUE
        JOIN form_modules m ON m.id = rp.module_id AND m.is_active = TRUE
        WHERE u.id = ${userId}
      ` as any[];

      console.log(`[DatabaseService] Found ${modulesViaRoles.length} modules via role permissions`);

      // Step 2: Get modules via direct user permissions (equivalent to second part of UNION)
      const modulesViaUserPermissions = await prisma.$queryRaw`
        SELECT DISTINCT m.id, m.name, m.description, m.icon, m.color, m.settings,
               m.parent_id, m.module_type, m.level, m.path, m.is_active,
               m.sort_order, m.created_at, m.updated_at
        FROM users u
        JOIN user_permissions up ON up.user_id = u.id AND up.granted = TRUE AND up.is_active = TRUE
        JOIN form_modules m ON m.id = up.module_id AND m.is_active = TRUE
        WHERE u.id = ${userId}
      ` as any[];

      console.log(`[DatabaseService] Found ${modulesViaUserPermissions.length} modules via direct user permissions`);

      // Step 3: Combine and deduplicate modules
      const allUserModules = new Map();
      
      // Add modules from roles
      modulesViaRoles.forEach(module => {
        allUserModules.set(module.id, module);
      });

      // Add modules from direct permissions (will overwrite if exists, but that's fine)
      modulesViaUserPermissions.forEach(module => {
        allUserModules.set(module.id, module);
      });

      const uniqueModuleIds = Array.from(allUserModules.keys());
      console.log(`[DatabaseService] Total unique accessible modules: ${uniqueModuleIds.length}`);

      if (uniqueModuleIds.length === 0) {
        console.log("[DatabaseService] No accessible modules found for user");
        return [];
      }

      // Step 4: Get complete module data with forms and build hierarchy
      const completeModules = await prisma.formModule.findMany({
        where: {
          id: { in: uniqueModuleIds },
          isActive: true
        },
        include: {
          forms: {
            include: {
              tableMapping: true,
              sections: {
                include: {
                  fields: true,
                  subforms: {
                    include: {
                      fields: true,
                      records: true,
                      parentSubform: true,
                      childSubforms: {
                        include: {
                          fields: true,
                          records: true,
                          childSubforms: {
                            include: {
                              fields: true,
                              records: true,
                            },
                            orderBy: { order: "asc" },
                          },
                        },
                        orderBy: { order: "asc" },
                      },
                    },
                    orderBy: { order: "asc" },
                  },
                },
                orderBy: { order: "asc" },
              },
              _count: {
                select: {
                  records1: true,
                  records2: true,
                  records3: true,
                  records4: true,
                  records5: true,
                  records6: true,
                  records7: true,
                  records8: true,
                  records9: true,
                  records10: true,
                  records11: true,
                  records12: true,
                  records13: true,
                  records14: true,
                  records15: true,
                },
              },
            },
          },
          parent: true,
          children: {
            where: {
              isActive: true,
              id: { in: uniqueModuleIds } // Only include children user has access to
            },
            include: {
              forms: {
                include: {
                  tableMapping: true,
                  sections: {
                    include: {
                      fields: true,
                      subforms: {
                        include: {
                          fields: true,
                          records: true,
                        },
                        orderBy: { order: "asc" },
                      },
                    },
                    orderBy: { order: "asc" },
                  },
                  _count: {
                    select: {
                      records1: true,
                      records2: true,
                      records3: true,
                      records4: true,
                      records5: true,
                      records6: true,
                      records7: true,
                      records8: true,
                      records9: true,
                      records10: true,
                      records11: true,
                      records12: true,
                      records13: true,
                      records14: true,
                      records15: true,
                    },
                  },
                },
              },
            },
            orderBy: [{ level: "asc" }, { sortOrder: "asc" }, { name: "asc" }]
          }
        },
        orderBy: [{ level: "asc" }, { sortOrder: "asc" }, { name: "asc" }]
      });

      console.log(`[DatabaseService] Retrieved complete data for ${completeModules.length} modules`);

      // Step 5: Build proper hierarchy
      const moduleMap = new Map<string, any>();
      const rootModules: any[] = [];

      // First pass: create map and identify root modules (only those user has access to)
      completeModules.forEach((module) => {
        const transformedModule = { ...module, children: [] };
        moduleMap.set(module.id, transformedModule);

        if (!module.parentId || !uniqueModuleIds.includes(module.parentId)) {
          // Include as root if no parent or parent is not accessible
          rootModules.push(transformedModule);
        }
      });

      // Second pass: build parent-child relationships (only for accessible modules)
      completeModules.forEach((module) => {
        if (module.parentId && moduleMap.has(module.parentId) && uniqueModuleIds.includes(module.parentId)) {
          const parent = moduleMap.get(module.parentId);
          const child = moduleMap.get(module.id);
          if (parent && child) {
            parent.children.push(child);
          }
        }
      });

      // Step 6: Transform to proper format with hierarchy levels
      const result = rootModules.map((module) =>
        DatabaseTransforms.transformModuleHierarchy(module, 0)
      );

      console.log(`[DatabaseService] Built hierarchy with ${result.length} root modules`);
      
      // Log detailed hierarchy info
      result.forEach((rootModule, index) => {
        const childCount = this.countChildrenRecursive(rootModule);
        console.log(`[DatabaseService] Root module ${index + 1}: "${rootModule.name}" with ${childCount} total descendants`);
      });

      return result;
    } catch (error: any) {
      console.error("[DatabaseService] Error getting module hierarchy:", error);
      return [];
    }
  }

  // Helper method to count children recursively
  private static countChildrenRecursive(module: any): number {
    let count = 0;
    if (module.children && module.children.length > 0) {
      count += module.children.length;
      module.children.forEach((child: any) => {
        count += this.countChildrenRecursive(child);
      });
    }
    return count;
  }

  // Enhanced modules list with permission filtering
  static async getModules(userId?: string): Promise<any[]> {
    try {
      const hierarchyModules = await this.getModuleHierarchy(userId)
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
  static async getForms(moduleId?: string, userId?: string): Promise<any[]> {
    try {
      const forms = await DatabaseModules.getForms(moduleId)
      
      if (!userId) {
        console.log("[DatabaseService] No user ID provided for forms, returning all")
        return forms
      }

      // Get user's accessible modules to check form permissions
      const accessibleModules = await this.getModuleHierarchy(userId);
      const accessibleModuleIds = new Set<string>();
      
      // Flatten the hierarchy to get all accessible module IDs
      const collectModuleIds = (modules: any[]) => {
        modules.forEach(module => {
          accessibleModuleIds.add(module.id);
          if (module.children && module.children.length > 0) {
            collectModuleIds(module.children);
          }
        });
      };
      collectModuleIds(accessibleModules);

      // Filter forms based on accessible modules
      const accessibleForms = forms.filter(form => 
        accessibleModuleIds.has(form.moduleId)
      );

      console.log(`[DatabaseService] Filtered ${forms.length} forms down to ${accessibleForms.length} accessible forms`);
      return accessibleForms;
    } catch (error: any) {
      console.error("[DatabaseService] Error getting forms:", error)
      return []
    }
  }

  static async getForm(id: string, userId?: string): Promise<any | null> {
    try {
      const form = await DatabaseModules.getForm(id)

      if (!form) return null

      if (!userId) {
        console.log("[DatabaseService] No user ID provided for form access, allowing access")
        return form
      }

      // Check if user has access to the form's module
      const accessibleModules = await this.getModuleHierarchy(userId);
      const accessibleModuleIds = new Set<string>();
      
      const collectModuleIds = (modules: any[]) => {
        modules.forEach(module => {
          accessibleModuleIds.add(module.id);
          if (module.children && module.children.length > 0) {
            collectModuleIds(module.children);
          }
        });
      };
      collectModuleIds(accessibleModules);

      if (!accessibleModuleIds.has(form.moduleId)) {
        console.log(`[DatabaseService] User denied access to form ${form.name} - module not accessible`)
        return null
      }

      return form
    } catch (error: any) {
      console.error("[DatabaseService] Error getting form:", error)
      return null
    }
  }

  static async updateForm(id: string, data: any, userId?: string): Promise<any> {
    // Check permissions before update
    if (userId) {
      const form = await this.getForm(id, userId)
      if (!form) {
        throw new Error("Insufficient permissions to update this form or form not found")
      }
    }

    return DatabaseModules.updateForm(id, data)
  }

  // Helper methods for getting user permissions (kept for compatibility)
  private static async getUserPermissionsForFiltering(userId: string): Promise<UserPermission[]> {
    return await prisma.userPermission.findMany({
      where: { userId, isActive: true },
      include: {
        permission: { 
          select: { 
            name: true, 
            category: true 
          } 
        },
        module: { 
          select: { 
            name: true, 
            path: true 
          } 
        },
      },
    }) as UserPermission[];
  }

  private static async getRolePermissionsForUser(userId: string): Promise<RolePermission[]> {
    const userAssignments = await prisma.userUnitAssignment.findMany({
      where: { userId },
      select: { roleId: true },
    });
    
    const roleIds = userAssignments.map(assignment => assignment.roleId);

    if (roleIds.length === 0) return [];

    return await prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      include: {
        permission: { 
          select: { 
            name: true, 
            category: true 
          } 
        },
        module: { 
          select: { 
            name: true, 
            path: true 
          } 
        },
      },
    }) as RolePermission[];
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
      const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          unitAssignments: {
            include: {
              role: true,
              unit: true
            }
          }
        }
      })
      if (!userRecord) {
        console.log(`[DatabaseService] User not found: ${userId}`)
        return null
      }

      // Get user permissions and role permissions
      const userPermissions = await this.getUserPermissionsForFiltering(userId);
      const rolePermissions = await this.getRolePermissionsForUser(userId);

      // Get accessible modules (using the updated logic)
      const accessibleModules = await this.getModuleHierarchy(userId);

      // Get accessible forms (using the updated logic)
      const accessibleForms = await this.getForms(undefined, userId);

      return {
        user: {
          id: userRecord.id,
          email: userRecord.email || 'Unknown',
          name: `${userRecord.first_name || ''} ${userRecord.last_name || ''}`.trim() || 'Unknown User',
          department: userRecord.department || 'Unassigned',
          status: userRecord.status || 'Active'
        },
        permissions: [...userPermissions, ...rolePermissions],
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
      if (resourceType === 'module') {
        // Check if user has access to this module
        const accessibleModules = await this.getModuleHierarchy(userId);
        const accessibleModuleIds = new Set<string>();
        
        const collectModuleIds = (modules: any[]) => {
          modules.forEach(module => {
            accessibleModuleIds.add(module.id);
            if (module.children && module.children.length > 0) {
              collectModuleIds(module.children);
            }
          });
        };
        collectModuleIds(accessibleModules);

        return accessibleModuleIds.has(resourceId);
      } else {
        // For forms, check if user has access
        const form = await this.getForm(resourceId, userId);
        return form !== null;
      }
    } catch (error: any) {
      console.error("[DatabaseService] Error validating user access:", error)
      return false
    }
  }
}