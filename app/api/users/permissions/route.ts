import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { DatabaseRoles } from "@/lib/DatabaseRoles"

export async function GET(request: NextRequest) {
  try {
    console.log("[API] Validating JWT token and loading user permissions")
    
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[API] No Bearer token provided")
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log("[API] Token received, verifying...")
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
      console.log("[API] JWT decoded successfully:", { userId: decoded.userId, email: decoded.email })
      
      // Get fresh user data to ensure user still exists
      try {
        const userRecord = await DatabaseRoles.getUserById(decoded.userId)
        if (!userRecord) {
          console.log("[API] User not found in database:", decoded.userId)
          return NextResponse.json(
            { success: false, error: "User not found" },
            { status: 401 }
          )
        }

        const recordData = userRecord.recordData as any
        console.log("[API] User validation successful")
        
        // Get detailed user permissions
        const userPermissions = await DatabaseRoles.getUserPermissionsWithResources(decoded.userId)
        console.log(`[API] Found ${userPermissions.length} permissions for user ${decoded.email}`)

        // Transform permissions into the format expected by frontend
        const permissionMatrix: any = {}
        const permissionsList: string[] = []
        
        // Build permission matrix and list
        for (const perm of userPermissions) {
          // Add null check for permissions object
          const permissions = perm.permissions || {
            canView: false,
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canManage: false
          }

          if (perm.resourceType === 'module') {
            const moduleId = perm.resourceId
            if (!permissionMatrix[moduleId]) {
              permissionMatrix[moduleId] = {
                permissions: {
                  canView: false,
                  canAdd: false,
                  canEdit: false,
                  canDelete: false,
                  canManage: false
                },
                subModules: {}
              }
            }
            
            permissionMatrix[moduleId].permissions = {
              canView: permissions.canView,
              canAdd: permissions.canCreate,
              canEdit: permissions.canEdit,
              canDelete: permissions.canDelete,
              canManage: permissions.canManage
            }
            
            // Add to permissions list
            if (permissions.canView) permissionsList.push(`${moduleId}:view`)
            if (permissions.canCreate) permissionsList.push(`${moduleId}:create`)
            if (permissions.canEdit) permissionsList.push(`${moduleId}:edit`)
            if (permissions.canDelete) permissionsList.push(`${moduleId}:delete`)
            if (permissions.canManage) permissionsList.push(`${moduleId}:manage`)
            
          } else if (perm.resourceType === 'form' && perm.resource) {
            const form = perm.resource as any
            const moduleId = form.moduleId
            const formId = perm.resourceId
            
            if (!permissionMatrix[moduleId]) {
              permissionMatrix[moduleId] = {
                permissions: {
                  canView: false,
                  canAdd: false,
                  canEdit: false,
                  canDelete: false,
                  canManage: false
                },
                subModules: {}
              }
            }
            
            permissionMatrix[moduleId].subModules[formId] = {
              permissions: {
                canView: permissions.canView,
                canAdd: permissions.canCreate,
                canEdit: permissions.canEdit,
                canDelete: permissions.canDelete,
                canManage: permissions.canManage
              }
            }
            
            // Add to permissions list
            if (permissions.canView) permissionsList.push(`${moduleId}:${formId}:view`)
            if (permissions.canCreate) permissionsList.push(`${moduleId}:${formId}:create`)
            if (permissions.canEdit) permissionsList.push(`${moduleId}:${formId}:edit`)
            if (permissions.canDelete) permissionsList.push(`${moduleId}:${formId}:delete`)
            if (permissions.canManage) permissionsList.push(`${moduleId}:${formId}:manage`)
          }
        }

        // Check for system admin
        const hasSystemAdmin = userPermissions.some(p => p.isSystemAdmin)
        
        const systemPermissions = {
          isAdmin: hasSystemAdmin,
          canManageUsers: hasSystemAdmin,
          canManageRoles: hasSystemAdmin,
          canManagePermissions: hasSystemAdmin
        }

        return NextResponse.json({
          success: true,
          data: {
            user: {
              id: decoded.userId,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role,
              roleId: recordData?.roleId,
              roleName: recordData?.roleName
            },
            permissions: permissionsList,
            permissionMatrix: permissionMatrix,
            systemPermissions: systemPermissions,
            rawPermissions: userPermissions
          },
          debug: {
            hasSystemAdmin: hasSystemAdmin,
            modulePermissions: userPermissions.filter(p => p.resourceType === 'module').length,
            formPermissions: userPermissions.filter(p => p.resourceType === 'form').length,
            totalPermissions: permissionsList.length
          }
        })
      } catch (dbError) {
        console.error("[API] Database error during user validation:", dbError)
        // Return success with decoded data even if DB check fails
        return NextResponse.json({
          success: true,
          user: {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role
          }
        })
      }
    } catch (jwtError) {
      console.error("[API] JWT verification failed:", jwtError)
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error("[API] Token validation error:", error)
    return NextResponse.json(
      { success: false, error: "Token validation failed" },
      { status: 500 }
    )
  }
}

// POST /api/users/permissions - Update user permissions (admin only)
export async function POST(request: NextRequest) {
  try {
    console.log("[API] Updating user permissions")
    
    // STRICT AUTHENTICATION CHECK
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required"
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
      
      // Get user permissions to check if they can manage permissions
      const userPermissions = await DatabaseRoles.getUserPermissionsWithResources(decoded.userId)
      
      // CHECK IF USER HAS ADMIN PERMISSIONS
      const hasSystemAdmin = userPermissions.some(perm => perm.isSystemAdmin)
      const hasUserManagePermission = userPermissions.some(perm => 
        perm.resourceType === 'module' && (perm.permissions?.canManage || false)
      )
      
      if (!hasSystemAdmin && !hasUserManagePermission) {
        return NextResponse.json(
          {
            success: false,
            error: "Insufficient permissions to update user permissions"
          },
          { status: 403 }
        )
      }

      const body = await request.json()
      const { userId, permissionName, value } = body

      if (!userId || !permissionName || typeof value !== 'boolean') {
        return NextResponse.json(
          {
            success: false,
            error: "Missing required fields: userId, permissionName, value"
          },
          { status: 400 }
        )
      }

      // Update user permission
      await DatabaseRoles.updateUserPermission(userId, permissionName, value)

      console.log(`[API] User ${decoded.email} updated permission ${permissionName} for user ${userId}`)

      return NextResponse.json({
        success: true,
        message: "Permission updated successfully"
      })
    } catch (jwtError) {
      console.error("[API] JWT verification failed:", jwtError)
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error("Error updating user permission:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update user permission"
      },
      { status: 500 }
    )
  }
}