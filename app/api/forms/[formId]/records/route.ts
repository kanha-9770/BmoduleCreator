import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const { formId } = params
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status") || undefined
    const search = searchParams.get("search") || undefined
    const sortBy = searchParams.get("sortBy") || "submittedAt"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"
    const employeeId = searchParams.get("employeeId") || undefined
    const dateFrom = searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined
    const dateTo = searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined

    console.log("Fetching records with params:", {
      formId,
      page,
      limit,
      status,
      search,
      sortBy,
      sortOrder,
    })

    // Get form to ensure it exists
    const form = await DatabaseService.getForm(formId)
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Fetch records with enhanced options
    const records = await DatabaseService.getFormRecords(formId, {
      page,
      limit,
      status: status !== "all" ? status : undefined,
      search,
      sortBy,
      sortOrder,
      employeeId,
      dateFrom,
      dateTo,
    })

    // Get total count for pagination
    const totalCount = await DatabaseService.getFormSubmissionCount(formId)

    console.log(`Found ${records.length} records out of ${totalCount} total`)

    return NextResponse.json({
      success: true,
      records: records,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      form: {
        id: form.id,
        name: form.name,
        sections: form.sections,
      },
    })
  } catch (error: any) {
    console.error("Error fetching form records:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch form records",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const { formId } = params
    const body = await request.json()

    console.log("Creating new record for form:", formId)

    // Get form to validate
    const form = await DatabaseService.getForm(formId)
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Create the record
    const record = await DatabaseService.createFormRecord(
      formId,
      body.recordData,
      body.submittedBy || "system",
      body.employeeId,
      body.amount,
      body.date,
    )

    console.log("Record created successfully:", record.id)

    return NextResponse.json({
      success: true,
      data: record,
    })
  } catch (error: any) {
    console.error("Error creating form record:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create form record",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
