import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Helper function to handle route values
const getRouteValue = (value: string) => {
  if (!value || !value.trim()) return null
  return value.trim()
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params before using
    const resolvedParams = await params
    const moduleId = Number.parseInt(resolvedParams.id)
    const body = await request.json()

    console.log("Update request for module ID:", moduleId)
    console.log("Update request body:", JSON.stringify(body, null, 2))

    // Handle simple status update
    if (body.status !== undefined && !body.name) {
      const module = await prisma.module.update({
        where: { id: moduleId },
        data: {
          status: body.status.toUpperCase(),
          lastUpdated: new Date(),
        },
      })
      return NextResponse.json({ module, message: "Module status updated" })
    }

    // Handle simple settings update
    if (body.settings && !body.name) {
      await prisma.moduleSettings.upsert({
        where: { moduleId },
        update: {
          autoApproval: body.settings.autoApproval,
          emailNotifications: body.settings.emailNotifications,
          integrationEnabled: body.settings.integrationEnabled,
        },
        create: {
          moduleId,
          autoApproval: body.settings.autoApproval || false,
          emailNotifications: body.settings.emailNotifications || true,
          integrationEnabled: body.settings.integrationEnabled || false,
        },
      })
      return NextResponse.json({ message: "Module settings updated" })
    }

    // COMPLETE MODULE UPDATE - This handles your edit functionality
    if (body.name) {
      console.log("Performing complete module update for module ID:", moduleId)

      const result = await prisma.$transaction(async (tx) => {
        // 1. Update module basic info
        const updatedModule = await tx.module.update({
          where: { id: moduleId },
          data: {
            moduleName: body.name.trim(),
            route: getRouteValue(body.description),
            icon: body.icon || "Package",
            lastUpdated: new Date(),
          },
        })
        console.log("Updated module basic info:", updatedModule)

        // 2. Update/Create settings
        if (body.settings) {
          const settingsData = {
            autoApproval: body.settings.autoApproval || false,
            emailNotifications:
              body.settings.emailNotifications !== undefined ? body.settings.emailNotifications : true,
            integrationEnabled: body.settings.integrationEnabled || false,
          }

          await tx.moduleSettings.upsert({
            where: { moduleId },
            update: settingsData,
            create: {
              moduleId,
              ...settingsData,
            },
          })
          console.log("Updated settings:", settingsData)
        }

        // 3. Update features - Complete replacement
        if (body.features !== undefined) {
          // Delete all existing features
          await tx.moduleFeature.deleteMany({
            where: { moduleId },
          })
          console.log("Deleted existing features")

          // Create new features
          if (body.features.length > 0) {
            const featureData = body.features.map((feature: string) => ({
              moduleId,
              featureName: feature.trim(),
              isEnabled: true,
            }))

            await tx.moduleFeature.createMany({
              data: featureData,
            })
            console.log("Created new features:", featureData)
          }
        }

        // 4. Update submodules - Complete replacement with proper handling
        if (body.submodules !== undefined) {
          console.log("Updating submodules:", body.submodules)

          // Delete all existing submodules
          await tx.submodule.deleteMany({
            where: { moduleId },
          })
          console.log("Deleted existing submodules")

          // Create new submodules
          if (body.submodules.length > 0) {
            const submoduleData = body.submodules.map((sub: any, index: number) => ({
              moduleId,
              submoduleName: sub.name.trim(),
              route: getRouteValue(sub.description),
              isEnabled: sub.isEnabled !== undefined ? sub.isEnabled : true,
              sortOrder: sub.sortOrder !== undefined ? sub.sortOrder : index,
            }))

            await tx.submodule.createMany({
              data: submoduleData,
            })
            console.log("Created new submodules:", submoduleData)
          }
        }

        // 5. Update dependencies - Complete replacement
        if (body.dependencies !== undefined) {
          // Delete existing dependencies
          await tx.moduleDependency.deleteMany({
            where: { moduleId },
          })
          console.log("Deleted existing dependencies")

          // Create new dependencies
          if (body.dependencies.length > 0) {
            const dependencyData = body.dependencies.map((depId: string) => ({
              moduleId,
              dependsOnId: Number.parseInt(depId),
              isRequired: true,
            }))

            await tx.moduleDependency.createMany({
              data: dependencyData,
            })
            console.log("Created new dependencies:", dependencyData)
          }
        }

        return updatedModule
      })

      console.log("Transaction completed successfully")
      return NextResponse.json({
        module: result,
        message: "Module updated successfully",
      })
    }

    return NextResponse.json({ error: "Invalid update request" }, { status: 400 })
  } catch (error) {
    console.error("Error updating module:", error)

    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      if (error.message.includes("Module_moduleName_key")) {
        return NextResponse.json({ error: "Module name already exists" }, { status: 400 })
      }
      if (error.message.includes("Module_route_key")) {
        return NextResponse.json({ error: "Module route already exists" }, { status: 400 })
      }
      if (error.message.includes("Submodule_route_key")) {
        return NextResponse.json({ error: "Submodule route already exists" }, { status: 400 })
      }
    }

    return NextResponse.json(
      {
        error: "Failed to update module",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params before using
    const resolvedParams = await params
    const moduleId = Number.parseInt(resolvedParams.id)

    // Check if module has dependencies
    const dependentModules = await prisma.moduleDependency.findMany({
      where: { dependsOnId: moduleId },
      include: { module: true },
    })

    if (dependentModules.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete module with dependencies",
          dependentModules: dependentModules.map((dep) => dep.module.moduleName),
        },
        { status: 400 },
      )
    }

    await prisma.module.delete({
      where: { id: moduleId },
    })

    return NextResponse.json({ message: "Module deleted successfully" })
  } catch (error) {
    console.error("Error deleting module:", error)
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 })
  }
}
