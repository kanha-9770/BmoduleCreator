export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
import { getRolesWithUsers } from "@/lib/database"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] GET /api/roles - Starting request")

    const roles = await getRolesWithUsers()
    console.log(`[v0] Retrieved roles from database: ${roles.length}`)
    console.log("[v0] Successfully retrieved", roles.length, "roles")

    return NextResponse.json({
      success: true,
      data: roles,
    })
  } catch (error) {
    console.error("[v0] Failed to fetch roles:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch roles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
