import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Helper function to get records from the correct table based on form mapping
async function getFormRecords(formId: string) {
  // First get the table mapping for this form
  const mapping = await prisma.formTableMapping.findUnique({
    where: { formId },
  })

  if (!mapping) {
    return []
  }

  const tableName = mapping.storageTable

  // Map table names to Prisma model methods
  const tableMap: Record<string, any> = {
    form_records_1: prisma.formRecord1,
    form_records_2: prisma.formRecord2,
    form_records_3: prisma.formRecord3,
    form_records_4: prisma.formRecord4,
    form_records_5: prisma.formRecord5,
    form_records_6: prisma.formRecord6,
    form_records_7: prisma.formRecord7,
    form_records_8: prisma.formRecord8,
    form_records_9: prisma.formRecord9,
    form_records_10: prisma.formRecord10,
    form_records_11: prisma.formRecord11,
    form_records_12: prisma.formRecord12,
    form_records_13: prisma.formRecord13,
    form_records_14: prisma.formRecord14,
    form_records_15: prisma.formRecord15,
  }

  const model = tableMap[tableName]
  if (!model) {
    return []
  }

  const records = await model.findMany({
    where: { formId },
    orderBy: { date: "desc" },
  })

  return records
}

// GET - Fetch attendance and leave records based on configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")
    const employeeId = searchParams.get("employeeId")

    // Get active configuration
    const config = await prisma.payrollConfiguration.findFirst({
      where: { isActive: true },
    })

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: "Payroll configuration not found. Please configure attendance and leave forms first.",
        },
        { status: 404 },
      )
    }

    // Fetch records from configured forms
    const [attendanceRecords, leaveRecords] = await Promise.all([
      getFormRecords(config.attendanceFormId),
      getFormRecords(config.leaveFormId),
    ])

    // Filter by date if month/year provided
    let filteredAttendance = attendanceRecords
    let filteredLeave = leaveRecords

    if (month && year) {
      const startDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
      const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 0)

      filteredAttendance = attendanceRecords.filter((record: any) => {
        const recordDate = new Date(record.date)
        return recordDate >= startDate && recordDate <= endDate
      })

      filteredLeave = leaveRecords.filter((record: any) => {
        const recordDate = new Date(record.date)
        return recordDate >= startDate && recordDate <= endDate
      })
    }

    // Filter by employee if provided
    if (employeeId) {
      filteredAttendance = filteredAttendance.filter((record: any) => record.employee_id === employeeId)
      filteredLeave = filteredLeave.filter((record: any) => record.employee_id === employeeId)
    }

    return NextResponse.json({
      success: true,
      data: {
        attendance: filteredAttendance,
        leave: filteredLeave,
        config,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching payroll records:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch payroll records" }, { status: 500 })
  }
}
