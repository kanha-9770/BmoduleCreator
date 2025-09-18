import { type NextRequest, NextResponse } from "next/server";
import { updateRole, deleteRole } from "@/lib/database/roles";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roleId = params.id;
    const data = await request.json();

    const role = await updateRole(roleId, data);
    return NextResponse.json(role);
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roleId = params.id;
    await deleteRole(roleId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    );
  }
}
