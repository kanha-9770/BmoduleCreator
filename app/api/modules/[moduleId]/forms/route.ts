import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { DatabaseService } from "@/lib/database-service"
import { withAuth, AuthContext, AuthMiddleware } from "@/lib/auth-middleware"

export const POST = withAuth(async (
  request: NextRequest & { user?: any; authContext?: AuthContext },
  { params }: { params: { moduleId: string } }
) => {
  try {
    // The user and authContext are now available on the request object
    const { user, authContext } = request;

    if (!user || !authContext) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user has permission to create forms in this module
    const authResult = await AuthMiddleware.checkPermission(
      request,
      "module",
      params.moduleId,
      "create"
    )

    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.user ? 403 : 401 }
      )
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })
    }

    const form = await DatabaseService.createForm({
      moduleId: params.moduleId,
      name,
      description,
    })

    console.log(`[Forms API] User ${authContext.userEmail} created form: ${name} in module: ${params.moduleId}`)

    return NextResponse.json({ success: true, data: form })
  } catch (error: any) {
    console.error("Error creating form:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
})