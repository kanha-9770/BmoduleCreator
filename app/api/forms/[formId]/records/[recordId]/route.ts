import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest, { params }: { params: { formId: string; recordId: string } }) {
  try {
    const { formId, recordId } = params

    console.log(`[API] Getting record ${recordId} for form ${formId}`)

    // Get the specific record
    const record = await DatabaseService.getFormRecord(recordId)

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: "Record not found",
        },
        { status: 404 },
      )
    }

    // Verify the record belongs to the specified form
    if (record.formId !== formId) {
      return NextResponse.json(
        {
          success: false,
          error: "Record does not belong to this form",
        },
        { status: 403 },
      )
    }

    console.log(`[API] Found record ${recordId}`)

    return NextResponse.json({
      success: true,
      data: record,
    })
  } catch (error: any) {
    console.error("Error fetching form record:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch form record",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { formId: string; recordId: string } }) {
  try {
    const { formId, recordId } = params
    const body = await request.json()

    console.log(`[API] Updating record ${recordId} for form ${formId}`)

    const { recordData, status, submittedBy } = body

    // Validate required fields
    if (!recordData || typeof recordData !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Record data is required and must be an object",
        },
        { status: 400 },
      )
    }

    // Update the record
    const record = await DatabaseService.updateFormRecord(recordId, {
      recordData,
      status: status || "submitted",
      submittedBy: submittedBy || "admin",
      updatedAt: new Date(),
    })

    console.log(`[API] Successfully updated record ${recordId}`)

    return NextResponse.json({
      success: true,
      data: record,
    })
  } catch (error: any) {
    console.error("Error updating form record:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update form record",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { formId: string; recordId: string } }) {
  try {
    const { formId, recordId } = params

    console.log(`[API] Deleting record ${recordId} for form ${formId}`)

    // Get the record first to verify it exists and belongs to this form
    const record = await DatabaseService.getFormRecord(recordId)

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: "Record not found",
        },
        { status: 404 },
      )
    }

    if (record.formId !== formId) {
      return NextResponse.json(
        {
          success: false,
          error: "Record does not belong to this form",
        },
        { status: 403 },
      )
    }

    // Delete the record
    await DatabaseService.deleteFormRecord(recordId)

    console.log(`[API] Successfully deleted record ${recordId}`)

    return NextResponse.json({
      success: true,
      message: "Record deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting form record:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete form record",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
