import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { DatabaseService } from "@/lib/database-service"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("Login API called with email:", email)
    console.log("Request body:", { email, password })   
    
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

    try {
      // Get user records from form_records_15 (user forms table)
      const userRecords = await DatabaseService.getUserRecords(email)
      console.log("User records found:", userRecords.length)
      
      if (!userRecords || userRecords.length === 0) {
        console.log("No user records found, falling back to demo users")
        
        // Fallback to demo users
        const demoUsers = [
          {
            id: "demo-user-1",
            email: "admin@example.com",
            password: "password123",
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

        const demoUser = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase())

        if (!demoUser || password !== demoUser.password) {
          return NextResponse.json(
            { 
              success: false, 
              error: "Invalid email or password" 
            },
            { status: 401 }
          )
        }

        const token = jwt.sign(
          { 
            userId: demoUser.id, 
            email: demoUser.email, 
            role: demoUser.role,
            name: demoUser.name
          },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "24h" }
        )

        return NextResponse.json(
          {
            success: true,
            message: "Login successful (Demo Mode)",
            token,
            user: {
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.name,
              role: demoUser.role
            }
          }
        )
      }

      const userRecord = userRecords[0]

      if (!userRecord) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid email or password" 
          },
          { status: 401 }
        )
      }

      const userData = userRecord.recordData as any
      console.log("Processing user data from record:", userRecord.id)
      console.log("User data structure:", userData)

      // Extract user information from JSONB structure
      let userName = ""
      let userEmail = ""
      let userPhone = ""
      let userPassword = ""
      let userRole = "user"
      let userStatus = "active"

      // Parse through the JSONB fields to extract user data
      for (const fieldId in userData) {
        const field = userData[fieldId]
        if (!field || typeof field !== 'object' || !field.value) continue

        const label = field.label.toLowerCase()
        const value = field.value
        const type = field.type?.toLowerCase() || ''

        console.log(`Processing field ${fieldId}: type=${type}, label=${label}, value=${value}`)

        // Map fields based on labels and types with stricter conditions
        if (label.includes('name') && !label.includes('username') && type === 'text') {
          userName = userName || value // Only set if not already set
        } else if (label.includes('email') && type === 'email') {
          userEmail = userEmail || value
        } else if ((label.includes('phone') || type === 'phone' || type === 'tel') && !userPhone) {
          userPhone = value
        } else if (label === 'password' && !userPassword) { // Exact match for password
          userPassword = value
        } else if (label.includes('role') && !userRole) {
          userRole = value
        } else if (label.includes('status') && !userStatus) {
          userStatus = value
        }
      }

      console.log("Extracted user data:", { userName, userEmail, userPhone, userPassword, userRole, userStatus })

      // Verify password
      let isPasswordValid = false
      
      if (userPassword) {
        if (userPassword.startsWith('$2')) {
          isPasswordValid = await bcrypt.compare(password, userPassword)
          console.log("Verified hashed password:", isPasswordValid)
        } else {
          isPasswordValid = password === userPassword
          console.log("Verified plain text password:", isPasswordValid)
          // For security, hash the password if it's plain text and update the record
          if (isPasswordValid && !userPassword.startsWith('$2')) {
            const hashedPassword = await bcrypt.hash(password, 12)
            await DatabaseService.updateFormRecord(userRecord.id, {
              recordData: {
                ...userData,
                [Object.keys(userData).find(key => userData[key].label.toLowerCase() === 'password')!]: {
                  ...userData[Object.keys(userData).find(key => userData[key].label.toLowerCase() === 'password')!],
                  value: hashedPassword
                }
              }
            })
            console.log("Hashed and updated plain text password for user:", userRecord.id)
          }
        }
      } else {
        console.log("No password found in user data")
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid email or password" 
          },
          { status: 401 }
        )
      }

      if (!isPasswordValid) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid email or password" 
          },
          { status: 401 }
        )
      }

      if (userStatus && userStatus !== 'active') {
        return NextResponse.json(
          { 
            success: false, 
            error: "Account is not active. Please contact administrator." 
          },
          { status: 401 }
        )
      }

      const token = jwt.sign(
        { 
          userId: userRecord.id, 
          email: userEmail || email, 
          role: userRole,
          name: userName || 'User'
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      )

      try {
        await DatabaseService.updateUserLastLogin(userRecord.id)
        console.log("Updated last login for user:", userRecord.id)
      } catch (error) {
        console.warn("Failed to update last login:", error)
      }

      return NextResponse.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: userRecord.id,
          email: userEmail || email,
          name: userName || 'User',
          role: userRole,
          phone: userPhone,
          lastLogin: new Date().toISOString()
        }
      })

    } catch (dbError: any) {
      console.error("Database error during authentication:", dbError)
      return NextResponse.json(
        { 
          success: false, 
          error: "Internal server error" 
        },
        { status: 500 }
      )
    }

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