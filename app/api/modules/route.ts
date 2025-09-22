// pages/api/modules.ts
import { type NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/database-service";

export async function GET(request: NextRequest) {
  try {
    console.log("[API] /api/modules - Starting request to get modules");

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const modules = await DatabaseService.getModuleHierarchy(userId);
    console.log(`[API] /api/modules - Retrieved ${modules.length} modules for userId: ${userId || 'unauthenticated'}`);

    // Validate module structure
    const validatedModules = modules.map((module: any) => ({
      id: module.id,
      name: module.name,
      description: module.description || null,
      icon: module.icon || null,
      color: module.color || null,
      moduleType: module.moduleType || "standard",
      level: module.level || 0,
      path: module.path || module.id,
      isActive: module.isActive ?? true,
      forms: Array.isArray(module.forms) ? module.forms : [],
      children: Array.isArray(module.children) ? module.children : [],
    }));

    console.log(`[API] /api/modules - Returning ${validatedModules.length} validated modules`);

    return NextResponse.json({
      success: true,
      data: validatedModules,
      meta: {
        moduleCount: validatedModules.length,
      },
    });
  } catch (error: any) {
    console.error("[API] /api/modules - Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch modules",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API] /api/modules - Starting request to create module");

    const body = await request.json();
    const { name, description, parentId, moduleType, icon, color, path } = body;

    if (!name) {
      console.log("[API] /api/modules - Missing required field: name");
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const module = await DatabaseService.createModule({
      name,
      description,
      parentId,
      moduleType: moduleType || "standard",
      icon,
      color,
      path: path || name.toLowerCase().replace(/\s+/g, "-"),
    });

    console.log("[API] /api/modules - Module created successfully:", module.id);
    return NextResponse.json({ success: true, data: module });
  } catch (error: any) {
    console.error("[API] /api/modules - Error creating module:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create module" },
      { status: 500 }
    );
  }
}