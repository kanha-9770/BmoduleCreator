import { DatabaseRoles } from "@/lib/DatabaseRoles"
import { NextRequest, NextResponse } from "next/server"

// GET /api/employees/permissions - Get all employees with their permissions
export async function GET(request: NextRequest) {
  try {
    console.log("[API] Getting employees with permissions")

    const [employees, modules] = await Promise.all([
      DatabaseRoles.getEmployeesWithPermissions(),
      DatabaseRoles.getModulesWithSubmodules()
    ])

    return NextResponse.json({
      success: true,
      employees,
      modules
    })
  } catch (error: any) {
    console.error("Error fetching employees with permissions:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch employees with permissions"
      },
      { status: 500 }
    )
  }
}

// POST /api/employees/permissions - Update employee permission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, moduleId, submoduleId, permissionType, value } = body

    console.log("[API] Updating employee permission:", {
      employeeId,
      moduleId,
      submoduleId,
      permissionType,
      value
    })

    if (!employeeId || !moduleId || !submoduleId || !permissionType || typeof value !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: employeeId, moduleId, submoduleId, permissionType, value"
        },
        { status: 400 }
      )
    }

    await DatabaseRoles.updateEmployeePermission(
      employeeId,
      moduleId,
      submoduleId,
      permissionType,
      value
    )

    return NextResponse.json({
      success: true,
      message: "Permission updated successfully"
    })
  } catch (error: any) {
    console.error("Error updating employee permission:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update employee permission"
      },
      { status: 500 }
    )
  }
}