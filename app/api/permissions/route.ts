import { type NextRequest, NextResponse } from "next/server"
import { AuthMiddleware } from "@/lib/auth-middleware"
import { DatabaseRoles } from "@/lib/DatabaseRoles"

export async function GET(request: NextRequest) {
  try {
    console.log("[API] /api/users/permissions - Getting user permissions")

    // Get authenticated user context
    const authResult = await AuthMiddleware.getUserFromRequest(request)

    if (!authResult) {
      console.log("[API] /api/users/permissions - No authentication found")
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { userId, userEmail } = authResult
    console.log(`[API] /api/users/permissions - Getting permissions for user: ${userEmail}`)

    // Get user permissions with resource details using your existing service
    const permissions = await DatabaseRoles.getUserPermissionsWithResources(userId)

    console.log(`[API] /api/users/permissions - Found ${permissions.length} permissions`)

    return NextResponse.json({
      success: true,
      data: permissions,
      meta: {
        userId,
        userEmail,
        permissionCount: permissions.length,
        isSystemAdmin: permissions.some((p) => p.isSystemAdmin),
      },
    })
  } catch (error: any) {
    console.error("[API] /api/users/permissions - Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch user permissions",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
