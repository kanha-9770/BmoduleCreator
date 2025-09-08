import { type NextRequest, NextResponse } from "next/server"
import { loginWithPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, password } = body

    // Validate required fields
    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: "Missing identifier or password" }, { status: 400 })
    }

    const result = await loginWithPassword(identifier, password)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
