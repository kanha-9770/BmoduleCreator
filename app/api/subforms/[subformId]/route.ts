import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { subformId: string } }) {
  try {
    const subform = await prisma.subform.findUnique({
      where: { id: params.subformId },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!subform) {
      return NextResponse.json({ success: false, error: "Subform not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: subform,
    })
  } catch (error: any) {
    console.error("Error fetching subform:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch subform",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { subformId: string } }) {
  try {
    const body = await request.json()
    const { name, order, fields, ...otherData } = body

    console.log("[Subform API] Updating subform:", params.subformId, "with data:", { name, order })

    // Update only the subform properties, not the fields
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (name !== undefined) updateData.name = name
    if (order !== undefined) updateData.order = order

    // Add any other non-relational fields
    Object.keys(otherData).forEach((key) => {
      if (key !== "fields" && key !== "id" && key !== "createdAt" && key !== "updatedAt") {
        updateData[key] = otherData[key]
      }
    })

    const subform = await prisma.subform.update({
      where: { id: params.subformId },
      data: updateData,
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
    })

    console.log("[Subform API] Subform updated successfully:", subform.id)

    return NextResponse.json({
      success: true,
      data: subform,
    })
  } catch (error: any) {
    console.error("Error updating subform:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update subform",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { subformId: string } }) {
  try {
    console.log("[Subform API] Deleting subform:", params.subformId)

    // First delete all fields in the subform
    const deletedFields = await prisma.formField.deleteMany({
      where: { subformId: params.subformId },
    })

    console.log("[Subform API] Deleted", deletedFields.count, "fields from subform")

    // Then delete the subform
    await prisma.subform.delete({
      where: { id: params.subformId },
    })

    console.log("[Subform API] Subform deleted successfully")

    return NextResponse.json({
      success: true,
      message: "Subform deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting subform:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete subform",
      },
      { status: 500 },
    )
  }
}
