import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { DatabaseService } from "@/lib/database-service"
import { AuthMiddleware } from "@/lib/auth-middleware"

export async function POST(request: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    // Check user permissions for creating forms in this module
    const authResult = await AuthMiddleware.checkPermission(
      request,
      "module",
      params.moduleId,
      "manage"
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

    console.log(`[Forms API] User ${authResult.user!.userEmail} created form: ${name} in module: ${params.moduleId}`)

    return NextResponse.json({ success: true, data: form })
  } catch (error: any) {
    console.error("Error creating form:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}