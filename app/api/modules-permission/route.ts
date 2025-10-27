import { getModulesWithForms } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log(
      "[v0] GET /api/modules-permission - Starting request for modules with forms"
    );

    const modules = await getModulesWithForms();
    console.log(
      `[v0] Retrieved modules with forms from database: ${modules.length}`
    );

    // Log form counts for debugging
    const totalForms = modules.reduce((total, module) => {
      const moduleForms = module.forms?.length || 0;
      const submoduleForms =
        module.children?.reduce((subTotal: number, child: any) => {
          return subTotal + (child.forms?.length || 0);
        }, 0) || 0;
      console.log(
        `[v0] Module ${module.name}: ${moduleForms} forms, ${submoduleForms} submodule forms`
      );
      return total + moduleForms + submoduleForms;
    }, 0);

    console.log(`[v0] Total forms across all modules: ${totalForms}`);
    console.log(
      "[v0] Successfully retrieved",
      modules.length,
      "modules with forms"
    );

    return NextResponse.json({
      success: true,
      data: modules,
      meta: {
        totalModules: modules.length,
        totalSubmodules: modules.reduce(
          (total, m) => total + (m.children?.length || 0),
          0
        ),
        totalForms: totalForms,
      },
    });
  } catch (error) {
    console.error("[v0] Failed to fetch modules with forms:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch modules with forms",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
