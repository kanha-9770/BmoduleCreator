import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Fetch all active employees
export async function GET(request: NextRequest) {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        employeeName: true,
        department: true,
        designation: true,
        totalSalary: true,
        givenSalary: true,
        bonusAmount: true,
        nightAllowance: true,
        overTime: true,
        oneHourExtra: true,
        status: true,
      },
      orderBy: {
        employeeName: "asc",
      },
    })

    return NextResponse.json({ success: true, employees })
  } catch (error) {
    console.error("[v0] Error fetching employees:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 })
  }
}
