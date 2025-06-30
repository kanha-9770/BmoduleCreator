import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function POST(request: Request, { params }: { params: { moduleId: string } }) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })
    }

    const form = await DatabaseService.createForm({
      moduleId: params.moduleId,
      name,
      description,
    })

    return NextResponse.json({ success: true, data: form })
  } catch (error: any) {
    console.error("Error creating form:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
