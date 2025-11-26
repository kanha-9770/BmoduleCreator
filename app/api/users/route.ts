export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {},
      include: {
        unitAssignments: {
          include: {
            unit: true,
            role: true,
          },
        },
        organization: true,
        permissionOverrides: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the expected format
    const transformedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      avatar: user.avatar,
      department: user.department || "",
      unitAssignments: user.unitAssignments,
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, department, organizationId } =
      await request.json();

    const user = await prisma.user.create({
      data: {
        email,
        first_name: firstName,
        last_name: lastName,
        department,
        organizationId: organizationId || "org_default",
      },
      include: {
        unitAssignments: {
          include: {
            unit: true,
            role: true,
          },
        },
      },
    });

    // Transform the response to match expected format
    const transformedUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      avatar: user.avatar,
      department: user.department || "",
      unitAssignments: user.unitAssignments,
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
