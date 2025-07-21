import { NextRequest, NextResponse } from "next/server"
import { DatabaseRoles } from "@/lib/DatabaseRoles"

export async function GET(this: any, request: NextRequest) {
  try {
    // First try to get user from token (existing auth system)
    const authHeader = request.headers.get("authorization")
    let user = null
    console.log("[Permissions API] Fetching user permissions",authHeader);
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      // Validate token and get user info
      try {
        const userId = request.headers.get("x-user-id")
        const userEmail = request.headers.get("x-user-email")
        console.log(`[Permissions API] Validating token for user ${userEmail || "unknown"}`);
        if (userId && userEmail) {
          user = { userId, userEmail }
        } else {
          return NextResponse.json(
            { success: false, error: "Invalid token" },
            { status: 401 }
          )
        }
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Token validation failed" },
          { status: 401 }
        )
      }
    } else {
      // Try RBAC headers
      const userId = request.headers.get("x-user-id")
      const userEmail = request.headers.get("x-user-email")

      if (userId && userEmail) {
        user = { userId, userEmail }
      }
    }
    console.log(`[Permissions API] User ${user?.userEmail || "unknown"} fetching permissions`);

    if (!user || !user.userId || !user.userEmail) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get detailed user permissions
    const permissions = await DatabaseRoles.getUserPermissions(user.userId)

    // Get modules with submodules for permission matrix
    const modulesWithSubmodules = await DatabaseRoles.getModulesWithSubmodules()

    // Build permission matrix
    const permissionMatrix: Record<string, Record<string, any>> = {}

    for (const module of modulesWithSubmodules) {
      permissionMatrix[module.id] = {
        name: module.name,
        description: module.description,
        permissions: this.getAccessibleActions(permissions.map(p => p.name), module.id),
        subModules: {}
      }

      for (const subModule of module.subModules) {
        permissionMatrix[module.id].subModules[subModule.id] = {
          name: subModule.name,
          permissions: this.getAccessibleActions(permissions.map(p => p.name), module.id, subModule.id)
        }
      }
    }

    const userPermissions = permissions.map(p => p.name)
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.userId,
          email: user.userEmail,
        },
        permissions: permissions.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          resourceType: p.resourceType,
          resourceId: p.resourceId
        })),
        permissionMatrix,
        systemPermissions: {
          isAdmin: userPermissions.includes("system:admin"),
          canManageUsers: userPermissions.includes("system:user_management"),
          canManageRoles: userPermissions.includes("system:role_management"),
          canManagePermissions: userPermissions.includes("system:permission_management")
        }
      }
    })
  } catch (error: any) {
    console.error("Error fetching user permissions:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch user permissions"
      },
      { status: 500 }
    )
  }
}

// Helper function to get accessible actions
function getAccessibleActions(
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
      canView: canManage || userPermissions.includes(`${moduleId}:${formId}:view`),
      canAdd: canManage || userPermissions.includes(`${moduleId}:${formId}:add`),
      canEdit: canManage || userPermissions.includes(`${moduleId}:${formId}:edit`),
      canDelete: canManage || userPermissions.includes(`${moduleId}:${formId}:delete`),
      canManage
    }
  } else {
    // Module-level permissions
    return {
      canView: canManage || userPermissions.includes(`${moduleId}:view`),
      canAdd: canManage,
      canEdit: canManage,
      canDelete: canManage,
      canManage
    }
  }
}