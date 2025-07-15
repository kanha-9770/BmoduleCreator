import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DynamicModulePage } from "@/components/dynamic-module-page";

interface PageProps {
  params: Promise<{
    modules: string;
    submodules: string;
  }>;
}

// Mock user data (replace with actual user data source)
const mockUser = {
  id: "123",
  name: "John Doe",
  role: "Admin",
  department: "IT",
};

export default async function DynamicSubmodulePage({ params }: PageProps) {
  if (!mockUser.id) {
    notFound();
  }

  try {
    const resolvedParams = await params;
    const moduleSlug = resolvedParams?.modules;
    const submoduleSlug = resolvedParams?.submodules;

    if (!moduleSlug || !submoduleSlug) {
      notFound();
    }

    const module = await prisma.module.findFirst({
      where: {
        moduleName: { equals: moduleSlug, mode: "insensitive" },
      },
    });

    if (!module) {
      notFound();
    }

    const submodule = await prisma.submodule.findFirst({
      where: {
        moduleId: module.id,
        submoduleName: { equals: submoduleSlug, mode: "insensitive" },
      },
    });

    if (!submodule) {
      notFound();
    }

    const userPermission = await prisma.masterTable.findFirst({
      where: {
        employeeId: mockUser.id,
        moduleId: module.id,
        submoduleId: submodule.id,
      },
    });

    const modulePermission = await prisma.masterTable.findFirst({
      where: {
        employeeId: mockUser.id,
        moduleId: module.id,
        submoduleId: null,
      },
    });

    const hasViewPermission = userPermission?.view || modulePermission?.view;

    if (!hasViewPermission) {
      notFound();
    }

    const permissions = {
      view: userPermission?.view || modulePermission?.view || false,
      create: userPermission?.create || modulePermission?.create || false,
      edit: userPermission?.edit || modulePermission?.edit || false,
      delete: userPermission?.delete || modulePermission?.delete || false,
    };

    return <DynamicModulePage module={module} submodule={submodule} permissions={permissions} user={mockUser} />;
  } catch (error) {
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const moduleSlug = resolvedParams?.modules;
    const submoduleSlug = resolvedParams?.submodules;

    if (!moduleSlug || !submoduleSlug) {
      return {
        title: "Module Page",
        description: "Dynamic module page",
      };
    }

    const module = await prisma.module.findFirst({
      where: {
        moduleName: { equals: moduleSlug, mode: "insensitive" },
      },
    });

    if (!module) {
      return {
        title: "Module Page",
        description: "Dynamic module page",
      };
    }

    const subdomain = await prisma.submodule.findFirst({
      where: {
        moduleId: module.id,
        submoduleName: { equals: submoduleSlug, mode: "insensitive" },
      },
    });

    return {
      title: `${subdomain?.submoduleName || submoduleSlug} - ${module?.moduleName || moduleSlug}`,
      description: `${subdomain?.submoduleName || submoduleSlug} module in ${module?.moduleName || moduleSlug}`,
    };
  } catch (error) {
    return {
      title: "Module Page",
      description: "Dynamic module page",
    };
  }
}