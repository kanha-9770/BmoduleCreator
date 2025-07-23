import { type NextRequest, NextResponse } from "next/server"
import { AuthMiddleware } from "@/lib/auth-middleware"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest) {
  try {
    console.log("[API] /api/auth/context - Getting user context")

    // Get authenticated user context using your existing middleware
    const authResult = await AuthMiddleware.getUserFromRequest(request)

    if (!authResult) {
      console.log("[API] /api/auth/context - No authentication found")
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { userId, userEmail } = authResult
    console.log(`[API] /api/auth/context - Getting context for user: ${userEmail}`)

    // Get complete user context using your existing service
    const userContext = await DatabaseService.getUserContext(userId)

    if (!userContext) {
      console.log("[API] /api/auth/context - User context not found")
      return NextResponse.json({ success: false, error: "User context not found" }, { status: 404 })
    }

    const { user, permissions, accessibleModules, accessibleForms } = userContext

    console.log(`[API] /api/auth/context - Context loaded:`, {
      user: user.email,
      permissionCount: permissions.length,
      moduleCount: accessibleModules.length,
      formCount: accessibleForms.length,
      isSystemAdmin: permissions.some((p) => p.isSystemAdmin),
    })

    return NextResponse.json({
      success: true,
      data: {
        user,
        permissions,
        accessibleModules,
        accessibleForms,
      },
      meta: {
        userId,
        userEmail,
        permissionCount: permissions.length,
        moduleCount: accessibleModules.length,
        formCount: accessibleForms.length,
        isSystemAdmin: permissions.some((p) => p.isSystemAdmin),
      },
    })
  } catch (error: any) {
    console.error("[API] /api/auth/context - Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get user context",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
