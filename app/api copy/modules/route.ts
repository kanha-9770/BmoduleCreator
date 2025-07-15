  // import { NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"

// export async function POST() {
//   try {
//     // Create default modules and submodules
//     const modules = [
//       {
//         name: "IT",
//         submodules: ["System Administration", "Network Management", "Software Development"],
//       },
//       {
//         name: "Sales",
//         submodules: ["Lead Management", "Customer Relations", "Sales Reports"],
//       },
//       {
//         name: "Production",
//         submodules: ["Manufacturing", "Quality Control", "Inventory Management"],
//       },
//       {
//         name: "HR",
//         submodules: ["Employee Management", "Recruitment", "Payroll"],
//       },
//       {
//         name: "Purchase",
//         submodules: ["Vendor Management", "Purchase Orders", "Procurement"],
//       },
//       {
//         name: "Finance",
//         submodules: ["Accounting", "Budget Planning", "Financial Reports"],
//       },
//     ]

//     for (const moduleData of modules) {
//       const module = await prisma.module.upsert({
//         where: { moduleName: moduleData.name },
//         update: {},
//         create: { moduleName: moduleData.name },
//       })

//       for (const submoduleName of moduleData.submodules) {
//         await prisma.submodule.upsert({
//           where: {
//             moduleId_submoduleName: {
//               moduleId: module.id,
//               submoduleName: submoduleName,
//             },
//           },
//           update: {},
//           create: {
//             moduleId: module.id,
//             submoduleName: submoduleName,
//           },
//         })
//       }
//     }

//     return NextResponse.json({ message: "Modules seeded successfully" })
//   } catch (error) {
//     console.error("Error seeding modules:", error)
//     return NextResponse.json({ error: "Failed to seed modules" }, { status: 500 })
//   }
// }
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Helper function to handle route values
const getRouteValue = (value: string) => {
  if (!value || !value.trim()) return null
  return value.trim()
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const modules = await prisma.module.findMany({
      include: {
        submodules: true,
        settings: true,
        features: true,
        dependencies: {
          include: {
            dependsOn: true,
          },
        },
        moduleAccess: {
          include: {
            employee: true,
          },
        },
        _count: {
          select: {
            permissions: true,
            moduleAccess: true,
          },
        },
      },
    })

    const transformedModules = modules.map((module) => ({
      id: module.id.toString(),
      name: module.moduleName,
      description: module.route || "",
      icon: module.icon || "Package",
      status: module.status.toLowerCase(),
      users: module._count.moduleAccess,
      permissions: module._count.permissions,
      lastUpdated: module.lastUpdated.toISOString().split("T")[0],
      dependencies: module.dependencies.map((dep) => dep.dependsOn.id.toString()),
      features: module.features.map((feature) => feature.featureName),
      settings: {
        autoApproval: module.settings?.autoApproval || false,
        emailNotifications: module.settings?.emailNotifications || true,
        integrationEnabled: module.settings?.integrationEnabled || false,
      },
      submodules: module.submodules.map((sub) => ({
        id: sub.id.toString(),
        name: sub.submoduleName,
        description: sub.route || "",
        isEnabled: sub.isEnabled,
        sortOrder: sub.sortOrder,
      })),
    }))

    return NextResponse.json({ modules: transformedModules })
  } catch (error) {
    console.error("Error fetching modules:", error)
    return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, icon, features, submodules, dependencies, settings } = await request.json()

    // Create module with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the module
      const module = await tx.module.create({
        data: {
          moduleName: name,
          route: getRouteValue(description),
          icon: icon || "Package",
        },
      })

      // Create module settings
      await tx.moduleSettings.create({
        data: {
          moduleId: module.id,
          autoApproval: settings?.autoApproval || false,
          emailNotifications: settings?.emailNotifications || true,
          integrationEnabled: settings?.integrationEnabled || false,
        },
      })

      // Create features
      if (features && features.length > 0) {
        await tx.moduleFeature.createMany({
          data: features.map((feature: string) => ({
            moduleId: module.id,
            featureName: feature,
            isEnabled: true,
          })),
        })
      }

      // Create submodules
      if (submodules && submodules.length > 0) {
        await tx.submodule.createMany({
          data: submodules.map((sub: any, index: number) => ({
            moduleId: module.id,
            submoduleName: sub.name,
            route: getRouteValue(sub.description),
            sortOrder: index,
          })),
        })
      }

      // Create dependencies
      if (dependencies && dependencies.length > 0) {
        await tx.moduleDependency.createMany({
          data: dependencies.map((depId: string) => ({
            moduleId: module.id,
            dependsOnId: Number.parseInt(depId),
          })),
        })
      }

      return module
    })

    return NextResponse.json({ module: result, message: "Module created successfully" })
  } catch (error) {
    console.error("Error creating module:", error)

    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      if (error.message.includes("Module_moduleName_key")) {
        return NextResponse.json({ error: "Module name already exists" }, { status: 400 })
      }
      if (error.message.includes("Module_route_key")) {
        return NextResponse.json({ error: "Module route already exists" }, { status: 400 })
      }
    }

    return NextResponse.json({ error: "Failed to create module" }, { status: 500 })
  }
}
