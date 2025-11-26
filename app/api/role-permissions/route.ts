export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
import { NextRequest, NextResponse } from "next/server";
import { getRolePermissions, updateRolePermissions, type RolePermissionUpdate } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/role-permissions - Starting request");

    const roleId = request.nextUrl.searchParams.get("roleId");

    if (roleId && typeof roleId !== "string") {
      console.log("[v0] Invalid roleId parameter:", roleId);
      return NextResponse.json(
        { success: false, error: "Invalid roleId parameter" },
        { status: 400 }
      );
    }

    const rolePermissions = await getRolePermissions(roleId || undefined);
    console.log(
      `[v0] Successfully retrieved ${rolePermissions.length} role permissions for roleId: ${roleId || "all"}`
    );

    return NextResponse.json({
      success: true,
      data: rolePermissions,
      meta: {
        roleId: roleId || null,
        permissionCount: rolePermissions.length,
      },
    });
  } catch (error) {
    console.error("[v0] Failed to fetch role permissions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch role permissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("[v0] PUT /api/role-permissions - Starting request");

    const body = await request.json();
    console.log("[v0] Request body:", JSON.stringify(body, null, 2));

    if (!Array.isArray(body)) {
      console.log("[v0] Invalid request body: must be an array");
      return NextResponse.json(
        { success: false, error: "Request body must be an array" },
        { status: 400 }
      );
    }

    const updates: RolePermissionUpdate[] = body
      .filter((update: any) => {
        if (!update.roleId || !update.permissionId) {
          console.log("[v0] Skipping invalid update: missing roleId or permissionId", update);
          return false;
        }
        return true;
      })
      .map((update: any) => ({
        roleId: update.roleId,
        permissionId: update.permissionId,
        moduleId: update.moduleId || null,
        formId: update.formId || null, // FIXED: Now properly handling formId
        granted: Boolean(update.granted),
        canDelegate: Boolean(update.canDelegate ?? false),
      }));

    if (updates.length === 0) {
      console.log("[v0] No valid updates provided");
      return NextResponse.json(
        { success: false, error: "No valid updates provided" },
        { status: 400 }
      );
    }

    console.log(`[v0] Processing ${updates.length} role permission updates`);
    console.log("[v0] Mapped updates:", JSON.stringify(updates, null, 2));

    const success = await updateRolePermissions(updates);

    console.log("[v0] Role permissions updated successfully");
    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} role permissions`,
      updatedCount: updates.length,
    });
  } catch (error) {
    console.error("[v0] Error in PUT /api/role-permissions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update role permissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}