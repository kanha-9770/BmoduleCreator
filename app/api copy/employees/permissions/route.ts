import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all employees with their permissions
    const employees = await prisma.employee.findMany({
      include: {
        permissions: {
          include: {
            module: true,
            submodule: true,
          },
        },
      },
    })

    // Fetch all modules with submodules
    const modules = await prisma.module.findMany({
      include: {
        submodules: true,
      },
    })

    // Transform data to match the component structure
    const transformedEmployees = employees.map((employee) => {
      const permissions: any = {}

      // Initialize all modules and submodules with false permissions
      modules.forEach((module) => {
        const moduleKey = module.moduleName.toLowerCase().replace(/\s+/g, "_")
        permissions[moduleKey] = {}

        module.submodules.forEach((submodule) => {
          const submoduleKey = submodule.submoduleName.toLowerCase().replace(/\s+/g, "_")
          permissions[moduleKey][submoduleKey] = {
            view: false,
            add: false,
            edit: false,
            delete: false,
          }
        })
      })

      // Set actual permissions from database
      employee.permissions.forEach((permission) => {
        const moduleKey = permission.module.moduleName.toLowerCase().replace(/\s+/g, "_")

        if (permission.submodule) {
          const submoduleKey = permission.submodule.submoduleName.toLowerCase().replace(/\s+/g, "_")
          if (permissions[moduleKey] && permissions[moduleKey][submoduleKey]) {
            permissions[moduleKey][submoduleKey] = {
              view: permission.view,
              add: permission.create,
              edit: permission.edit,
              delete: permission.delete,
            }
          }
        } else {
          // Module-level permission - apply to all submodules
          Object.keys(permissions[moduleKey] || {}).forEach((submoduleKey) => {
            permissions[moduleKey][submoduleKey] = {
              view: permission.view,
              add: permission.create,
              edit: permission.edit,
              delete: permission.delete,
            }
          })
        }
      })

      return {
        id: employee.id,
        name: employee.employeeName,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        status: employee.status,
        permissions,
      }
    })

    return NextResponse.json({
      employees: transformedEmployees,
      modules: modules.map((module) => ({
        id: module.moduleName.toLowerCase().replace(/\s+/g, "_"),
        name: module.moduleName,
        description: `${module.moduleName} module operations`,
        subModules: module.submodules.map((sub) => ({
          id: sub.submoduleName.toLowerCase().replace(/\s+/g, "_"),
          name: sub.submoduleName.toUpperCase(),
        })),
      })),
    })
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch permissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { employeeId, moduleId, submoduleId, permissionType, value } = body

    console.log("Permission update request:", { employeeId, moduleId, submoduleId, permissionType, value })

    // Validate required fields
    if (!employeeId || !moduleId || !submoduleId || !permissionType || typeof value !== "boolean") {
      return NextResponse.json(
        {
          error: "Missing required fields",
          received: { employeeId, moduleId, submoduleId, permissionType, value },
        },
        { status: 400 },
      )
    }

    // Get all modules first
    const allModules = await prisma.module.findMany()

    // Find the module by comparing normalized names
    const targetModuleName = moduleId.replace(/_/g, " ").toLowerCase()
    const module = allModules.find((m) => m.moduleName.toLowerCase() === targetModuleName)

    if (!module) {
      console.log(
        "Module not found for:",
        moduleId,
        "Available modules:",
        allModules.map((m) => m.moduleName),
      )
      return NextResponse.json({ error: `Module not found: ${moduleId}` }, { status: 404 })
    }

    // Get all submodules for this module
    const allSubmodules = await prisma.submodule.findMany({
      where: { moduleId: module.id },
    })

    // Find the submodule by comparing normalized names
    const targetSubmoduleName = submoduleId.replace(/_/g, " ").toLowerCase()
    const submodule = allSubmodules.find((s) => s.submoduleName.toLowerCase() === targetSubmoduleName)

    if (!submodule) {
      console.log(
        "Submodule not found for:",
        submoduleId,
        "Available submodules:",
        allSubmodules.map((s) => s.submoduleName),
      )
      return NextResponse.json({ error: `Submodule not found: ${submoduleId}` }, { status: 404 })
    }

    // Find existing permission
    const existingPermission = await prisma.masterTable.findFirst({
      where: {
        employeeId,
        moduleId: module.id,
        submoduleId: submodule.id,
      },
    })

    // Prepare permission data
    const permissionData = {
      view: existingPermission?.view || false,
      create: existingPermission?.create || false,
      edit: existingPermission?.edit || false,
      delete: existingPermission?.delete || false,
    }

    // Map permissionType to database field
    const dbField = permissionType === "add" ? "create" : permissionType
    if (dbField in permissionData) {
      permissionData[dbField as keyof typeof permissionData] = value
    } else {
      return NextResponse.json({ error: `Invalid permission type: ${permissionType}` }, { status: 400 })
    }

    if (existingPermission) {
      // Update existing permission
      await prisma.masterTable.update({
        where: { id: existingPermission.id },
        data: permissionData,
      })
      console.log("Updated existing permission for employee:", employeeId)
    } else {
      // Create new permission
      await prisma.masterTable.create({
        data: {
          employeeId,
          moduleId: module.id,
          submoduleId: submodule.id,
          ...permissionData,
        },
      })
      console.log("Created new permission for employee:", employeeId)
    }

    return NextResponse.json({
      success: true,
      message: "Permission updated successfully",
      data: {
        employeeId,
        module: module.moduleName,
        submodule: submodule.submoduleName,
        permission: permissionType,
        value,
      },
    })
  } catch (error) {
    console.error("Error updating permission:", error)
    return NextResponse.json(
      {
        error: "Failed to update permission",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
