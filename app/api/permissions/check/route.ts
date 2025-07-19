import { DatabaseRoles } from "@/lib/DatabaseRoles"
import { NextRequest, NextResponse } from "next/server"

// POST /api/permissions/check - Check user permission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, permission, resourceId } = body

    if (!userId || !permission) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and permission are required"
        },
        { status: 400 }
      )
    }

    const hasPermission = await DatabaseRoles.checkUserPermission(
      userId,
      permission,
      resourceId
    )

    return NextResponse.json({
      success: true,
      data: { hasPermission }
    })
  } catch (error: any) {
    console.error("Error checking permission:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to check permission"
      },
      { status: 500 }
    )
  }
}