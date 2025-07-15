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

    const modules = await prisma.module.findMany({
      include: {
        dependencies: {
          include: {
            dependsOn: true,
          },
        },
        dependentModules: {
          include: {
            module: true,
          },
        },
      },
    })

    const dependencyMap = modules.map((module) => ({
      id: module.id,
      name: module.moduleName,
      status: module.status.toLowerCase(),
      dependencies: module.dependencies.map((dep) => ({
        id: dep.dependsOn.id,
        name: dep.dependsOn.moduleName,
        status: dep.dependsOn.status.toLowerCase(),
        isRequired: dep.isRequired,
      })),
      dependentModules: module.dependentModules.map((dep) => ({
        id: dep.module.id,
        name: dep.module.moduleName,
        status: dep.module.status.toLowerCase(),
      })),
    }))

    return NextResponse.json({ dependencies: dependencyMap })
  } catch (error) {
    console.error("Error fetching dependencies:", error)
    return NextResponse.json({ error: "Failed to fetch dependencies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { moduleId, dependsOnId, isRequired = true } = await request.json()

    // Check for circular dependencies
    const existingDep = await prisma.moduleDependency.findFirst({
      where: {
        moduleId: dependsOnId,
        dependsOnId: moduleId,
      },
    })

    if (existingDep) {
      return NextResponse.json({ error: "Circular dependency detected" }, { status: 400 })
    }

    const dependency = await prisma.moduleDependency.create({
      data: {
        moduleId: Number.parseInt(moduleId),
        dependsOnId: Number.parseInt(dependsOnId),
        isRequired,
      },
      include: {
        module: true,
        dependsOn: true,
      },
    })

    return NextResponse.json({ dependency, message: "Dependency added successfully" })
  } catch (error) {
    console.error("Error creating dependency:", error)
    return NextResponse.json({ error: "Failed to create dependency" }, { status: 500 })
  }
}
