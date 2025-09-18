import { getModules } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("[v0] GET /api/modules - Starting request");

    const modules = await getModules();
    console.log(`[v0] Retrieved modules from database: ${modules.length}`);
    console.log("[v0] Successfully retrieved", modules.length, "modules");

    return NextResponse.json({
      success: true,
      data: modules,
    });
  } catch (error) {
    console.error("[v0] Failed to fetch modules:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch modules",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
