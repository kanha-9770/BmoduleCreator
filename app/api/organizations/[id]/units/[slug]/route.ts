import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authorizeOrgAdmin } from "@/lib/tenant"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unitId = params.id

    const unit = await prisma.organizationUnit.findUnique({
      where: { id: unitId },
      select: { id: true, organizationId: true },
    })
    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 })
    }
    await authorizeOrgAdmin(request, unit.organizationId)

    const full = await prisma.organizationUnit.findUnique({
      where: { id: unitId },
      include: {
        parent: true,
        children: true,
        unitRoles: { include: { role: true } },
        userAssignments: { include: { user: true, role: true } },
      },
    })

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 })
    }

    return NextResponse.json(unit)
  } catch (error) {
    console.error("Error fetching unit:", error)
    return NextResponse.json({ error: "Failed to fetch unit" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unitId = params.id
    const { name, description, assignedRoles, assignedUsers } = await request.json()

    // Start a transaction to update everything atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update basic unit info
      const updatedUnit = await tx.organizationUnit.update({
        where: { id: unitId },
        data: {
          name,
          description: description || "",
        },
      })

      // Handle role assignments
      if (assignedRoles !== undefined) {
        // Delete existing role assignments
        await tx.unitRoleAssignment.deleteMany({
          where: { unitId },
        })

        // Create new role assignments
        if (assignedRoles.length > 0) {
          await Promise.all(
            assignedRoles.map((roleId: string) =>
              tx.unitRoleAssignment.create({
                data: {
                  unitId,
                  roleId,
                },
              }),
            ),
          )
        }
      }

      // Handle user assignments
      if (assignedUsers !== undefined) {
        // Delete existing user assignments
        await tx.userUnitAssignment.deleteMany({
          where: { unitId },
        })

        // Create new user assignments
        if (assignedUsers.length > 0) {
          await Promise.all(
            assignedUsers.map((assignment: { userId: string; roleId: string }) =>
              tx.userUnitAssignment.create({
                data: {
                  userId: assignment.userId,
                  unitId,
                  roleId: assignment.roleId,
                },
              }),
            ),
          )
        }
      }

      // Return the updated unit with all relationships
      return await tx.organizationUnit.findUnique({
        where: { id: unitId },
        include: {
          unitRoles: {
            include: {
              role: true,
            },
          },
          userAssignments: {
            include: {
              user: true,
              role: true,
            },
          },
          children: true,
          parent: true,
        },
      })
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating unit:", error)
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unitId = params.id

    // Delete the unit and all its children recursively
    const deleteUnitRecursively = async (id: string) => {
      // Find all children
      const children = await prisma.organizationUnit.findMany({
        where: { parentId: id },
      })

      // Delete all children first
      for (const child of children) {
        await deleteUnitRecursively(child.id)
      }

      // Delete the unit itself (this will cascade delete assignments)
      await prisma.organizationUnit.delete({
        where: { id },
      })
    }

    await deleteUnitRecursively(unitId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting unit:", error)
    return NextResponse.json({ error: "Failed to delete unit" }, { status: 500 })
  }
}
