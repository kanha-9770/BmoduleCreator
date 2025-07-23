import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { DatabaseRoles } from "@/lib/DatabaseRoles"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
      
      // Get fresh user data
      const userRecord = await DatabaseRoles.getUserById(decoded.userId)
      if (!userRecord) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 401 }
        )
      }

      const recordData = userRecord.recordData as any
      
      return NextResponse.json({
        success: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          roleId: recordData?.roleId,
          roleName: recordData?.roleName
        }
      })
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError)
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error("Token validation error:", error)
    return NextResponse.json(
      { success: false, error: "Token validation failed" },
      { status: 500 }
    )
  }
}