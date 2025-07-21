import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { DatabaseService } from "@/lib/database-service"
import { AuthMiddleware } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    // Get user authentication context
    const user = await AuthMiddleware.getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    console.log(`[Modules API] User ${user.userEmail} requesting modules with ${user.permissions.length} permissions`)

    const modules = await DatabaseService.getModuleHierarchy()
    
    // Filter modules based on user permissions
    const filteredModules = AuthMiddleware.filterModulesByPermissions(modules, user.permissions)
    
    console.log(`[Modules API] Returning ${filteredModules.length} accessible modules`)
    
    return NextResponse.json({ 
      success: true, 
      data: filteredModules,
      user: {
        id: user.userId,
        email: user.userEmail,
        role: user.roleName
      }
    })
  } catch (error: any) {
    console.error("Error fetching modules:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user has permission to create modules
    const user = await AuthMiddleware.getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check for system admin or module management permissions
    const canCreateModules = user.permissions.includes("system:admin") || 
                           user.permissions.includes("system:module_management")
    
    if (!canCreateModules) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions to create modules" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, parentId, moduleType, icon, color } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })
    }

    // If creating a child module, check parent module permissions
    if (parentId) {
      const hasParentPermission = AuthMiddleware.hasModulePermission(user.permissions, parentId, "manage")
      if (!hasParentPermission && !user.permissions.includes("system:admin")) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions to create submodules in this module" },
          { status: 403 }
        )
      }
    }

    const module = await DatabaseService.createModule({ 
      name, 
      description, 
      parentId, 
      moduleType, 
      icon, 
      color 
    })
    
    console.log(`[Modules API] User ${user.userEmail} created module: ${module.name}`)
    
    return NextResponse.json({ success: true, data: module })
  } catch (error: any) {
    console.error("Error creating module:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}