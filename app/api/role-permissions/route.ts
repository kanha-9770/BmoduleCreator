import { NextRequest, NextResponse } from "next/server";
import { getRolePermissions, updateRolePermissions, type RolePermissionUpdate } from "@/lib/database";

export async function GET() {
  try {
    console.log("[v0] GET /api/role-permissions - Starting request");

    const rolePermissions = await getRolePermissions();
    console.log(`[v0] Successfully retrieved ${rolePermissions.length} role permissions`);

    return NextResponse.json({
      success: true,
      data: rolePermissions,
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
    console.log("[v0] Request body:", body);

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Request body must be an array" },
        { status: 400 }
      );
    }

    // Validate and transform the updates
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
        granted: Boolean(update.granted),
        canDelegate: Boolean(update.canDelegate ?? false),
      }));

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid updates provided" },
        { status: 400 }
      );
    }

    console.log(`[v0] Processing ${updates.length} role permission updates`);

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