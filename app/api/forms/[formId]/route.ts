import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Forms API: Starting request")
    console.log("[v0] Forms API: Prisma client initialized:", !!prisma)

    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log("[v0] Forms API: Database connection test:", connectionTest)

    const formCount = await prisma.form.count()
    console.log("[v0] Forms API: Total forms in database:", formCount)

    const forms = await prisma.form.findMany({
      include: {
        module: {
          select: {
            id: true,
            name: true,
          },
        },
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
    })

    console.log("[v0] Forms API: Found", forms.length, "forms")
    console.log(
      "[v0] Forms API: First form sample:",
      forms[0]
        ? {
            id: forms[0].id,
            name: forms[0].name,
            moduleId: forms[0].moduleId,
            moduleName: forms[0].module?.name,
          }
        : "No forms",
    )

    const transformedForms = forms.map((form) => ({
      id: form.id,
      name: form.name,
      moduleId: form.moduleId,
      moduleName: form.module?.name || "Unknown Module",
      tableMapping: form.tableMapping,
    }))

    console.log("[v0] Forms API: Returning", transformedForms.length, "transformed forms")

    return NextResponse.json({
      success: true,
      forms: transformedForms,
      count: transformedForms.length,
    })
  } catch (error: any) {
    console.error("[v0] Forms API: Error fetching forms:", error)
    console.error("[v0] Forms API: Error stack:", error.stack)
    console.error("[v0] Forms API: Error name:", error.name)
    console.error("[v0] Forms API: Error message:", error.message)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
        errorType: error.name,
      },
      { status: 500 },
    )
  }
}
export async function PUT(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const body = await request.json()
    const form = await DatabaseService.updateForm(params.formId, body)
    return NextResponse.json({ success: true, data: form })
  } catch (error: any) {
    console.error("API: Error updating form:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    await DatabaseService.deleteForm(params.formId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API: Error deleting form:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
