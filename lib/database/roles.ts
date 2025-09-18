import { prisma } from "@/lib/prisma";
import type { Role, RoleFormData } from "@/types/role";

export async function getRolesByOrganization(
  organizationId: string
): Promise<Role[]> {
  try {
    const roles = await prisma.role.findMany({
      where: {
        organizationId,
      },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: {
                  include: {
                    children: true,
                  },
                },
              },
            },
          },
        },
        parent: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Build hierarchical structure
    const roleMap = new Map<string, Role>();
    const rootRoles: Role[] = [];

    // First pass: create all role objects
    roles.forEach((role) => {
      const roleObj: Role = {
        id: role.id,
        name: role.name,
        description: role.description || "",
        shareDataWithPeers: role.shareDataWithPeers,
        level: role.level,
        parentId: role.parentId || undefined,
        children: [],
      };
      roleMap.set(role.id, roleObj);
    });

    // Second pass: build hierarchy
    roles.forEach((role) => {
      const roleObj = roleMap.get(role.id)!;
      if (role.parentId) {
        const parent = roleMap.get(role.parentId);
        if (parent) {
          parent.children.push(roleObj);
        }
      } else {
        rootRoles.push(roleObj);
      }
    });

    return rootRoles;
  } catch (error) {
    console.error("Error fetching roles by organization:", error);
    throw new Error("Failed to fetch roles");
  }
}

export async function createRole(
  data: RoleFormData & { organizationId: string }
): Promise<Role> {
  try {
    // Calculate level based on parent
    let level = 0;
    if (data.parentId) {
      const parent = await prisma.role.findUnique({
        where: { id: data.parentId },
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        shareDataWithPeers: data.shareDataWithPeers,
        level,
        parentId: data.parentId,
        organizationId: data.organizationId,
      },
    });

    return {
      id: role.id,
      name: role.name,
      description: role.description || "",
      shareDataWithPeers: role.shareDataWithPeers,
      level: role.level,
      parentId: role.parentId || undefined,
      children: [],
    };
  } catch (error) {
    console.error("Error creating role:", error);
    throw new Error("Failed to create role");
  }
}

export async function updateRole(
  roleId: string,
  data: Partial<RoleFormData>
): Promise<Role> {
  try {
    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        name: data.name,
        description: data.description,
        shareDataWithPeers: data.shareDataWithPeers,
      },
    });

    return {
      id: role.id,
      name: role.name,
      description: role.description || "",
      shareDataWithPeers: role.shareDataWithPeers,
      level: role.level,
      parentId: role.parentId || undefined,
      children: [],
    };
  } catch (error) {
    console.error("Error updating role:", error);
    throw new Error("Failed to update role");
  }
}

export async function deleteRole(roleId: string): Promise<void> {
  try {
    // Delete all child roles recursively
    await prisma.role.deleteMany({
      where: {
        OR: [{ id: roleId }, { parentId: roleId }],
      },
    });
  } catch (error) {
    console.error("Error deleting role:", error);
    throw new Error("Failed to delete role");
  }
}
