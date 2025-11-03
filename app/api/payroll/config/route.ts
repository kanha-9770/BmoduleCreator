import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Fetch current payroll configuration
export async function GET(request: NextRequest) {
  try {
    const config = await prisma.payrollConfiguration.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error("[v0] Error fetching payroll config:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch configuration" }, { status: 500 })
  }
}

// POST - Save payroll configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { attendanceFormId, leaveFormId, organizationId } = body

    if (!attendanceFormId || !leaveFormId) {
      return NextResponse.json(
        { success: false, error: "Both attendance and leave forms must be selected" },
        { status: 400 },
      )
    }

    // Deactivate existing configurations
    await prisma.payrollConfiguration.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })

    // Create new configuration
    const config = await prisma.payrollConfiguration.create({
      data: {
        attendanceFormId,
        leaveFormId,
        organizationId,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error("[v0] Error saving payroll config:", error)
    return NextResponse.json({ success: false, error: "Failed to save configuration" }, { status: 500 })
  }
}
