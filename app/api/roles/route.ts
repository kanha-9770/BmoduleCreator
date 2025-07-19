import { DatabaseRoles } from "@/lib/DatabaseRoles"
import { NextRequest, NextResponse } from "next/server"

// GET /api/roles - Get all roles
export async function GET(request: NextRequest) {
  try {
    const roles = await DatabaseRoles.getRoles()
    
    return NextResponse.json({
      success: true,
      data: roles
    })
  } catch (error: any) {
    console.error("Error fetching roles:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch roles"
      },
      { status: 500 }
    )
  }
}

// POST /api/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, permissions } = body

    if (!name || name.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Role name is required"
        },
        { status: 400 }
      )
    }

    const role = await DatabaseRoles.createRole({
      name: name.trim(),
      description: description?.trim() || undefined,
      permissions: permissions || []
    })

    return NextResponse.json({
      success: true,
      data: role
    })
  } catch (error: any) {
    console.error("Error creating role:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create role"
      },
      { status: 500 }
    )
  }
}