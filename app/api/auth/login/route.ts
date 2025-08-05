import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/database-service";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log("Login API called with email:", email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Get user records from form_records_15
    const userRecords = await DatabaseService.getUserRecords(email);
    console.log("User records found:", userRecords.length);

    if (!userRecords || userRecords.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const userRecord = userRecords[0];
    const userData = userRecord.recordData;

    // Extract fields from flat JSON structure
    const userEmail = userData.email || "";
    const userPassword = userData.password || "";
    const userName = userData.name || "User";

    console.log("Extracted user data:", { userName, userEmail });

    // Verify password (plain text comparison)
    if (password !== userPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Return simple success response
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: userRecord.id,
        email: userEmail,
        name: userName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}