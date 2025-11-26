import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"
import { headers } from "next/headers"
import { validateSession } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const { formId } = params
    const body = await request.json()

    console.log("Form submission API called", {
      formId,
      body: {
        recordData: body.recordData,
        submittedBy: body.submittedBy,
        userAgent: body.userAgent,
      },
    })

    // Validate required fields
    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 })
    }

    if (!body.recordData || typeof body.recordData !== "object") {
      return NextResponse.json({ error: "Record data is required and must be an object" }, { status: 400 })
    }

    // Get form details to check if it exists and is published
    const form = await DatabaseService.getForm(formId)

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    if (!form.isPublished) {
      return NextResponse.json({ error: "Form is not published" }, { status: 403 })
    }

    // Handle authentication: always try to validate session if token present
    const token = request.cookies.get("auth-token")?.value
    let session = null
    let userId: string | null = null
    console.log("Auth token akash:", token)
    if (token) {
      session = await validateSession(token)
      console.log("this is the session data", session)
      if (session?.user?.id) {
        userId = session.user.id
      }
    }

    // Enforce login if required
    if (form.requireLogin && !userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check submission limits if configured
    if (form.maxSubmissions) {
      const currentCount = await DatabaseService.getFormSubmissionCount(formId, userId ?? undefined)
      if (currentCount >= form.maxSubmissions) {
        return NextResponse.json({ error: "Maximum submissions reached for this form" }, { status: 429 })
      }
    }

    // Transform field IDs to structured field data with metadata
    const structuredRecordData = await transformToStructuredData(form, body.recordData)

    console.log("Structured record data:", structuredRecordData)

    // Get client information
    const headersList = headers()
    const userAgent = headersList.get("user-agent") || body.userAgent || "Unknown"
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "Unknown"

    // Extract additional data from body if present
    const employeeId = body.employeeId || body.employee_id
    const amount = body.amount ? Number.parseFloat(body.amount) : undefined
    const date = body.date ? new Date(body.date) : undefined

    // Create the form record in the appropriate table with structured data and userId
    const record = await DatabaseService.createFormRecord(
      formId,
      structuredRecordData,
      body.submittedBy || "anonymous",
      employeeId,
      amount,
      date,
      userId ?? undefined, // Pass undefined when userId is null to match expected type
    )

    // Track form submission event
    await DatabaseService.trackFormEvent(
      formId,
      "submit",
      {
        recordId: record.id,
        userId, // Include userId in event tracking (null if anonymous)
        fieldsCount: Object.keys(structuredRecordData).length,
        submissionSource: "form",
        hasEmployeeId: !!employeeId,
        hasAmount: !!amount,
        hasDate: !!date,
        originalFieldIds: Object.keys(body.recordData),
        structuredFields: Object.keys(structuredRecordData),
      },
      body.sessionId,
      userAgent,
      ipAddress,
    )

    console.log("Form submission successful:", {
      recordId: record.id,
      formId,
      userId: record.userId, // Log the set userId
      submittedBy: record.submittedBy,
      structuredData: structuredRecordData,
    })

    return NextResponse.json({
      success: true,
      message: form.submissionMessage || "Form submitted successfully!",
      data: {
        id: record.id,
        userId: record.userId, // Include userId in response (null if anonymous)
        recordData: structuredRecordData,
        submittedAt: record.submittedAt,
        form: {
          id: form.id,
          name: form.name,
          sections: form.sections.map((section: { id: any; title: any; fields: any[] }) => ({
            id: section.id,
            title: section.title,
            fields: section.fields.map((field: { id: string | number; label: any; type: any }) => ({
              id: field.id,
              label: field.label,
              type: field.type,
              value: structuredRecordData[field.id]?.value || null,
            })),
          })),
        },
      },
    })
  } catch (error: any) {
    console.error("Form submission error", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        error: "Failed to submit form",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

// Helper function to transform field IDs to structured data with field metadata
async function transformToStructuredData(form: any, recordData: Record<string, any>): Promise<Record<string, any>> {
  const structuredData: Record<string, any> = {}

  // Create a mapping of field IDs to field definitions
  const fieldIdToFieldMap: Record<string, any> = {}
  let fieldOrder = 0

  form.sections.forEach((section: any) => {
    section.fields.forEach((field: any) => {
      fieldIdToFieldMap[field.id] = {
        ...field,
        sectionId: section.id,
        sectionTitle: section.title,
        order: fieldOrder++,
      }
    })
  })

  // Transform the record data to include field metadata
  for (const [fieldId, value] of Object.entries(recordData)) {
    const fieldDef = fieldIdToFieldMap[fieldId]
    console.log(`Processing field ID: ${fieldId}, value: ${value}, definition:`, fieldDef);

    if (fieldDef) {
      // Store structured data with field metadata
      structuredData[fieldId] = {
        fieldId: fieldId,
        label: fieldDef.label,
        type: fieldDef.type,
        value: value,
        sectionId: fieldDef.sectionId,
        sectionTitle: fieldDef.sectionTitle,
        order: fieldDef.order,
        placeholder: fieldDef.placeholder,
        description: fieldDef.description,
        validation: fieldDef.validation || {},
        options: fieldDef.options || [],
        lookup: fieldDef.lookup || null,
      }
    } else {
      // If no field definition found, store with minimal metadata
      console.warn(`No field definition found for ID: ${fieldId}`)
      structuredData[fieldId] = {
        fieldId: fieldId,
        label: fieldId,
        type: "text",
        value: value,
        sectionId: null,
        sectionTitle: "Unknown",
        order: 999,
      }
    }
  }

  return structuredData
}