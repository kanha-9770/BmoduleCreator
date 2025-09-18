import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.user_id || !body.unit_id || !body.role_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: user_id, unit_id, or role_id",
        },
        { status: 400 }
      );
    }

    // Verify user, unit, and role exist
    const user = await prisma.user.findUnique({ where: { id: body.user_id } });
    const unit = await prisma.organizationUnit.findUnique({
      where: { id: body.unit_id },
    });
    const role = await prisma.role.findUnique({ where: { id: body.role_id } });

    if (!user || !unit || !role) {
      return NextResponse.json(
        { success: false, error: "Invalid user_id, unit_id, or role_id" },
        { status: 400 }
      );
    }

    // Upsert user-unit assignment
    const assignment = await prisma.userUnitAssignment.upsert({
      where: {
        user_id_unit_id_role_id: {
          user_id: body.user_id,
          unit_id: body.unit_id,
          role_id: body.role_id,
        },
      },
      update: {
        notes: body.notes || "",
        updated_at: new Date(),
      },
      create: {
        id: require("cuid")(),
        user_id: body.user_id,
        unit_id: body.unit_id,
        role_id: body.role_id,
        notes: body.notes || "",
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "User unit assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("[v0] Error in PUT /api/user-unit-assignments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user unit assignment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
