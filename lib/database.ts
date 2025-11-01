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
  forms?: DatabaseForm[];
}

export interface DatabaseForm {
  id: string;
  name: string;
  description?: string;
  moduleId: string;
  isPublished: boolean;
  isEmployeeForm?: boolean;
  isUserForm?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissionUpdate {
  roleId: string;
  permissionId: string;
  moduleId?: string;

  formId?: string;
  granted: boolean;
  canDelegate?: boolean;
}

export interface UserPermissionUpdate {
  userId: string;
  permissionId: string;
  moduleId?: string;

  formId?: string;
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
      { id: "1", name: "VIEW", category: "READ", resource: "form" },
      { id: "2", name: "CREATE", category: "WRITE", resource: "form" },
      { id: "3", name: "EDIT", category: "WRITE", resource: "form" },
      { id: "4", name: "DELETE", category: "DELETE", resource: "form" },
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
    await ensureStandardPermissionsExist();

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

export async function getRolePermissions(
  p0: string | undefined
): Promise<any[]> {
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
      formId: rp.formId,
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
      formId: override.formId || null,
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

export async function getModulesWithForms(): Promise<any[]> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.log("[v0] Database not connected, returning empty modules data");
    return [];
  }

  try {
    console.log("[v0] Fetching modules with forms from database...");
    const modules = await prisma.formModule.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          include: {
            forms: {
              select: {
                id: true,
                name: true,
                description: true,
                isEmployeeForm: true,
                isUserForm: true,
                moduleId: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        forms: {
          select: {
            id: true,
            name: true,
            description: true,
            isEmployeeForm: true,
            isUserForm: true,
            moduleId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
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
      forms: module.forms || [],
      children: module.children.map((child: any) => ({
        id: child.id,
        name: child.name,
        description: child.description,
        icon: child.icon,
        color: child.color,
        parentId: module.id,
        level: child.level,
        forms: child.forms || [],
      })),
    }));

    // Log form counts for debugging
    result.forEach((module) => {
      console.log(`[v0] Module ${module.name}: ${module.forms.length} forms`);
      module.children.forEach((child: any) => {
        console.log(
          `[v0] Submodule ${child.name}: ${child.forms.length} forms`
        );
      });
    });

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

export async function getModules(): Promise<any[]> {
  return await getModulesWithForms();
}

export async function updateRolePermissions(
  updates: RolePermissionUpdate[]
): Promise<boolean> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) return true;

  try {
    await ensureStandardPermissionsExist();

    // 1. BATCH LOAD ALL DATA
    const [roles, permissions, forms, modules] = await Promise.all([
      prisma.role.findMany({ select: { id: true } }),
      prisma.permission.findMany({ select: { id: true } }),
      prisma.form.findMany({ select: { id: true, moduleId: true } }),
      prisma.formModule.findMany({ select: { id: true } }),
    ]);

    const roleSet = new Set(roles.map((r) => r.id));
    const permSet = new Set(permissions.map((p) => p.id));
    const formModuleMap = new Map(forms.map((f) => [f.id, f.moduleId]));
    const moduleSet = new Set(modules.map((m) => m.id));

    // 2. PRE-VALIDATE ALL UPDATES
    const validUpdates: {
      roleId: string;
      permissionId: string;
      moduleId: string | null;
      formId: string | null;
      granted: boolean;
      canDelegate: boolean;
    }[] = [];

    for (const u of updates) {
      if (!u.roleId || !u.permissionId) continue;
      if (!roleSet.has(u.roleId)) continue;
      if (!permSet.has(u.permissionId)) continue;

      let moduleId: string | null = null;
      let formId: string | null = null;

      if (u.formId) {
        formId = u.formId;
        moduleId = formModuleMap.get(u.formId) || null;
        if (!moduleId) continue;
      } else if (u.moduleId) {
        const cleanId = u.moduleId.replace(/_self-perm$|_self$/, "");
        if (!moduleSet.has(cleanId)) continue;
        moduleId = cleanId;
      } else {
        continue;
      }

      validUpdates.push({
        roleId: u.roleId,
        permissionId: u.permissionId,
        moduleId,
        formId,
        granted: u.granted,
        canDelegate: u.canDelegate ?? false,
      });
    }

    if (validUpdates.length === 0) return true;

    // 3. ONE TRANSACTION, NO AWAITS IN LOOP
    await prisma.$transaction(
      async (tx) => {
        for (const u of validUpdates) {
          await tx.rolePermission.upsert({
            where: {
              roleId_permissionId_moduleId_formId: {
                roleId: u.roleId,
                permissionId: u.permissionId,
                moduleId: u.moduleId,
                formId: u.formId,
              },
            },
            update: {
              granted: u.granted,
              canDelegate: u.canDelegate,
            },
            create: {
              roleId: u.roleId,
              permissionId: u.permissionId,
              moduleId: u.moduleId,
              formId: u.formId,
              granted: u.granted,
              canDelegate: u.canDelegate,
            },
          });
        }
      },
      { timeout: 30000 }
    ); // 30s

    console.log(`[v0] Updated ${validUpdates.length} role permissions`);
    return true;
  } catch (error) {
    console.error("[v0] Failed to update role permissions:", error);
    throw error;
  }
}
export async function updateUserPermissions(
  updates: UserPermissionUpdate[]
): Promise<boolean> {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) return true;

  try {
    await ensureStandardPermissionsExist();

    const [users, permissions, forms, modules] = await Promise.all([
      prisma.user.findMany({ select: { id: true } }),
      prisma.permission.findMany({ select: { id: true } }),
      prisma.form.findMany({ select: { id: true, moduleId: true } }),
      prisma.formModule.findMany({ select: { id: true } }),
    ]);

    const userSet = new Set(users.map((u) => u.id));
    const permSet = new Set(permissions.map((p) => p.id));
    const formModuleMap = new Map(forms.map((f) => [f.id, f.moduleId]));
    const moduleSet = new Set(modules.map((m) => m.id));

    const validUpdates: any[] = [];

    for (const u of updates) {
      if (!u.userId || !u.permissionId) continue;
      if (!userSet.has(u.userId)) continue;
      if (!permSet.has(u.permissionId)) continue;

      let moduleId: string | null = null;
      let formId: string | null = null;

      if (u.formId) {
        formId = u.formId;
        moduleId = formModuleMap.get(u.formId) || null;
        if (!moduleId) continue;
      } else if (u.moduleId) {
        const cleanId = u.moduleId.replace(/_self-perm$|_self$/, "");
        if (!moduleSet.has(cleanId)) continue;
        moduleId = cleanId;
      } else {
        continue;
      }

      validUpdates.push({ ...u, moduleId, formId });
    }

    if (validUpdates.length === 0) return true;

    await prisma.$transaction(
      async (tx) => {
        for (const u of validUpdates) {
          await tx.userPermission.upsert({
            where: {
              unique_user_permission: {
                userId: u.userId,
                permissionId: u.permissionId,
                moduleId: u.moduleId,
                formId: u.formId,
              },
            },
            update: {
              granted: u.granted,
              reason: u.reason ?? "Manual override",
              grantedBy: u.grantedBy ?? null,
              expiresAt: u.expiresAt ?? null,
              isActive: u.isActive ?? true,
            },
            create: {
              userId: u.userId,
              permissionId: u.permissionId,
              moduleId: u.moduleId,
              formId: u.formId,
              granted: u.granted,
              reason: u.reason ?? "Manual override",
              grantedBy: u.grantedBy ?? null,
              grantedAt: new Date(),
              expiresAt: u.expiresAt ?? null,
              isActive: u.isActive ?? true,
            },
          });
        }
      },
      { timeout: 30000 }
    );

    console.log(`[v0] Updated ${validUpdates.length} user permissions`);
    return true;
  } catch (error) {
    console.error("[v0] Failed to update user permissions:", error);
    throw error;
  }
}

export async function getUserPermissions(
  p0: string | undefined
): Promise<any[]> {
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
      formId: up.formId,
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
