import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest) {
  try {
    console.log("[API] /api/modules - Getting modules")

    // Get all modules without permission filtering
    const modules = await DatabaseService.getModuleHierarchy()

    console.log(`[API] /api/modules - Returning ${modules.length} modules`)

    return NextResponse.json({
      success: true,
      data: modules,
      meta: {
        moduleCount: modules.length,
      },
    })
  } catch (error: any) {
    console.error("[API] /api/modules - Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch modules",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, parentId, moduleType, icon, color } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })
    }

    const module = await DatabaseService.createModule({ 
      name, 
      description, 
      parentId, 
      moduleType, 
      icon, 
      color 
    })
    return NextResponse.json({ success: true, data: module })
  } catch (error: any) {
    console.error("Error creating module:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}