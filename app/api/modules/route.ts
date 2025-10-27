// pages/api/modules.ts
import { type NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth"; // Assuming this exists as in the original
import { DatabaseService } from "@/lib/database-service";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("[API] /api/modules - Starting request to get modules");

    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = await validateSession(token);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user's organizationId (as in original)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: "User is not associated with an organization" },
        { status: 403 }
      );
    }

    const modules = await DatabaseService.getModuleHierarchy(userId);
    console.log(`[API] /api/modules - Retrieved ${modules.length} modules for userId: ${userId}`);

    // Validate module structure (kept as-is to not disturb)
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

    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = await validateSession(token);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user's organizationId and validate
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: "User is not associated with an organization" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("[API] /api/modules - Request body:", body);

    const { name, description, parentId, moduleType, icon, color, organizationId } = body;

    if (!name) {
      console.log("[API] /api/modules - Missing required field: name");
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    // Validate organizationId matches user's
    if (!organizationId || organizationId !== user.organizationId) {
      console.log("[API] /api/modules - Invalid organizationId");
      return NextResponse.json(
        { success: false, error: "Invalid organization ID" },
        { status: 403 }
      );
    }

    const module = await DatabaseService.createModule({
      name,
      description,
      parentId,
      moduleType: moduleType || "standard",
      icon,
      color,
      organizationId,
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