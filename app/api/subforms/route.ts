import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[Subform API] Received POST request with body:", body)

    const { sectionId, parentSubformId, name, description, order, level, columns, visible, collapsible, collapsed } = body

    // Validate required fields
    if (!name) {
      console.error("[Subform API] Missing required field: name")
      return NextResponse.json(
        { success: false, error: "Missing required field: name" },
        { status: 400 }
      )
    }

    // For nested subforms, we need to get the sectionId from the parent subform
    let targetSectionId = sectionId
    let parentSubform = null

    if (parentSubformId) {
      // Get parent subform to inherit sectionId
      parentSubform = await prisma.subform.findUnique({
        where: { id: parentSubformId }
      })

      if (!parentSubform) {
        console.error("[Subform API] Parent subform not found:", parentSubformId)
        return NextResponse.json(
          { success: false, error: "Parent subform not found" },
          { status: 404 }
        )
      }

      // Inherit sectionId from parent subform
      targetSectionId = parentSubform.sectionId
      console.log("[Subform API] Parent subform found:", parentSubform.id, "sectionId:", targetSectionId, "level:", parentSubform.level)
    }

    // Validate that we have a sectionId (either provided or inherited)
    if (!targetSectionId) {
      console.error("[Subform API] No sectionId available - either provide sectionId or valid parentSubformId")
      return NextResponse.json(
        { success: false, error: "Either sectionId or parentSubformId must be provided" },
        { status: 400 }
      )
    }

    // Verify the section exists
    const section = await prisma.formSection.findUnique({
      where: { id: targetSectionId }
    })

    if (!section) {
      console.error("[Subform API] Section not found:", targetSectionId)
      return NextResponse.json(
        { success: false, error: "Section not found" },
        { status: 404 }
      )
    }
    console.log("[Subform API] Section found:", section.id)

    // Calculate level and path for nested subforms
    let calculatedLevel = level || 0
    let calculatedPath = ""

    if (parentSubform) {
      calculatedLevel = (parentSubform.level || 0) + 1
      const parentPath = parentSubform.path || ""
      const siblingCount = await prisma.subform.count({
        where: { parentSubformId }
      })
      calculatedPath = parentPath ? `${parentPath}.${siblingCount + 1}` : `${siblingCount + 1}`
      console.log("[Subform API] Calculated nested level:", calculatedLevel, "path:", calculatedPath)
    } else {
      // Root level subform in section
      const siblingCount = await prisma.subform.count({
        where: { sectionId: targetSectionId, parentSubformId: null }
      })
      calculatedPath = `${siblingCount + 1}`
      console.log("[Subform API] Calculated root level path:", calculatedPath)
    }

    // Calculate order if not provided
    let calculatedOrder = order || 0
    if (calculatedOrder === 0) {
      if (parentSubformId) {
        calculatedOrder = await prisma.subform.count({
          where: { parentSubformId }
        })
      } else {
        calculatedOrder = await prisma.subform.count({
          where: { sectionId: targetSectionId, parentSubformId: null }
        })
      }
    }

    console.log("[Subform API] Creating subform with calculated values:", {
      sectionId: targetSectionId,
      parentSubformId: parentSubformId || undefined,
      name,
      description: description || "",
      order: calculatedOrder,
      level: calculatedLevel,
      path: calculatedPath,
      columns: columns || 1,
      visible: visible !== undefined ? visible : true,
      collapsible: collapsible !== undefined ? collapsible : true,
      collapsed: collapsed !== undefined ? collapsed : false,
    })

    // Create the subform
    const subform = await prisma.subform.create({
      data: {
        sectionId: targetSectionId,
        parentSubformId: parentSubformId || undefined,
        name,
        description: description || "",
        order: calculatedOrder,
        level: calculatedLevel,
        path: calculatedPath,
        columns: columns || 1,
        visible: visible !== undefined ? visible : true,
        collapsible: collapsible !== undefined ? collapsible : true,
        collapsed: collapsed !== undefined ? collapsed : false,
      },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        childSubforms: {
          include: {
            fields: {
              orderBy: { order: 'asc' }
            },
            childSubforms: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    console.log("[Subform API] Subform created successfully:", subform.id)

    return NextResponse.json({
      success: true,
      data: subform
    })

  } catch (error) {
    console.error("[Subform API] Error creating subform:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create subform" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('sectionId')
    const parentSubformId = searchParams.get('parentSubformId')
    const includeNested = searchParams.get('includeNested') === 'true'

    let subforms
    const includeClause = {
      fields: {
        orderBy: { order: 'asc' as const }
      },
      ...(includeNested && {
        childSubforms: {
          include: {
            fields: {
              orderBy: { order: 'asc' as const }
            },
            childSubforms: {
              include: {
                fields: {
                  orderBy: { order: 'asc' as const }
                },
                childSubforms: true
              }
            }
          },
          orderBy: { order: 'asc' as const }
        }
      })
    }

    if (sectionId) {
      subforms = await prisma.subform.findMany({
        where: {
          sectionId,
          parentSubformId: null // Only root level subforms
        },
        include: includeClause,
        orderBy: { order: 'asc' }
      })
    } else if (parentSubformId) {
      subforms = await prisma.subform.findMany({
        where: { parentSubformId },
        include: includeClause,
        orderBy: { order: 'asc' }
      })
    } else {
      subforms = await prisma.subform.findMany({
        include: includeClause,
        orderBy: { order: 'asc' }
      })
    }

    return NextResponse.json({
      success: true,
      data: subforms
    })

  } catch (error) {
    console.error("Error fetching subforms:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch subforms" },
      { status: 500 }
    )
  }
}
