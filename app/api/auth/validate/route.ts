import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { DatabaseService } from "@/lib/database-service"

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
      
      // Try to fetch fresh user data from form_records_15
      try {
        const userRecord = await DatabaseService.getUserById(decoded.userId)
        
        if (userRecord) {
          const userData = userRecord.recordData as any
          
          // Extract user information from JSONB structure
          let userName = ""
          let userEmail = ""
          let userPhone = ""
          let userRole = "user"
          let userStatus = "active"
          
          // Parse through the JSONB fields to extract user data
          for (const fieldId in userData) {
            const field = userData[fieldId]
            if (!field || !field.label || !field.value) continue

            const label = field.label.toLowerCase()
            const value = field.value

            // Map fields based on labels
            if (label.includes('name') && !label.includes('user')) {
              userName = value
            } else if (label.includes('email')) {
              userEmail = value
            } else if (label.includes('phone')) {
              userPhone = value
            } else if (label.includes('role')) {
              userRole = value
            } else if (label.includes('status')) {
              userStatus = value
            }
          }
          
          // Check if user account is still active
          if (userStatus && userStatus !== 'active') {
            return NextResponse.json(
              { success: false, error: "Account is not active" },
              { status: 401 }
            )
          }

          const user = {
            id: userRecord.id,
            email: userEmail || decoded.email,
            name: userName || decoded.name || 'User',
            role: userRole,
            phone: userPhone
          }

          return NextResponse.json({
            success: true,
            user
          })
        }
      } catch (dbError) {
        console.warn("Failed to fetch user from database, using token data:", dbError)
      }

      // Fallback to token data if database fetch fails
      const user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name || 'User',
        role: decoded.role || 'user'
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