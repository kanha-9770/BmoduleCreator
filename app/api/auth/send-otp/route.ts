import { type NextRequest, NextResponse } from "next/server"
import { sendOTP } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Send OTP request body:", body)

    const { identifier, type, purpose } = body

    if (!identifier || !type || !purpose) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: identifier, type, and purpose are required",
        },
        { status: 400 },
      )
    }

    if (!["email", "mobile"].includes(type)) {
      return NextResponse.json({ success: false, error: 'Invalid type. Must be "email" or "mobile"' }, { status: 400 })
    }

    const validPurposes = [
      "REGISTRATION",
      "LOGIN",
      "PASSWORD_RESET",
      "EMAIL_VERIFICATION",
      "MOBILE_VERIFICATION",
      "TWO_FACTOR",
    ]

    const normalizedPurpose = purpose.toUpperCase()
    if (!validPurposes.includes(normalizedPurpose)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid purpose: ${purpose}. Must be one of ${validPurposes.join(", ")}`,
        },
        { status: 400 },
      )
    }

    const result = await sendOTP(identifier, type, normalizedPurpose as any)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || "Failed to send OTP" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${type === "email" ? "email" : "mobile"}: ${identifier}`,
    })
  } catch (error: any) {
    console.error("Send OTP API error:", error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: "Invalid JSON format" }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: false,
        error: `Internal server error: ${error.message || "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
