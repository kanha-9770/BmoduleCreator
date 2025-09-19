import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession, generateOTP } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";
import { LoginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    console.log("Login API called");
    const body = await request.json();
    console.log("Request body:", body);

    // Validate input
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      console.log("Validation failed:", validation.error);
      return NextResponse.json(
        { error: "Invalid input data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    console.log("Validated data:", { email, hasPassword: !!password });

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    if (!user.email_verified) {
      console.log("User email not verified:", email);
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 400 }
      );
    }

    // If password is provided and user has a password, verify it
    if (password) {
      if (user.password) {
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
          console.log("Invalid password for user:", email);
          // Increment login attempts
          await prisma.user.update({
            where: { id: user.id },
            data: {
              login_attempts: (user.login_attempts || 0) + 1,
            },
          });

          return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 400 }
          );
        }
      } else {
        console.log("Password login not available for user:", email);
        return NextResponse.json(
          { error: "Password login not available for this account" },
          { status: 400 }
        );
      }
    } else {
      // Passwordless login - send OTP
      try {
        console.log("Sending OTP for passwordless login:", email);
        const otp = generateOTP();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

        // Create or update OTP for login
        await prisma.oTPCode.upsert({
          where: {
            userId_type: {
              userId: user.id,
              type: "LOGIN",
            },
          },
          create: {
            userId: user.id,
            code: otp,
            type: "LOGIN",
            expiresAt,
          },
          update: {
            code: otp,
            expiresAt,
            used: false,
            attempts: 0,
          },
        });

        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, "login");

        if (!emailResult.success) {
          console.log("Failed to send OTP email:", emailResult.error);
          return NextResponse.json(
            { error: "Failed to send login code" },
            { status: 500 }
          );
        }

        console.log("OTP sent successfully for user:", email);
        return NextResponse.json({
          success: true,
          message: "Login code sent to your email",
          userId: user.id,
          requiresOTP: true,
        });
      } catch (error) {
        console.error("Passwordless login error:", error);
        return NextResponse.json(
          { error: "Failed to send login code" },
          { status: 500 }
        );
      }
    }

    // Reset login attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        login_attempts: 0,
      },
    });

    // Create session
    const session = await createSession(
      user.id,
      request.headers.get("x-forwarded-for") || "unknown",
      request.headers.get("user-agent") || "unknown"
    );

    console.log("Login successful for user:", email);
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_verified,
      },
    });

    // Set authentication cookie
    console.log("Setting auth cookie with token");
    response.cookies.set("auth-token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    console.log("Login response prepared with cookie");
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : String(error),
      },
      { status: 500 }
    );
  }
}
