import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
      
      // In a real application, you would fetch user data from database
      // For demo purposes, we'll return the decoded token data
      const user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.email === "admin@example.com" ? "Admin User" : "Regular User",
        role: decoded.role
      }

      return NextResponse.json({
        success: true,
        user
      })
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error("Token validation error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}