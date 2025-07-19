import { DatabaseRoles } from "@/lib/DatabaseRoles"
import { NextRequest, NextResponse } from "next/server"

// POST /api/users/[id]/role - Assign role to user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { roleId } = body

    if (!roleId) {
      return NextResponse.json(
        {
          success: false,
          error: "Role ID is required"
        },
        { status: 400 }
      )
    }

    await DatabaseRoles.assignRoleToUser(params.id, roleId)

    return NextResponse.json({
      success: true,
      message: "Role assigned successfully"
    })
  } catch (error: any) {
    console.error("Error assigning role to user:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to assign role"
      },
      { status: 500 }
    )
  }
}