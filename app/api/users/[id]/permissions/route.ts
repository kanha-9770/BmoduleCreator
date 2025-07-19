import { DatabaseRoles } from "@/lib/DatabaseRoles"
import { NextRequest, NextResponse } from "next/server"

// GET /api/users/[id]/permissions - Get user permissions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permissions = await DatabaseRoles.getUserPermissions(params.id)

    return NextResponse.json({
      success: true,
      data: permissions
    })
  } catch (error: any) {
    console.error("Error fetching user permissions:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch user permissions"
      },
      { status: 500 }
    )
  }
}