import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, mobile, password } = body

    if (!firstName || !lastName || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }
    if (!email && !mobile) {
      return NextResponse.json({ success: false, error: "Either email or mobile is required" }, { status: 400 })
    }

    const result = await registerUser({ firstName, lastName, email, mobile, password })
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: result.userId })
  } catch (error) {
    console.error("Registration API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
