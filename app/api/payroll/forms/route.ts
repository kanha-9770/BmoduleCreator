import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Fetch all available forms for selection
export async function GET(request: NextRequest) {
  try {
    const forms = await prisma.form.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        moduleId: true,
        module: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ success: true, forms })
  } catch (error) {
    console.error("[v0] Error fetching forms:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch forms" }, { status: 500 })
  }
}
