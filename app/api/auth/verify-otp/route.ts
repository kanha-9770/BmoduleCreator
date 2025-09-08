import { type NextRequest, NextResponse } from "next/server"
import { verifyOTP } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, code, purpose } = body

    // Validate required fields
    if (!identifier || !code || !purpose) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!["registration", "login", "password_reset"].includes(purpose)) {
      return NextResponse.json({ success: false, error: "Invalid purpose" }, { status: 400 })
    }

    const result = await verifyOTP(identifier, code, purpose)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      userId: result.userId,
      message: "OTP verified successfully",
    })
  } catch (error) {
    console.error("Verify OTP API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
