import { DatabaseRoles } from "@/lib/DatabaseRoles"
import { NextRequest, NextResponse } from "next/server"

// GET /api/roles/[id] - Get a specific role
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const role = await DatabaseRoles.getRole(params.id)
    
    if (!role) {
      return NextResponse.json(
        {
          success: false,
          error: "Role not found"
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: role
    })
  } catch (error: any) {
    console.error("Error fetching role:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch role"
      },
      { status: 500 }
    )
  }
}

// PUT /api/roles/[id] - Update a role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, permissions } = body

    const role = await DatabaseRoles.updateRole(params.id, {
      name: name?.trim(),
      description: description?.trim(),
      permissions
    })

    return NextResponse.json({
      success: true,
      data: role
    })
  } catch (error: any) {
    console.error("Error updating role:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update role"
      },
      { status: 500 }
    )
  }
}

// DELETE /api/roles/[id] - Delete a role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await DatabaseRoles.deleteRole(params.id)

    return NextResponse.json({
      success: true,
      message: "Role deleted successfully"
    })
  } catch (error: any) {
    console.error("Error deleting role:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete role"
      },
      { status: 500 }
    )
  }
}