import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching menu permissions for user:", session.user.id);

    // Get user's permissions for all modules and submodules
    const userPermissions = await prisma.masterTable.findMany({
      where: {
        employeeId: session.user.id,
      },
      include: {
        module: true,
        submodule: true,
      },
    });

    console.log("User permissions found:", userPermissions.length);

    // Get all modules (based on your actual schema structure)
    const allModules = await prisma.module.findMany({
      orderBy: {
        moduleName: "asc",
      },
    });

    // Get all submodules
    const allSubmodules = await prisma.submodule.findMany({
      orderBy: {
        submoduleName: "asc",
      },
    });

    console.log("Active modules found:", allModules.length);
    console.log("Active submodules found:", allSubmodules.length);

    // Group submodules by module
    const moduleSubmodules: { [key: number]: any[] } = {};
    allSubmodules.forEach((submodule) => {
      if (!moduleSubmodules[submodule.moduleId]) {
        moduleSubmodules[submodule.moduleId] = [];
      }
      moduleSubmodules[submodule.moduleId].push(submodule);
    });

    // Transform permissions into a structured format
    const modulePermissions: any = {};

    // Initialize all modules and submodules with false permissions
    allModules.forEach((module) => {
      const moduleKey = module.moduleName.toLowerCase().replace(/\s+/g, "_");
      modulePermissions[moduleKey] = {};

      const submodules = moduleSubmodules[module.id] || [];
      submodules.forEach((submodule) => {
        const submoduleKey = submodule.submoduleName
          .toLowerCase()
          .replace(/\s+/g, "_");
        modulePermissions[moduleKey][submoduleKey] = {
          view: false,
          add: false,
          edit: false,
          delete: false,
        };
      });
    });

    // Apply user's actual permissions with better logic
    userPermissions.forEach((permission) => {
      const moduleKey = permission.module.moduleName
        .toLowerCase()
        .replace(/\s+/g, "_");

      if (permission.submodule) {
        // Specific submodule permission
        const submoduleKey = permission.submodule.submoduleName
          .toLowerCase()
          .replace(/\s+/g, "_");
        if (
          modulePermissions[moduleKey] &&
          modulePermissions[moduleKey][submoduleKey]
        ) {
          modulePermissions[moduleKey][submoduleKey] = {
            view: permission.view || false,
            add: permission.create || false,
            edit: permission.edit || false,
            delete: permission.delete || false,
          };
        }
      } else {
        // Module-level permission - apply to all submodules of this module
        if (modulePermissions[moduleKey]) {
          Object.keys(modulePermissions[moduleKey]).forEach((submoduleKey) => {
            modulePermissions[moduleKey][submoduleKey] = {
              view: permission.view || false,
              add: permission.create || false,
              edit: permission.edit || false,
              delete: permission.delete || false,
            };
          });
        }
      }
    });

    // Filter out modules with no accessible submodules and transform for frontend
    const transformedModules = allModules
      .map((module) => {
        const moduleKey = module.moduleName.toLowerCase().replace(/\s+/g, "_");
        const modulePerms = modulePermissions[moduleKey] || {};
        const submodules = moduleSubmodules[module.id] || [];

        // Check if any submodule has view permission
        const hasAccessibleSubmodules = Object.values(modulePerms).some(
          (perm: any) => perm.view === true
        );

        if (!hasAccessibleSubmodules) {
          return null; // Filter out this module
        }

        // Only include submodules that the user has view permission for
        const accessibleSubmodules = submodules.filter((sub) => {
          const submoduleKey = sub.submoduleName
            .toLowerCase()
            .replace(/\s+/g, "_");
          return modulePerms[submoduleKey]?.view === true;
        });

        return {
          id: moduleKey,
          name: module.moduleName,
          description: "", // Add description field to your schema if needed
          icon: "Package", // Add icon field to your schema if needed
          permissions: modulePerms,
          subModules: accessibleSubmodules.map((sub) => ({
            id: sub.submoduleName.toLowerCase().replace(/\s+/g, "_"),
            name: sub.submoduleName,
            description: "", // Add description field to submodule schema if needed
          })),
        };
      })
      .filter(Boolean); // Remove null entries

    console.log(
      "Filtered modules with accessible submodules:",
      transformedModules.length
    );

    return NextResponse.json({
      modules: transformedModules,
      userRole: session.user.role,
      userDepartment: session.user.department,
    });
  } catch (error) {
    console.error("Error fetching user menu permissions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch menu permissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
