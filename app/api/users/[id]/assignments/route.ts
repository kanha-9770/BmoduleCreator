import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    const assignments = await prisma.userUnitAssignment.findMany({
      where: { userId },
      include: {
        unit: true,
        role: true,
      },
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching user assignments:", error)
    return NextResponse.json({ error: "Failed to fetch user assignments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const { unitId, roleId, notes } = await request.json()

    const assignment = await prisma.userUnitAssignment.upsert({
      where: {
        userId_unitId: {
          userId,
          unitId,
        },
      },
      update: {
        roleId,
        notes,
      },
      create: {
        userId,
        unitId,
        roleId,
        notes,
      },
      include: {
        unit: true,
        role: true,
      },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error creating/updating user assignment:", error)
    return NextResponse.json({ error: "Failed to create/update user assignment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const { searchParams } = new URL(request.url)
    const unitId = searchParams.get("unitId")

    if (!unitId) {
      return NextResponse.json({ error: "Unit ID is required" }, { status: 400 })
    }

    await prisma.userUnitAssignment.delete({
      where: {
        userId_unitId: {
          userId,
          unitId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user assignment:", error)
    return NextResponse.json({ error: "Failed to delete user assignment" }, { status: 500 })
  }
}
