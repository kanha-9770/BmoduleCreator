import { DatabaseRoles } from "@/lib/DatabaseRoles"
import { NextRequest, NextResponse } from "next/server"

// GET /api/permissions - Get all permissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get("resourceType")
    const resourceId = searchParams.get("resourceId")

    const filters: any = {}
    if (resourceType) filters.resourceType = resourceType
    if (resourceId) filters.resourceId = resourceId

    const permissions = await DatabaseRoles.getPermissions(filters)
    
    return NextResponse.json({
      success: true,
      data: permissions
    })
  } catch (error: any) {
    console.error("Error fetching permissions:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch permissions"
      },
      { status: 500 }
    )
  }
}

// POST /api/permissions - Create a new permission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, resourceId, resourceType } = body

    if (!name || name.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Permission name is required"
        },
        { status: 400 }
      )
    }

    const permission = await DatabaseRoles.createPermission({
      name: name.trim(),
      description: description?.trim() || undefined,
      resourceId: resourceId?.trim() || undefined,
      resourceType: resourceType?.trim() || undefined
    })

    return NextResponse.json({
      success: true,
      data: permission
    })
  } catch (error: any) {
    console.error("Error creating permission:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create permission"
      },
      { status: 500 }
    )
  }
}