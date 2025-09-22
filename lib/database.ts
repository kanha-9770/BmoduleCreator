import { prisma, PrismaClient } from "./prisma";

export interface DatabaseUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  department?: string;
  location?: string;
  phone?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseRole {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  parentId?: string;
  level: number;
  shareDataWithPeers: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DatabasePermission {
  id: string;
  name: string;
  description: string;
  category: "READ" | "WRITE" | "DELETE" | "ADMIN" | "SPECIAL";
  resource: string;
  resourceId?: string;
  resourceType?: string;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseModule {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  settings?: any;
  parentId?: string;
  level: number;
  path?: string;
  moduleType: "standard" | "submodule";
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissionUpdate {
  roleId: string;
  permissionId: string;
  moduleId?: string;
  granted: boolean;
  canDelegate?: boolean;
}

export interface UserPermissionUpdate {
  userId: string;
  permissionId: string;
  moduleId?: string;
  granted: boolean;
  reason?: string;
  grantedBy?: string;
  expiresAt?: Date | null;
  isActive?: boolean;
}

// Helper function to check database connectivity
async function isDatabaseConnected(): Promise<boolean> {
  if (!prisma) return false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.log("[v0] Database connectivity check failed:", error);
    return false;
  }
}

// Helper function to get or create a valid organizationId
async function getValidOrganizationId(): Promise<string> {
  const defaultOrgId = "default-org";

  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.log(
      "[v0] Database not connected, using default organization ID:",
      defaultOrgId
    );
    return defaultOrgId;
  }

  try {
    let organization = await prisma.organization.findFirst({
      select: { id: true },
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          id: defaultOrgId,
          name: "Default Organization",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        select: { id: true },
      });
      console.log(
        "[v0] Created default organization with ID:",
        organization.id
      );
    }

    return organization.id;
  } catch (error) {
    console.error("[v0] Failed to fetch or create organization:", error);
    console.log("[v0] Falling back to default organization ID:", defaultOrgId);
    return defaultOrgId;
  }
}

// Helper function to ensure standard permissions exist in the database
async function ensureStandardPermissionsExist(): Promise<void> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.log("[v0] Database not connected, skipping permissions setup");
    return;
  }

  try {
    const organizationId = await getValidOrganizationId();

    const standardPermissions = [
      { id: "1", name: "VIEW", category: "READ", resource: "general" },
      { id: "2", name: "CREATE", category: "WRITE", resource: "general" },
      { id: "3", name: "EDIT", category: "WRITE", resource: "general" },
      { id: "4", name: "DELETE", category: "DELETE", resource: "general" },
    ];

    for (const perm of standardPermissions) {
      await prisma.permission.upsert({
        where: { id: perm.id },
        update: {},
        create: {
          id: perm.id,
          name: perm.name,
          category: perm.category as any,
          resource: perm.resource,
          organizationId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`[v0] Ensured permission: ${perm.id} - ${perm.name}`);
    }
    console.log("[v0] Standard permissions ensured in database");
  } catch (error) {
    console.error("[v0] Failed to ensure standard permissions:", error);
  }
}

// Helper function to ensure all required permissions exist
async function ensureAllPermissionsExist(): Promise<void> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.log("[v0] Database not connected, skipping permissions setup");
    return;
  }

  try {
    const organizationId = await getValidOrganizationId();

    const allPermissions = [
      { id: "1", name: "VIEW", category: "READ", resource: "general" },
      { id: "2", name: "CREATE", category: "WRITE", resource: "general" },
      { id: "3", name: "EDIT", category: "WRITE", resource: "general" },
      { id: "4", name: "DELETE", category: "DELETE", resource: "general" },
    ];

    for (const perm of allPermissions) {
      await prisma.permission.upsert({
        where: { id: perm.id },
        update: {},
        create: {
          id: perm.id,
          name: perm.name,
          category: perm.category as any,
          resource: perm.resource,
          organizationId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`[v0] Ensured permission: ${perm.id} - ${perm.name}`);
    }
    console.log("[v0] All required permissions ensured in database");
  } catch (error) {
    console.error("[v0] Failed to ensure all permissions:", error);
  }
}

export async function getRolesWithUsers(): Promise<any[]> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.log("[v0] Database not connected, returning empty roles data");
    return [];
  }

  try {
    const roles = await prisma.role.findMany({
      include: {
        userAssignments: {
          include: {
            user: true,
            unit: true,
          },
        },
      },
    });

    console.log(`[v0] Retrieved roles from database: ${roles.length}`);

    return roles.map((role: any) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      level: role.level,
      isActive: role.isActive,
      userCount: role.userAssignments.length,
      users: role.userAssignments.map((assignment: any) => ({
        id: assignment.user.id,
        first_name: assignment.user.first_name,
        last_name: assignment.user.last_name,
        email: assignment.user.email,
        department: assignment.user.department,
        location: assignment.user.location,
        status: assignment.user.status,
        unitAssignments: [
          {
            unitId: assignment.unitId,
            unit: { name: assignment.unit?.name || "Unknown Unit" },
            roleId: role.id,
          },
        ],
      })),
    }));
  } catch (error) {
    console.log(
      "[v0] Database query failed, returning empty roles data:",
      error
    );
    return [];
  }
}

export async function getUsers(): Promise<any[]> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.log("[v0] Database not connected, returning empty users data");
    return [];
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        unitAssignments: {
          include: {
            unit: true,
            role: true,
          },
        },
      },
    });

    console.log(`[v0] Retrieved users from database: ${users.length}`);

    return users.map((user: any) => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      department: user.department,
      location: user.location,
      status: user.status,
      unitAssignments: user.unitAssignments.map((assignment: any) => ({
        unitId: assignment.unitId,
        unit: { name: assignment.unit?.name || "Unknown Unit" },
        roleId: assignment.roleId,
      })),
    }));
  } catch (error) {
    console.log(
      "[v0] Database query failed, returning empty users data:",
      error
    );
    return [];
  }
}

export async function getPermissions(): Promise<any[]> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.log(
      "[v0] Database not connected, returning empty permissions data"
    );
    return [];
  }

  try {
    await ensureAllPermissionsExist();

    const permissions = await prisma.permission.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    console.log(
      `[v0] Retrieved permissions from database: ${permissions.length}`
    );

    interface PermissionResult {
      id: string;
      name: string;
      category: string;
      resource: string;
    }

    return permissions.map(
      (p: {
        id: string;
        name: string;
        category: string;
        resource: string;
      }): PermissionResult => ({
        id: p.id,
        name: p.name,
        category: p.category,
        resource: p.resource,
      })
    );
  } catch (error) {
    console.log(
      "[v0] Database query failed, returning empty permissions data:",
      error
    );
    return [];
  }
}

export async function getRolePermissions(p0: string | undefined): Promise<any[]> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.log(
      "[v0] Database not connected, returning empty role permissions data"
    );
    return [];
  }

  try {
    const rolePermissions = await prisma.rolePermission.findMany({
      include: {
        role: true,
        permission: true,
        module: true,
      },
    });

    console.log(
      `[v0] Retrieved role permissions from database: ${rolePermissions.length}`
    );

    return rolePermissions.map((rp: any) => ({
      roleId: rp.roleId,
      permissionId: rp.permissionId,
      moduleId: rp.moduleId || "general",
      granted: rp.granted,
      canDelegate: rp.canDelegate,
    }));
  } catch (error) {
    console.log(
      "[v0] Database query failed, returning empty role permissions data:",
      error
    );
    return [];
  }
}

export async function getUserPermissionOverrides(): Promise<any[]> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.log(
      "[v0] Database not connected, returning empty user overrides data"
    );
    return [];
  }

  try {
    const overrides = await prisma.userPermissionOverride.findMany({
      include: {
        user: true,
        permission: true,
      },
    });

    console.log(
      `[v0] Retrieved user permissions from database: ${overrides.length}`
    );

    return overrides.map((override: any) => ({
      userId: override.userId,
      permissionId: override.permissionId,
      moduleId: override.moduleId || "general",
      granted: override.granted,
      reason: override.reason,
      grantedBy: override.grantedBy,
      grantedAt: override.grantedAt,
      expiresAt: override.expiresAt,
      isActive: override.isActive,
    }));
  } catch (error) {
    console.log(
      "[v0] Database query failed, returning empty user overrides data:",
      error
    );
    return [];
  }
}

export async function getModules(): Promise<any[]> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.log("[v0] Database not connected, returning empty modules data");
    return [];
  }

  try {
    console.log("[v0] Fetching modules from database...");
    const modules = await prisma.formModule.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    console.log(`[v0] Retrieved modules from database: ${modules.length}`);

    const result = modules.map((module: any) => ({
      id: module.id,
      name: module.name,
      description: module.description,
      icon: module.icon,
      color: module.color,
      level: module.level,
      children: module.children.map((child: any) => ({
        id: child.id,
        name: child.name,
        description: child.description,
        icon: child.icon,
        color: child.color,
      })),
    }));

    console.log("[v0] GET /api/modules response:", {
      success: true,
      data: result,
    });
    return result;
  } catch (error) {
    console.log(
      "[v0] Database query failed, returning empty modules data:",
      error
    );
    return [];
  }
}

export async function updateRolePermissions(
  updates: RolePermissionUpdate[]
): Promise<boolean> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.log(
      "[v0] Database not connected, simulating role permission updates"
    );
    return true;
  }

  try {
    console.log("[v0] Updating role permissions in database:", updates);
    await ensureAllPermissionsExist();
    let updateCount = 0;
    await prisma.$transaction(
      async (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
        for (const update of updates) {
          console.log("[v0] Processing role permission update:", update);
          if (!update.roleId || !update.permissionId) {
            console.log(
              "[v0] Skipping invalid update: missing roleId or permissionId",
              update
            );
            continue;
          }
          const permissionExists = await tx.permission.findUnique({
            where: { id: update.permissionId },
          });
          if (!permissionExists) {
            console.log(
              `[v0] Permission ${update.permissionId} does not exist, skipping`
            );
            continue;
          }
          const roleExists = await tx.role.findUnique({
            where: { id: update.roleId },
          });
          if (!roleExists) {
            console.log(`[v0] Role ${update.roleId} does not exist, skipping`);
            continue;
          }
          let cleanModuleId: string | null = null;
          if (update.moduleId) {
            cleanModuleId = update.moduleId
              .replace("_self-perm", "")
              .replace("_self", "");
            const moduleExists = await tx.formModule.findUnique({
              where: { id: cleanModuleId },
            });
            if (!moduleExists) {
              console.log(
                `[v0] Module ${cleanModuleId} does not exist, skipping`
              );
              continue;
            }
          }
          await tx.rolePermission.upsert({
            where: {
              roleId_permissionId_moduleId: {
                roleId: update.roleId,
                permissionId: update.permissionId,
                moduleId: cleanModuleId ?? null,
              },
            },
            update: {
              granted: update.granted,
              canDelegate: update.canDelegate ?? false,
            },
            create: {
              roleId: update.roleId,
              permissionId: update.permissionId,
              moduleId: cleanModuleId ?? null,
              granted: update.granted,
              canDelegate: update.canDelegate ?? false,
            },
          });
          updateCount++;
          console.log(
            `[v0] Successfully processed role permission: roleId=${update.roleId}, permissionId=${update.permissionId}, moduleId=${cleanModuleId}`
          );
        }
      }
    );
    console.log(`[v0] Successfully updated ${updateCount} role permissions`);
    if (updateCount === 0) {
      throw new Error("No valid role permissions were updated");
    }
    return true;
  } catch (error) {
    console.error("[v0] Failed to update role permissions:", error);
    throw error;
  }
}

export async function updateUserPermissions(updates: UserPermissionUpdate[]): Promise<boolean> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.log(
      "[v0] Database not connected, simulating user permission updates"
    );
    return true;
  }

  try {
    console.log(
      "[v0] Updating user permissions in database:",
      JSON.stringify(updates, null, 2)
    );
    const validUpdates = updates.filter((update) => {
      if (!update.userId || !update.permissionId) {
        console.log(
          "[v0] Skipping invalid update: missing userId or permissionId",
          update
        );
        return false;
      }
      return true;
    });

    if (validUpdates.length === 0) {
      console.log(
        "[v0] No valid user permission updates provided, skipping database operations"
      );
      return true;
    }

    console.log(
      `[v0] Processing ${validUpdates.length} valid updates out of ${updates.length} total`
    );
    await ensureAllPermissionsExist();
    let updateCount = 0;

    await prisma.$transaction(
      async (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
        for (const update of validUpdates) {
          console.log(
            "[v0] Processing user permission update:",
            JSON.stringify(update, null, 2)
          );

          const userExists = await tx.user.findUnique({
            where: { id: update.userId },
          });

          if (!userExists) {
            console.log(`[v0] User ${update.userId} does not exist, skipping`);
            continue;
          }

          const permissionExists = await tx.permission.findUnique({
            where: { id: update.permissionId },
          });

          if (!permissionExists) {
            console.log(
              `[v0] Permission ${update.permissionId} does not exist, skipping`
            );
            continue;
          }

          let cleanModuleId: string | null = null;
          if (update.moduleId) {
            cleanModuleId = update.moduleId
              .replace("_self-perm", "")
              .replace("_self", "");
            const moduleExists = await tx.formModule.findUnique({
              where: { id: cleanModuleId },
            });

            if (!moduleExists) {
              console.log(
                `[v0] Module ${cleanModuleId} does not exist, skipping`
              );
              continue;
            }
          }

          await tx.userPermission.upsert({
            where: {
              userId_permissionId_moduleId: {
                userId: update.userId,
                permissionId: update.permissionId,
                moduleId: cleanModuleId ?? null,
              },
            },
            update: {
              granted: update.granted,
              reason: update.reason || "Manual assignment",
              grantedBy: update.grantedBy,
              expiresAt: update.expiresAt ?? null,
              isActive: update.isActive ?? true,
              updatedAt: new Date(),
            },
            create: {
              userId: update.userId,
              permissionId: update.permissionId,
              moduleId: cleanModuleId ?? null,
              granted: update.granted,
              reason: update.reason || "Manual assignment",
              grantedBy: update.grantedBy,
              grantedAt: new Date(),
              expiresAt: update.expiresAt ?? null,
              isActive: update.isActive ?? true,
            },
          });

          updateCount++;
          console.log(
            `[v0] Successfully processed user permission: userId=${update.userId}, permissionId=${update.permissionId}, moduleId=${cleanModuleId}`
          );
        }
      }
    );

    console.log(`[v0] Successfully updated ${updateCount} user permissions`);

    console.log("[v0] Verifying updates were saved to database...");
    const savedPermissions = await prisma.userPermission.findMany({
      where: {
        userId: { in: validUpdates.map((u) => u.userId) },
        permissionId: { in: validUpdates.map((u) => u.permissionId) },
      },
      select: {
        userId: true,
        permissionId: true,
        moduleId: true,
        granted: true,
        isActive: true,
      },
    });
    console.log(
      `[v0] Found ${savedPermissions.length} saved permissions in database:`,
      JSON.stringify(savedPermissions, null, 2)
    );

    if (updateCount === 0) {
      throw new Error("No valid user permissions were updated");
    }
    return true;
  } catch (error) {
    console.error("[v0] Failed to update user permissions:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (
      error instanceof Error &&
      error.message.includes("Can't reach database server")
    ) {
      console.log(
        "[v0] Database connection error, simulating user permission updates"
      );
      return true;
    }
    throw error;
  }
}

export async function getUserPermissions(p0: string | undefined): Promise<any[]> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.log(
      "[v0] Database not connected, returning empty user permissions data"
    );
    return [];
  }

  try {
    const userPermissions = await prisma.userPermission.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        permission: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            resource: true,
          },
        },
        module: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: [
        { user: { first_name: "asc" } },
        { permission: { name: "asc" } },
      ],
    });

    console.log(
      `[v0] Successfully retrieved ${userPermissions.length} user permissions`
    );

    return userPermissions.map((up: any) => ({
      userId: up.userId,
      permissionId: up.permissionId,
      moduleId: up.moduleId,
      granted: up.granted,
      reason: up.reason,
      grantedBy: up.grantedBy,
      grantedAt: up.grantedAt,
      expiresAt: up.expiresAt,
      isActive: up.isActive,
      user: up.user,
      permission: up.permission,
      module: up.module,
    }));
  } catch (error) {
    console.log(
      "[v0] Database query failed, returning empty user permissions data:",
      error
    );
    return [];
  }
}