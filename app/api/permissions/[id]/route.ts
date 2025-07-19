import { DatabaseRoles } from "@/lib/DatabaseRoles"
import { NextRequest, NextResponse } from "next/server"

// GET /api/permissions/[id] - Get a specific permission
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permission = await DatabaseRoles.getPermission(params.id)
    
    if (!permission) {
      return NextResponse.json(
        {
          success: false,
          error: "Permission not found"
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: permission
    })
  } catch (error: any) {
    console.error("Error fetching permission:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch permission"
      },
      { status: 500 }
    )
  }
}

// PUT /api/permissions/[id] - Update a permission
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, resourceId, resourceType } = body

    const permission = await DatabaseRoles.updatePermission(params.id, {
      name: name?.trim(),
      description: description?.trim(),
      resourceId: resourceId?.trim() || undefined,
      resourceType: resourceType?.trim() || undefined
    })

    return NextResponse.json({
      success: true,
      data: permission
    })
  } catch (error: any) {
    console.error("Error updating permission:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update permission"
      },
      { status: 500 }
    )
  }
}

// DELETE /api/permissions/[id] - Delete a permission
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await DatabaseRoles.deletePermission(params.id)

    return NextResponse.json({
      success: true,
      message: "Permission deleted successfully"
    })
  } catch (error: any) {
    console.error("Error deleting permission:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete permission"
      },
      { status: 500 }
    )
  }
}