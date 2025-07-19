import { prisma } from "@/lib/prisma";
import type { Role, Permission, RolePermission } from "@/types/rbac";
import { DatabaseTransforms } from "./DatabaseTransforms";

export class DatabaseRoles {
  // Role Operations
  static async createRole(data: {
    name: string;
    description?: string;
    permissions?: string[];
  }): Promise<Role> {
    try {
      console.log("[DatabaseRoles] Creating role:", data.name);

      // Check if role already exists
      const existingRole = await prisma.role.findUnique({
        where: { name: data.name },
      });

      if (existingRole) {
        throw new Error(`Role with name "${data.name}" already exists`);
      }

      // Create the role
      const role = await prisma.role.create({
        data: {
          name: data.name,
          description: data.description,
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      // Add permissions if provided
      if (data.permissions && data.permissions.length > 0) {
        await this.assignPermissionsToRole(role.id, data.permissions);

        // Re-fetch role with permissions
        const roleWithPermissions = await this.getRole(role.id);
        return roleWithPermissions!;
      }

      return this.transformRole(role);
    } catch (error: any) {
      console.error("Database error creating role:", error);
      throw new Error(`Failed to create role: ${error?.message}`);
    }
  }

  static async getRoles(): Promise<Role[]> {
    try {
      const roles = await prisma.role.findMany({
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return roles.map((role) => this.transformRole(role));
    } catch (error: any) {
      console.error("Database error fetching roles:", error);
      throw new Error(`Failed to fetch roles: ${error?.message}`);
    }
  }

  static async getRole(id: string): Promise<Role | null> {
    try {
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) return null;
      return this.transformRole(role);
    } catch (error: any) {
      console.error("Database error fetching role:", error);
      throw new Error(`Failed to fetch role: ${error?.message}`);
    }
  }

  static async updateRole(
    id: string,
    data: {
      name?: string;
      description?: string;
      permissions?: string[];
    }
  ): Promise<Role> {
    try {
      console.log("[DatabaseRoles] Updating role:", id);

      // Check if new name conflicts with existing roles
      if (data.name) {
        const existingRole = await prisma.role.findFirst({
          where: {
            name: data.name,
            id: { not: id },
          },
        });

        if (existingRole) {
          throw new Error(`Role with name "${data.name}" already exists`);
        }
      }

      // Update role basic info
      await prisma.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        },
      });

      // Update permissions if provided
      if (data.permissions !== undefined) {
        // Remove all existing permissions
        await prisma.rolePermission.deleteMany({
          where: { roleId: id },
        });

        // Add new permissions
        if (data.permissions.length > 0) {
          await this.assignPermissionsToRole(id, data.permissions);
        }
      }

      // Return updated role
      const updatedRole = await this.getRole(id);
      return updatedRole!;
    } catch (error: any) {
      console.error("Database error updating role:", error);
      throw new Error(`Failed to update role: ${error?.message}`);
    }
  }

  static async deleteRole(id: string): Promise<void> {
    try {
      console.log("[DatabaseRoles] Deleting role:", id);

      // Check if role is in use
      const usersWithRole = await prisma.formRecord15.count({
        where: {
          recordData: {
            path: ["roleId"],
            equals: id,
          },
        },
      });

      if (usersWithRole > 0) {
        throw new Error(
          `Cannot delete role. ${usersWithRole} users are assigned to this role.`
        );
      }

      // Delete the role (permissions will be cascade deleted)
      await prisma.role.delete({
        where: { id },
      });

      console.log("[DatabaseRoles] Role deleted successfully");
    } catch (error: any) {
      console.error("Database error deleting role:", error);
      throw new Error(`Failed to delete role: ${error?.message}`);
    }
  }

  // Permission Operations
  static async createPermission(data: {
    name: string;
    description?: string;
    resourceId?: string;
    resourceType?: string;
  }): Promise<Permission> {
    try {
      console.log("[DatabaseRoles] Creating permission:", data.name);

      // Check if permission already exists
      const existingPermission = await prisma.permission.findUnique({
        where: { name: data.name },
      });

      if (existingPermission) {
        throw new Error(`Permission with name "${data.name}" already exists`);
      }

      const permission = await prisma.permission.create({
        data: {
          name: data.name,
          description: data.description,
          resourceId: data.resourceId,
          resourceType: data.resourceType,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      return this.transformPermission(permission);
    } catch (error: any) {
      console.error("Database error creating permission:", error);
      throw new Error(`Failed to create permission: ${error?.message}`);
    }
  }

  static async getPermissions(filters?: {
    resourceType?: string;
    resourceId?: string;
  }): Promise<Permission[]> {
    try {
      const where: any = {};

      if (filters?.resourceType) {
        where.resourceType = filters.resourceType;
      }

      if (filters?.resourceId) {
        where.resourceId = filters.resourceId;
      }

      const permissions = await prisma.permission.findMany({
        where,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return permissions.map((permission) => this.transformPermission(permission));
    } catch (error: any) {
      console.error("Database error fetching permissions:", error);
      throw new Error(`Failed to fetch permissions: ${error?.message}`);
    }
  }

  static async getPermission(id: string): Promise<Permission | null> {
    try {
      const permission = await prisma.permission.findUnique({
        where: { id },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!permission) return null;
      return this.transformPermission(permission);
    } catch (error: any) {
      console.error("Database error fetching permission:", error);
      throw new Error(`Failed to fetch permission: ${error?.message}`);
    }
  }

  static async updatePermission(
    id: string,
    data: {
      name?: string;
      description?: string;
      resourceId?: string;
      resourceType?: string;
    }
  ): Promise<Permission> {
    try {
      console.log("[DatabaseRoles] Updating permission:", id);

      // Check if new name conflicts with existing permissions
      if (data.name) {
        const existingPermission = await prisma.permission.findFirst({
          where: {
            name: data.name,
            id: { not: id },
          },
        });

        if (existingPermission) {
          throw new Error(`Permission with name "${data.name}" already exists`);
        }
      }

      const permission = await prisma.permission.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          resourceId: data.resourceId,
          resourceType: data.resourceType,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      return this.transformPermission(permission);
    } catch (error: any) {
      console.error("Database error updating permission:", error);
      throw new Error(`Failed to update permission: ${error?.message}`);
    }
  }

  static async deletePermission(id: string): Promise<void> {
    try {
      console.log("[DatabaseRoles] Deleting permission:", id);

      // Delete the permission (role assignments will be cascade deleted)
      await prisma.permission.delete({
        where: { id },
      });

      console.log("[DatabaseRoles] Permission deleted successfully");
    } catch (error: any) {
      console.error("Database error deleting permission:", error);
      throw new Error(`Failed to delete permission: ${error?.message}`);
    }
  }

  // Role-Permission Assignment Operations
  static async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<void> {
    try {
      console.log("[DatabaseRoles] Assigning permissions to role:", {
        roleId,
        permissionIds,
      });

      // Validate role exists
      const role = await prisma.role.findUnique({ where: { id: roleId } });
      if (!role) {
        throw new Error(`Role not found: ${roleId}`);
      }

      // Validate permissions exist
      const permissions = await prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });

      if (permissions.length !== permissionIds.length) {
        const foundIds = permissions.map((p) => p.id);
        const missingIds = permissionIds.filter((id) => !foundIds.includes(id));
        throw new Error(`Permissions not found: ${missingIds.join(", ")}`);
      }

      // Create role-permission assignments
      const assignments = permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      }));

      await prisma.rolePermission.createMany({
        data: assignments,
        skipDuplicates: true,
      });

      console.log("[DatabaseRoles] Permissions assigned successfully");
    } catch (error: any) {
      console.error("Database error assigning permissions:", error);
      throw new Error(`Failed to assign permissions: ${error?.message}`);
    }
  }

  static async removePermissionsFromRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<void> {
    try {
      console.log("[DatabaseRoles] Removing permissions from role:", {
        roleId,
        permissionIds,
      });

      await prisma.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId: { in: permissionIds },
        },
      });

      console.log("[DatabaseRoles] Permissions removed successfully");
    } catch (error: any) {
      console.error("Database error removing permissions:", error);
      throw new Error(`Failed to remove permissions: ${error?.message}`);
    }
  }

  // User Permission Operations (for form_records_15 users)
  static async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    try {
      console.log("[DatabaseRoles] Assigning role to user:", { userId, roleId });

      // Validate role exists
      const role = await prisma.role.findUnique({ where: { id: roleId } });
      if (!role) {
        throw new Error(`Role not found: ${roleId}`);
      }

      // Get user record from form_records_15
      const userRecord = await prisma.formRecord15.findUnique({
        where: { id: userId },
      });

      if (!userRecord) {
        throw new Error(`User not found: ${userId}`);
      }

      // Update user record with role assignment
      const recordData = userRecord.recordData as any;
      const updatedRecordData = {
        ...recordData,
        roleId: roleId,
        roleName: role.name,
        roleUpdatedAt: new Date().toISOString(),
      };

      await prisma.formRecord15.update({
        where: { id: userId },
        data: {
          recordData: updatedRecordData,
          updatedAt: new Date(),
        },
      });

      console.log("[DatabaseRoles] Role assigned to user successfully");
    } catch (error: any) {
      console.error("Database error assigning role to user:", error);
      throw new Error(`Failed to assign role to user: ${error?.message}`);
    }
  }

  static async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      console.log("[DatabaseRoles] Getting user permissions:", userId);

      // Get user record from form_records_15
      const userRecord = await prisma.formRecord15.findUnique({
        where: { id: userId },
      });

      if (!userRecord) {
        throw new Error(`User not found: ${userId}`);
      }

      const recordData = userRecord.recordData as any;
      const roleId = recordData?.roleId;

      if (!roleId) {
        console.log("[DatabaseRoles] User has no role assigned");
        return [];
      }

      // Get role with permissions
      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        console.log("[DatabaseRoles] Role not found:", roleId);
        return [];
      }

      const permissions = role.permissions.map((rp) =>
        this.transformPermission(rp.permission)
      );
      console.log(
        `[DatabaseRoles] Found ${permissions.length} permissions for user`
      );

      return permissions;
    } catch (error: any) {
      console.error("Database error getting user permissions:", error);
      throw new Error(`Failed to get user permissions: ${error?.message}`);
    }
  }

  static async checkUserPermission(
    userId: string,
    permissionName: string,
    resourceId?: string
  ): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);

      return userPermissions.some((permission) => {
        if (permission.name !== permissionName) return false;
        if (
          resourceId &&
          permission.resourceId &&
          permission.resourceId !== resourceId
        )
          return false;
        return true;
      });
    } catch (error: any) {
      console.error("Database error checking user permission:", error);
      return false;
    }
  }

  // New Methods to Resolve Errors
  static async createResourcePermissions(data: {
    resourceId: string;
    resourceType: string;
    permissions: Array<{ name: string; description?: string }>;
  }): Promise<Permission[]> {
    try {
      console.log("[DatabaseRoles] Creating resource permissions:", {
        resourceId: data.resourceId,
        resourceType: data.resourceType,
      });

      const createdPermissions: Permission[] = [];

      for (const perm of data.permissions) {
        // Check if permission already exists
        const existingPermission = await prisma.permission.findUnique({
          where: { name: perm.name },
        });

        if (existingPermission) {
          throw new Error(`Permission with name "${perm.name}" already exists`);
        }

        const permission = await prisma.permission.create({
          data: {
            name: perm.name,
            description: perm.description,
            resourceId: data.resourceId,
            resourceType: data.resourceType,
          },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        });

        createdPermissions.push(this.transformPermission(permission));
      }

      console.log("[DatabaseRoles] Resource permissions created successfully");
      return createdPermissions;
    } catch (error: any) {
      console.error("Database error creating resource permissions:", error);
      throw new Error(`Failed to create resource permissions: ${error?.message}`);
    }
  }

  static async deleteResourcePermissions(
    resourceId: string,
    resourceType: string
  ): Promise<void> {
    try {
      console.log("[DatabaseRoles] Deleting permissions for resource:", {
        resourceId,
        resourceType,
      });

      // Delete all permissions associated with the resource
      await prisma.permission.deleteMany({
        where: {
          resourceId,
          resourceType,
        },
      });

      console.log("[DatabaseRoles] Resource permissions deleted successfully");
    } catch (error: any) {
      console.error("Database error deleting resource permissions:", error);
      throw new Error(`Failed to delete resource permissions: ${error?.message}`);
    }
  }

  static async getUserById(userId: string): Promise<any | null> {
    try {
      console.log("[DatabaseRoles] Fetching user by ID:", userId);

      const userRecord = await prisma.formRecord15.findUnique({
        where: { id: userId },
      });

      if (!userRecord) {
        console.log("[DatabaseRoles] User not found:", userId);
        return null;
      }

      return {
        id: userRecord.id,
        recordData: userRecord.recordData,
        createdAt: userRecord.createdAt,
        updatedAt: userRecord.updatedAt,
        employee_id: userRecord.employee_id,
        status: userRecord.status,
      };
    } catch (error: any) {
      console.error("Database error fetching user:", error);
      throw new Error(`Failed to fetch user: ${error?.message}`);
    }
  }

  // Employee Permission Matrix Operations
  static async getEmployeesWithPermissions(): Promise<
    Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      department: string;
      status: string;
      permissions: Record<string, Record<string, boolean>>;
    }>
  > {
    try {
      console.log("[DatabaseRoles] Getting employees with permissions");

      // Get all users from form_records_15
      const userRecords = await prisma.formRecord15.findMany({
        orderBy: { createdAt: "desc" },
      });

      console.log(
        `[DatabaseRoles] Found ${userRecords.length} total records in form_records_15`
      );

      const employees = [];

      for (const record of userRecords) {
        const recordData = record.recordData as any;

        // Skip records that don't have basic user information
        if (!recordData || typeof recordData !== "object") continue;

        // Try to extract email from various possible field structures
        let email = null;
        let name = null;

        // Check if recordData has direct properties
        if (recordData.email) {
          email = recordData.email;
          name = recordData.name || recordData.fullName || recordData.firstName;
        } else {
          // Check if recordData has field-based structure
          for (const fieldId in recordData) {
            const field = recordData[fieldId];
            if (field && typeof field === "object" && field.value) {
              if (
                field.type === "email" ||
                (field.label && field.label.toLowerCase().includes("email"))
              ) {
                email = field.value;
              }
              if (
                !name &&
                (field.type === "text" || field.type === "name") &&
                field.label &&
                (field.label.toLowerCase().includes("name") ||
                  field.label.toLowerCase().includes("full"))
              ) {
                name = field.value;
              }
            }
          }
        }

        // Skip if no email found
        if (!email) continue;

        // Get user's role and permissions
        const roleId = recordData.roleId;
        let userPermissions: Permission[] = [];

        if (roleId) {
          userPermissions = await this.getUserPermissions(record.id);
        }

        // Transform permissions into module-submodule matrix format
        const permissionMatrix: Record<string, Record<string, boolean>> = {};

        for (const permission of userPermissions) {
          // Parse permission name: moduleId:submoduleId:action
          const parts = permission.name.split(":");
          if (parts.length === 3) {
            const moduleId = parts[0];
            const submoduleId = parts[1];
            const action = parts[2];

            if (!permissionMatrix[moduleId]) {
              permissionMatrix[moduleId] = {};
            }
            if (!permissionMatrix[moduleId][submoduleId]) {
              permissionMatrix[moduleId][submoduleId] = {};
            }

            if (["view", "create", "edit", "delete"].includes(action)) {
              permissionMatrix[moduleId][submoduleId][action] = true;
            }
          }
        }

        employees.push({
          id: record.id,
          name: name || "Unknown User",
          email: email,
          role: recordData.roleName || "No Role",
          department: recordData.department || "Unassigned",
          status: recordData.status || "Active",
          permissions: permissionMatrix,
        });
      }

      console.log(`[DatabaseRoles] Found ${employees.length} employees`);
      return employees;
    } catch (error: any) {
      console.error("Database error getting employees with permissions:", error);
      throw new Error(
        `Failed to get employees with permissions: ${error?.message}`
      );
    }
  }

  static async getModulesWithSubmodules(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      subModules: Array<{
        id: string;
        name: string;
      }>;
    }>
  > {
    try {
      console.log("[DatabaseRoles] Getting modules with submodules");

      // Get all modules with their child modules (treating child modules as submodules)
      const modules = await prisma.formModule.findMany({
        where: {
          parentId: null, // Only get parent modules
          isActive: true,
        },
        include: {
          children: {
            where: {
              isActive: true,
            },
            select: {
              id: true,
              name: true,
              description: true,
            },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });

      const result = modules.map((module) => ({
        id: module.id,
        name: module.name,
        description: module.description || "",
        subModules: module.children.map((childModule) => ({
          id: childModule.id,
          name: childModule.name,
        })),
      }));

      console.log(
        `[DatabaseRoles] Found ${result.length} modules with submodules`
      );
      return result;
    } catch (error: any) {
      console.error("Database error getting modules with submodules:", error);
      throw new Error(
        `Failed to get modules with submodules: ${error?.message}`
      );
    }
  }

  static async updateEmployeePermission(
    employeeId: string,
    moduleId: string,
    submoduleId: string,
    permissionType: string,
    value: boolean
  ): Promise<void> {
    try {
      console.log("[DatabaseRoles] Updating employee permission:", {
        employeeId,
        moduleId,
        submoduleId,
        permissionType,
        value,
      });

      // Get user's current role
      const userRecord = await prisma.formRecord15.findUnique({
        where: { id: employeeId },
      });

      if (!userRecord) {
        throw new Error(`User not found: ${employeeId}`);
      }

      const recordData = userRecord.recordData as any;
      const roleId = recordData?.roleId;

      if (!roleId) {
        throw new Error(`User has no role assigned: ${employeeId}`);
      }

      // Create permission name
      const permissionName = `${moduleId}:${submoduleId}:${permissionType}`;

      // Check if permission exists
      let permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (!permission) {
        // Create the permission if it doesn't exist
        permission = await this.createPermission({
          name: permissionName,
          description: `${permissionType.toUpperCase()} permission for ${submoduleId} submodule in ${moduleId} module`,
          resourceId: submoduleId,
          resourceType: "FormModule",
        });
      }

      // Check if role already has this permission
      const existingRolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: roleId,
          permissionId: permission.id,
        },
      });

      if (value && !existingRolePermission) {
        // Add permission to role
        await prisma.rolePermission.create({
          data: {
            roleId: roleId,
            permissionId: permission.id,
          },
        });
      } else if (!value && existingRolePermission) {
        // Remove permission from role
        await prisma.rolePermission.delete({
          where: {
            id: existingRolePermission.id,
          },
        });
      }

      console.log("[DatabaseRoles] Employee permission updated successfully");
    } catch (error: any) {
      console.error("Database error updating employee permission:", error);
      throw new Error(`Failed to update employee permission: ${error?.message}`);
    }
  }

  // Utility Methods
  private static transformRole(rawRole: any): Role {
    return {
      id: rawRole.id,
      name: rawRole.name,
      description: rawRole.description || null,
      permissions: rawRole.permissions?.map((rp: any) =>
        this.transformPermission(rp.permission)
      ) || [],
      createdAt: rawRole.createdAt,
      updatedAt: rawRole.updatedAt,
    };
  }

  private static transformPermission(rawPermission: any): Permission {
    return {
      id: rawPermission.id,
      name: rawPermission.name,
      description: rawPermission.description || null,
      resourceId: rawPermission.resourceId || null,
      resourceType: rawPermission.resourceType || null,
      roles: rawPermission.roles?.map((rp: any) => rp.role) || [],
      createdAt: rawPermission.createdAt,
      updatedAt: rawPermission.updatedAt,
    };
  }

  // Seed default roles and permissions
  static async seedDefaultRoles(): Promise<void> {
    try {
      console.log("[DatabaseRoles] Seeding default roles and permissions");

      // Get all modules and forms to create permissions
      const modules = await this.getModulesWithSubmodules();

      // Create permissions for each module and form
      const createdPermissions: Permission[] = [];

      for (const module of modules) {
        // Create module-level permissions
        const modulePermissions = [
          { name: `${module.id}:view`, description: `View ${module.name} module` },
          {
            name: `${module.id}:manage`,
            description: `Manage ${module.name} module`,
          },
        ];

        for (const perm of modulePermissions) {
          try {
            const existing = await prisma.permission.findUnique({
              where: { name: perm.name },
            });

            if (!existing) {
              const permission = await this.createPermission({
                name: perm.name,
                description: perm.description,
                resourceId: module.id,
                resourceType: "FormModule",
              });
              createdPermissions.push(permission);
            }
          } catch (error) {
            // Permission might already exist, continue
          }
        }

        // Create form-level permissions (submodules)
        for (const submodule of module.subModules) {
          const formPermissions = [
            {
              name: `${module.id}:${submodule.id}:view`,
              description: `View ${submodule.name}`,
            },
            {
              name: `${module.id}:${submodule.id}:add`,
              description: `Add records to ${submodule.name}`,
            },
            {
              name: `${module.id}:${submodule.id}:edit`,
              description: `Edit records in ${submodule.name}`,
            },
            {
              name: `${module.id}:${submodule.id}:delete`,
              description: `Delete records from ${submodule.name}`,
            },
          ];

          for (const perm of formPermissions) {
            try {
              const existing = await prisma.permission.findUnique({
                where: { name: perm.name },
              });

              if (!existing) {
                const permission = await this.createPermission({
                  name: perm.name,
                  description: perm.description,
                  resourceId: submodule.id,
                  resourceType: "Form",
                });
                createdPermissions.push(permission);
              }
            } catch (error) {
              // Permission might already exist, continue
            }
          }
        }
      }

      // Create system-level permissions
      const systemPermissions = [
        { name: "system:admin", description: "System Administrator" },
        { name: "system:user_management", description: "Manage Users" },
        { name: "system:role_management", description: "Manage Roles" },
        {
          name: "system:permission_management",
          description: "Manage Permissions",
        },
      ];

      for (const perm of systemPermissions) {
        try {
          const existing = await prisma.permission.findUnique({
            where: { name: perm.name },
          });

          if (!existing) {
            const permission = await this.createPermission(perm);
            createdPermissions.push(permission);
          }
        } catch (error) {
          // Permission might already exist, continue
        }
      }

      // Create default roles
      const defaultRoles = [
        {
          name: "Super Admin",
          description: "Full system access",
          permissions: ["system:admin"],
        },
        {
          name: "Admin",
          description: "Administrative access",
          permissions: [
            "system:user_management",
            "system:role_management",
            ...modules.flatMap((m) => [
              `${m.id}:view`,
              `${m.id}:manage`,
              ...m.subModules.flatMap((sm) => [
                `${m.id}:${sm.id}:view`,
                `${m.id}:${sm.id}:add`,
                `${m.id}:${sm.id}:edit`,
                `${m.id}:${sm.id}:delete`,
              ]),
            ]),
          ],
        },
        {
          name: "Manager",
          description: "Management access",
          permissions: [
            ...modules.flatMap((m) => [
              `${m.id}:view`,
              ...m.subModules.flatMap((sm) => [
                `${m.id}:${sm.id}:view`,
                `${m.id}:${sm.id}:add`,
                `${m.id}:${sm.id}:edit`,
              ]),
            ]),
          ],
        },
        {
          name: "Editor",
          description: "Edit access",
          permissions: [
            ...modules.flatMap((m) => [
              `${m.id}:view`,
              ...m.subModules.flatMap((sm) => [
                `${m.id}:${sm.id}:view`,
                `${m.id}:${sm.id}:add`,
                `${m.id}:${sm.id}:edit`,
              ]),
            ]),
          ],
        },
        {
          name: "Viewer",
          description: "View-only access",
          permissions: [
            ...modules.flatMap((m) => [
              `${m.id}:view`,
              ...m.subModules.map((sm) => `${m.id}:${sm.id}:view`),
            ]),
          ],
        },
      ];

      for (const roleData of defaultRoles) {
        try {
          const existing = await prisma.role.findUnique({
            where: { name: roleData.name },
          });

          if (!existing) {
            // Get permission IDs
            const permissions = await prisma.permission.findMany({
              where: { name: { in: roleData.permissions } },
            });

            await this.createRole({
              name: roleData.name,
              description: roleData.description,
              permissions: permissions.map((p) => p.id),
            });
          }
        } catch (error) {
          console.error(`Error creating role ${roleData.name}:`, error);
        }
      }

      console.log("[DatabaseRoles] Default roles and permissions seeded successfully");
    } catch (error: any) {
      console.error("Database error seeding default roles:", error);
      throw new Error(`Failed to seed default roles: ${error?.message}`);
    }
  }
}