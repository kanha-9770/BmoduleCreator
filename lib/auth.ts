import {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  isValidEmail,
} from "./email";
import { generateSMSOTP, sendOTPSMS, isValidPhoneNumber } from "./sms";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Types for authentication (kept compatible with existing usage)
export interface User {
  id: string;
  email?: string;
  mobile?: string;
  first_name?: string;
  last_name?: string;
  email_verified?: boolean | null;
  mobile_verified?: boolean | null;
  status:
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | "PENDING"
    | "PENDING_VERIFICATION";
  organizationId?: string;
}

export interface OTPData {
  id?: string;
  userId?: string | null;
  identifier: string;
  code: string;
  type:
    | "EMAIL_VERIFICATION"
    | "PASSWORD_RESET"
    | "TWO_FACTOR"
    | "REGISTRATION"
    | "LOGIN"
    | "MOBILE_VERIFICATION";
  expiresAt: Date;
  verified?: boolean;
  attempts?: number;
}

// Map purpose to OTPType (exact enum values in schema)
const mapPurposeToOTPType = (
  purpose: string
):
  | "EMAIL_VERIFICATION"
  | "PASSWORD_RESET"
  | "TWO_FACTOR"
  | "REGISTRATION"
  | "LOGIN"
  | "MOBILE_VERIFICATION" => {
  const normalized = purpose.toUpperCase();
  switch (normalized) {
    case "REGISTRATION":
      return "REGISTRATION";
    case "LOGIN":
      return "LOGIN";
    case "PASSWORD_RESET":
      return "PASSWORD_RESET";
    case "EMAIL_VERIFICATION":
      return "EMAIL_VERIFICATION";
    case "MOBILE_VERIFICATION":
      return "MOBILE_VERIFICATION";
    case "TWO_FACTOR":
      return "TWO_FACTOR";
    default:
      throw new Error(`Invalid purpose: ${purpose}`);
  }
};

/**
 * Helper: bootstrap an organization for a user
 * - organization
 * - Root OrganizationUnit
 * - Admin Role
 * - UserUnitAssignment
 */
async function bootstrapOrganizationForUser(
  tx: typeof prisma,
  userId: string,
  firstName?: string,
  lastName?: string
) {
  const organization = await tx.organization.create({
    data: {
      name:
        `${firstName || "User"} ${lastName || ""}`.trim() + "'s Organization",
    },
  });

  const rootUnit = await tx.organizationUnit.create({
    data: {
      name: "Root",
      description: "Top-level unit",
      organizationId: organization.id,
      level: 0,
      sortOrder: 0,
      isActive: true,
    },
  });

  const adminRole = await tx.role.create({
    data: {
      name: "Admin",
      description: "Organization administrator with full access",
      organizationId: organization.id,
    },
  });

  // Set user's primary organization
  await tx.user.update({
    where: { id: userId },
    data: { organizationId: organization.id },
  });

  // Assign user to root unit with admin role
  await tx.userUnitAssignment.create({
    data: {
      userId,
      unitId: rootUnit.id,
      roleId: adminRole.id,
      notes: "Auto-assigned as organization admin on registration",
    },
  });

  return { organization, rootUnit, adminRole };
}

/**
 * User registration with automatic tenant bootstrap
 */
export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  password: string;
}): Promise<{ success: boolean; userId?: string; error?: string }> => {
  try {
    // Validations
    if (!userData.firstName?.trim())
      return { success: false, error: "First name is required" };
    if (!userData.lastName?.trim())
      return { success: false, error: "Last name is required" };
    if (!isValidEmail(userData.email))
      return { success: false, error: "Invalid email format" };
    if (userData.mobile && !isValidPhoneNumber(userData.mobile)) {
      return { success: false, error: "Invalid mobile number format" };
    }
    if (
      !userData.password ||
      userData.password.length < 8 ||
      !/^(?=.*[0-9])(?=.*[!@#$%^&*])/.test(userData.password)
    ) {
      return {
        success: false,
        error:
          "Password must be 8+ characters with at least one number and one special character",
      };
    }

    // Uniqueness check
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          userData.mobile ? { mobile: userData.mobile } : {},
        ].filter((c) => Object.keys(c).length > 0),
      },
    });
    if (existingUser) {
      return {
        success: false,
        error: `User already exists with this ${
          existingUser.email === userData.email ? "email" : "mobile number"
        }`,
      };
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user first (PENDING_VERIFICATION so OTP flow can activate)
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        mobile: userData.mobile || null,
        first_name: userData.firstName,
        last_name: userData.lastName,
        password: hashedPassword,
        email_verified: false,
        mobile_verified: false,
        status: "PENDING_VERIFICATION",
      },
    });

    // Bootstrap organization so the user is admin immediately
    await prisma.$transaction(async (tx) => {
      await bootstrapOrganizationForUser(
        tx,
        newUser.id,
        userData.firstName,
        userData.lastName
      );
    });

    return { success: true, userId: newUser.id };
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error?.code === "P2002") {
      return {
        success: false,
        error: `A user with this ${
          error.meta?.target?.includes("email") ? "email" : "mobile number"
        } already exists`,
      };
    }
    if (error?.code === "P1001") {
      return { success: false, error: "Database connection failed" };
    }
    return {
      success: false,
      error: `Registration failed: ${error.message || "Unknown error"}`,
    };
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Send OTP for verification/login/reset
 */
export const sendOTP = async (
  identifier: string,
  type: "email" | "mobile",
  purpose:
    | "REGISTRATION"
    | "LOGIN"
    | "PASSWORD_RESET"
    | "EMAIL_VERIFICATION"
    | "MOBILE_VERIFICATION"
    | "TWO_FACTOR"
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (type === "email" && !isValidEmail(identifier))
      return { success: false, error: "Invalid email format" };
    if (type === "mobile" && !isValidPhoneNumber(identifier)) {
      return { success: false, error: "Invalid mobile number format" };
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          type === "email" ? { email: identifier } : {},
          type === "mobile" ? { mobile: identifier } : {},
        ].filter((c) => Object.keys(c).length > 0),
      },
    });

    if (
      !user &&
      !["REGISTRATION", "EMAIL_VERIFICATION", "MOBILE_VERIFICATION"].includes(
        purpose
      )
    ) {
      return { success: false, error: "User not found" };
    }

    const otp = type === "email" ? generateOTP() : generateSMSOTP();
    const otpType = mapPurposeToOTPType(purpose);

    // Clear prior codes for same identifier+type to avoid confusion
    await prisma.OTPCode.deleteMany({
      where: { identifier, type: otpType },
    });

    await prisma.OTPCode.create({
      data: {
        userId: user?.id || null,
        code: otp,
        type: otpType,
        identifier,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false,
        attempts: 0,
      },
    });

    const emailPurpose = purpose.toLowerCase() as
      | "registration"
      | "login"
      | "password_reset";
    let ok = true;
    let err: string | undefined;

    if (type === "email") {
      try {
        ok = await sendOTPEmail(identifier, otp, emailPurpose);
      } catch (e: any) {
        ok = false;
        err = e?.message || "Failed to send email";
      }
    } else {
      const smsRes = await sendOTPSMS(identifier, otp, emailPurpose);
      ok = smsRes.success;
      err = (smsRes as any)?.error;
    }

    if (!ok)
      return { success: false, error: err || `Failed to send OTP via ${type}` };
    return { success: true };
  } catch (error: any) {
    console.error("Send OTP error:", error);
    if (error?.code === "P2002")
      return {
        success: false,
        error: "OTP creation failed due to duplicate entry",
      };
    if (error?.code === "P1001")
      return { success: false, error: "Database connection failed" };
    if (error?.code === "P2003")
      return { success: false, error: "Invalid user ID for OTP creation" };
    return {
      success: false,
      error: `Failed to send OTP: ${error.message || "Unknown error"}`,
    };
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Verify OTP and activate user if appropriate
 */
export const verifyOTP = async (
  identifier: string,
  code: string,
  purpose:
    | "REGISTRATION"
    | "LOGIN"
    | "PASSWORD_RESET"
    | "EMAIL_VERIFICATION"
    | "MOBILE_VERIFICATION"
    | "TWO_FACTOR"
): Promise<{ success: boolean; userId?: string; error?: string }> => {
  try {
    const otpType = mapPurposeToOTPType(purpose);

    const otpRecord = await prisma.OTPCode.findFirst({
      where: { identifier, type: otpType, verified: { equals: false } },
      orderBy: { createdAt: "desc" },
    });
    if (!otpRecord) return { success: false, error: "Invalid or expired OTP" };
    if (new Date() > otpRecord.expiresAt)
      return { success: false, error: "OTP has expired" };
    if ((otpRecord.attempts ?? 0) >= 3)
      return { success: false, error: "Too many failed attempts" };

    if (otpRecord.code !== code) {
      await prisma.OTPCode.update({
        where: { id: otpRecord.id },
        data: { attempts: (otpRecord.attempts ?? 0) + 1 },
      });
      return { success: false, error: "Invalid OTP code" };
    }

    await prisma.OTPCode.update({
      where: { id: otpRecord.id },
      data: { verified: true, used: true },
    });

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { mobile: identifier }] },
    });

    if (
      ["REGISTRATION", "EMAIL_VERIFICATION", "MOBILE_VERIFICATION"].includes(
        otpType
      )
    ) {
      if (user) {
        const updateData: any = {};
        if (user.email === identifier) updateData.email_verified = true;
        if (user.mobile === identifier) updateData.mobile_verified = true;
        if (
          user.email_verified ||
          user.mobile_verified ||
          updateData.email_verified ||
          updateData.mobile_verified
        ) {
          updateData.status = "ACTIVE";
        }

        await prisma.user.update({ where: { id: user.id }, data: updateData });

        if ((updateData.email_verified || user.email_verified) && user.email) {
          await sendWelcomeEmail(user.email, user.first_name || "User");
        }
      }
    }

    return { success: true, userId: user?.id || otpRecord.userId || undefined };
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return {
      success: false,
      error: `OTP verification failed: ${error.message || "Unknown error"}`,
    };
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Login with password
 */
export const loginWithPassword = async (
  identifier: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { mobile: identifier }] },
    });
    if (!user) return { success: false, error: "User not found" };
    if (user.status !== "ACTIVE")
      return { success: false, error: `Account is ${user.status}` };

    const isValidPassword = await bcrypt.compare(password, user.password || "");
    if (!isValidPassword) return { success: false, error: "Invalid password" };

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || undefined,
        mobile: user.mobile || undefined,
        first_name: user.first_name || undefined,
        last_name: user.last_name || undefined,
        email_verified: user.email_verified ?? false,
        mobile_verified: user.mobile_verified ?? false,
        status: user.status,
        organizationId: user.organizationId || undefined,
      },
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      error: `Login failed: ${error.message || "Unknown error"}`,
    };
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Reset password (requires valid PASSWORD_RESET OTP)
 */
export const resetPassword = async (
  identifier: string,
  newPassword: string,
  otpCode: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const otpResult = await verifyOTP(identifier, otpCode, "PASSWORD_RESET");
    if (!otpResult.success) return otpResult;

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { mobile: identifier }] },
    });
    if (!user) return { success: false, error: "User not found" };

    if (
      newPassword.length < 8 ||
      !/^(?=.*[0-9])(?=.*[!@#$%^&*])/.test(newPassword)
    ) {
      return {
        success: false,
        error:
          "New password must be 8+ characters with at least one number and one special character",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: `Password reset failed: ${error.message || "Unknown error"}`,
    };
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || undefined,
      mobile: user.mobile || undefined,
      first_name: user.first_name || undefined,
      last_name: user.last_name || undefined,
      email_verified: user.email_verified ?? false,
      mobile_verified: user.mobile_verified ?? false,
      status: user.status,
      organizationId: user.organizationId || undefined,
    };
  } catch (error: any) {
    console.error("Get user error:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<{ success: boolean; error?: string }> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: updates as any,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return {
      success: false,
      error: `Profile update failed: ${error.message || "Unknown error"}`,
    };
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Create an additional organization for a user (ownerId is unique; a user can own only one).
 */
export async function createOrganizationForUser(
  userId: string,
  name?: string
): Promise<{ success: boolean; organizationId?: string; error?: string }> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found" };

    const { organizationId } = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name:
            name ||
            `${user.first_name || "User"} ${user.last_name || ""}`.trim() +
              "'s Organization",
        },
      });

      const rootUnit = await tx.organizationUnit.create({
        data: {
          name: "Root",
          organizationId: organization.id,
          level: 0,
          sortOrder: 0,
          isActive: true,
        },
      });

      const adminRole = await tx.role.create({
        data: {
          name: "Admin",
          description: "Organization administrator with full access",
          organizationId: organization.id,
        },
      });

      // Set as user's primary org (optional; matches initial bootstrap behavior)
      await tx.user.update({
        where: { id: userId },
        data: { organizationId: organization.id },
      });

      await tx.userUnitAssignment.create({
        data: {
          userId,
          unitId: rootUnit.id,
          roleId: adminRole.id,
          notes: "Auto-assigned as admin (manual org create)",
        },
      });

      return { organizationId: organization.id };
    });

    return { success: true, organizationId };
  } catch (error: any) {
    console.error("Create organization error:", error);
    return { success: false, error: error?.message || "Unknown error" };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Create a role in an organization if the user has an admin role in that org.
 */
export async function createRole(params: {
  userId: string;
  organizationId: string;
  name: string;
  description?: string;
}): Promise<{ success: boolean; roleId?: string; error?: string }> {
  const { userId, organizationId, name, description } = params;

  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) return { success: false, error: "Organization not found" };

    // Permission check: user must have "Admin" role in any unit of the org
    const adminAssignment = await prisma.userUnitAssignment.findFirst({
      where: {
        userId,
        unit: { organizationId },
        role: { name: "Admin" },
      },
      select: { id: true },
    });
    if (!adminAssignment)
      return {
        success: false,
        error: "Forbidden: requires Admin role in this organization",
      };

    const role = await prisma.role.create({
      data: {
        name,
        description,
        organizationId,
      },
    });

    return { success: true, roleId: role.id };
  } catch (error: any) {
    console.error("Create role error:", error);
    return { success: false, error: error?.message || "Unknown error" };
  } finally {
    await prisma.$disconnect();
  }
}
