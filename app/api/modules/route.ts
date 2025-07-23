import { type NextRequest, NextResponse } from "next/server"
import { AuthMiddleware } from "@/lib/auth-middleware"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest) {
  try {
    console.log("[API] /api/modules - Getting modules with permission filtering")

    // Get authenticated user context
    const authResult = await AuthMiddleware.getUserFromRequest(request)

    if (!authResult) {
      console.log("[API] /api/modules - No authentication found")
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { userId, userEmail, permissions } = authResult
    console.log(`[API] /api/modules - Authenticated user: ${userEmail} with ${permissions.length} permissions`)

    // Get modules filtered by user permissions using your existing service
    const modules = await DatabaseService.getModuleHierarchy(permissions)

    console.log(`[API] /api/modules - Returning ${modules.length} accessible modules`)

    return NextResponse.json({
      success: true,
      data: modules,
      meta: {
        userId,
        userEmail,
        permissionCount: permissions.length,
        moduleCount: modules.length,
      },
    })
  } catch (error: any) {
    console.error("[API] /api/modules - Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch modules",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
