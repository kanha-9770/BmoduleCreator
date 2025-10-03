import { type NextRequest, NextResponse } from "next/server";
import { getUserPermissions, updateUserPermissions, type UserPermissionUpdate } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/user-permissions - Starting request");

    const userId = request.nextUrl.searchParams.get("userId");

    if (userId && typeof userId !== "string") {
      console.log("[v0] Invalid userId parameter:", userId);
      return NextResponse.json(
        { success: false, error: "Invalid userId parameter" },
        { status: 400 }
      );
    }

    const userPermissions = await getUserPermissions(userId || undefined);
    console.log(
      `[v0] Successfully retrieved ${userPermissions.length} user permissions for userId: ${userId || "all"}`
    );

    return NextResponse.json({
      success: true,
      data: userPermissions,
      meta: {
        userId: userId || null,
        permissionCount: userPermissions.length,
      },
    });
  } catch (error) {
    console.error("[v0] Failed to fetch user permissions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user permissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("[v0] PUT /api/user-permissions - Starting request");

    const body = await request.json();
    console.log("[v0] Request body:", JSON.stringify(body, null, 2));

    if (!Array.isArray(body)) {
      console.log("[v0] Invalid request body: must be an array");
      return NextResponse.json(
        { success: false, error: "Request body must be an array" },
        { status: 400 }
      );
    }

    const updates: UserPermissionUpdate[] = body
      .filter((update: any) => {
        if (!update.userId || !update.permissionId) {
          console.log(
            "[v0] Skipping invalid update: missing userId or permissionId",
            update
          );
          return false;
        }
        return true;
      })
      .map((update: any) => ({
        userId: update.userId,
        permissionId: update.permissionId,
        moduleId: update.moduleId || null,
        formId: update.formId || null, // FIXED: Now properly handling formId
        granted: Boolean(update.granted),
        reason: update.reason || "Manual assignment",
        grantedBy: update.grantedBy || null,
        expiresAt: update.expiresAt ? new Date(update.expiresAt) : null,
        isActive: Boolean(update.isActive ?? true),
      }));

    if (updates.length === 0) {
      console.log("[v0] No valid updates provided");
      return NextResponse.json(
        { success: false, error: "No valid updates provided" },
        { status: 400 }
      );
    }

    console.log(`[v0] Processing ${updates.length} user permission updates`);
    console.log("[v0] Mapped updates:", JSON.stringify(updates, null, 2));

    console.log("[v0] About to call updateUserPermissions function...");
    const success = await updateUserPermissions(updates);
    console.log("[v0] updateUserPermissions returned:", success);

    console.log("[v0] User permissions updated successfully");
    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} user permissions`,
      updatedCount: updates.length,
    });
  } catch (error) {
    console.error("[v0] Error in PUT /api/user-permissions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user permissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}