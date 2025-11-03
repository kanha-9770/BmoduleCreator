import { type NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * Get all forms from permitted modules for lookup configuration
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = await validateSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const permittedModules = await prisma.permittedModule.findMany({
      include: {
        forms: {
          include: {
            tableMapping: {
              select: {
                id: true,
                storageTable: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    // Flatten forms with module information
    const forms = permittedModules.flatMap((module) =>
      module.forms.map((form) => ({
        id: form.id,
        name: form.name,
        moduleId: module.id,
        moduleName: module.name,
        tableMapping: form.tableMapping,
      })),
    )

    return NextResponse.json({
      success: true,
      forms,
    })
  } catch (error) {
    console.error("Forms fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
