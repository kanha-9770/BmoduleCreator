import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Email and password are required" 
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Please enter a valid email address" 
        },
        { status: 400 }
      )
    }

    // For demo purposes, we'll use hardcoded credentials
    // In production, you would query your user database
    const demoUsers = [
      {
        id: "demo-user-1",
        email: "admin@example.com",
        password: "password123", // In production, this would be hashed
        name: "Admin User",
        role: "admin"
      },
      {
        id: "demo-user-2", 
        email: "user@example.com",
        password: "password123",
        name: "Regular User",
        role: "user"
      }
    ]

    // Find user by email
    const user = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid email or password" 
        },
        { status: 401 }
      )
    }

    // Verify password
    // In production, you would use bcrypt.compare(password, user.hashedPassword)
    if (password !== user.password) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid email or password" 
        },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    )

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    )
  }
}