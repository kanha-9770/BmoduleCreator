import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = await validateSession(token);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const userId = session.user.id;

    // 🔹 Fetch the user's organizationId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: "User is not associated with an organization" },
        { status: 403 }
      );
    }

    const organizationId = user.organizationId;

    // 🔹 Get role names for the user
    const roles = await prisma.$queryRaw<{ role_name: string }[]>`
      SELECT r.name AS role_name
      FROM user_unit_assignments uua
      JOIN roles r ON r.id = uua.role_id
      WHERE uua.user_id = ${userId}
    `;

    const isAdmin = roles.some((r) => r.role_name === "ADMIN");

    let finalModules: any[] = [];

    if (isAdmin) {
      // 🔹 ADMIN gets ALL active modules for their organization
      finalModules = await prisma.$queryRaw`
        SELECT 
          fm.id AS module_id,
          fm.name AS module_name,
          fm.description,
          fm.icon,
          fm.color,
          fm.path,
          fm.parent_id,
          fm.level,
          fm.sort_order,
          fm.module_type
        FROM form_modules fm
        WHERE fm.is_active = TRUE
        AND fm.organization_id = ${organizationId}
        ORDER BY fm.level ASC, fm.sort_order ASC
      `;
    } else {
      // 🔹 Role-based modules for the user's organization
      const roleBasedModules = await prisma.$queryRaw`
        SELECT DISTINCT 
          fm.id AS module_id,
          fm.name AS module_name,
          fm.description,
          fm.icon,
          fm.color,
          fm.path,
          fm.parent_id,
          fm.level,
          fm.sort_order,
          fm.module_type
        FROM users u
        JOIN user_unit_assignments uua ON uua.user_id = u.id
        JOIN roles r ON r.id = uua.role_id
        JOIN role_permissions rp ON rp.role_id = r.id AND rp.granted = TRUE
        JOIN form_modules fm ON fm.id = rp.module_id AND fm.is_active = TRUE
        WHERE u.id = ${userId}
        AND fm.organization_id = ${organizationId}
      `;

      // 🔹 User-based modules for the user's organization
      const userBasedModules = await prisma.$queryRaw`
        SELECT DISTINCT 
          fm.id AS module_id,
          fm.name AS module_name,
          fm.description,
          fm.icon,
          fm.color,
          fm.path,
          fm.parent_id,
          fm.level,
          fm.sort_order,
          fm.module_type
        FROM users u
        JOIN user_permissions up ON up.user_id = u.id AND up.granted = TRUE
        JOIN form_modules fm ON fm.id = up.module_id AND fm.is_active = TRUE
        WHERE u.id = ${userId}
        AND fm.organization_id = ${organizationId}
      `;

      // 🔹 Deduplicate modules
      const allModules = [
        ...(roleBasedModules as any[]),
        ...(userBasedModules as any[]),
      ];

      const uniqueModules = allModules.reduce((acc, current) => {
        if (!acc.find((m: any) => m.module_id === current.module_id)) {
          acc.push(current);
        }
        return acc;
      }, [] as any[]);

      const childModuleIds = uniqueModules.map(
        (m: { module_id: any }) => m.module_id
      );

      // 🔹 Fetch parent hierarchy for allowed modules within the organization
      const parentModules = await prisma.$queryRaw`
        WITH RECURSIVE parent_hierarchy AS (
          SELECT DISTINCT 
            fm.id AS module_id,
            fm.name AS module_name,
            fm.description,
            fm.icon,
            fm.color,
            fm.path,
            fm.parent_id,
            fm.level,
            fm.sort_order,
            fm.module_type
          FROM form_modules fm
          WHERE fm.id IN (
            SELECT DISTINCT parent_id 
            FROM form_modules 
            WHERE id = ANY(${childModuleIds}::text[]) 
            AND parent_id IS NOT NULL
            AND organization_id = ${organizationId}
          )
          AND fm.is_active = TRUE
          AND fm.organization_id = ${organizationId}
          
          UNION
          
          SELECT DISTINCT
            fm.id AS module_id,
            fm.name AS module_name,
            fm.description,
            fm.icon,
            fm.color,
            fm.path,
            fm.parent_id,
            fm.level,
            fm.sort_order,
            fm.module_type
          FROM form_modules fm
          INNER JOIN parent_hierarchy ph ON fm.id = ph.parent_id
          WHERE fm.is_active = TRUE
          AND fm.organization_id = ${organizationId}
        )
        SELECT * FROM parent_hierarchy
      `;

      // 🔹 Merge and deduplicate
      const allVisibleModules = [...uniqueModules, ...(parentModules as any[])];
      finalModules = allVisibleModules.reduce((acc, current) => {
        if (!acc.find((m: any) => m.module_id === current.module_id)) {
          acc.push(current);
        }
        return acc;
      }, [] as any[]);

      finalModules.sort(
        (a: any, b: any) => a.level - b.level || a.sort_order - b.sort_order
      );
    }

    return NextResponse.json({ success: true, modules: finalModules });
  } catch (error) {
    console.error("Get permitted modules error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
