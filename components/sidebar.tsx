"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  ShoppingCart,
  Factory,
  Package2,
  Users,
  Ship,
  Package,
  Wrench,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  AlertCircle,
} from "lucide-react";

// Icon mapping for modules
const iconMap = {
  LayoutDashboard,
  ShoppingCart,
  Factory,
  Package2,
  Users,
  Ship,
  Package,
  Wrench,
  Settings,
};

interface Form {
  id: string;
  moduleId: string;
  name: string;
  description: string;
  isPublished: boolean;
  formUrl: string | null;
}

interface Module {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  moduleType: "standard" | "master" | "child";
  level: number;
  path: string;
  isActive: boolean;
  forms: Form[];
  children: Module[];
}

interface Permission {
  id: string;
  name: string;
  category: "READ" | "WRITE" | "DELETE" | "ADMIN" | "SPECIAL";
  resource: string;
}

interface RolePermission {
  roleId: string;
  permissionId: string;
  moduleId: string;
  granted: boolean;
  canDelegate: boolean;
  permission: { name: string; category: string };
  module: { name: string; path: string };
}

interface UserPermission {
  userId: string;
  permissionId: string;
  moduleId: string;
  granted: boolean;
  reason?: string;
  isActive: boolean;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isSystemAdmin: boolean;
  permission: { name: string; category: string };
  module: { name: string; path: string };
}

interface MenuData {
  modules: Module[];
}

interface MenuItem {
  id: string;
  title: string;
  href?: string;
  icon?: string;
  children?: MenuItem[];
}

interface SidebarContentProps {
  menuItems: MenuItem[];
  pathname: string;
  menuData: MenuData | null;
  error: string | null;
  expandedItems: string[];
  toggleExpanded: (title: string) => void;
  onItemClick?: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  status: string;
  createdAt: string;
  unitAssignments?: { roleId: string }[];
  userRoles?: { roleId: string }[];
}

function SidebarContent({
  menuItems,
  pathname,
  menuData,
  error,
  expandedItems,
  toggleExpanded,
  onItemClick,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">ERP System</h1>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.length === 0 && !error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No modules available</p>
            </div>
          ) : (
            menuItems.map((item) => {
              const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Package;
              return (
                <div key={item.id} className="flex flex-col">
                  {item.children && item.children.length > 0 ? (
                    <div>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-2 h-9",
                          "hover:bg-gray-100"
                        )}
                        onClick={() => toggleExpanded(item.title)}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">{item.title}</span>
                        {expandedItems.includes(item.title) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      {expandedItems.includes(item.title) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link key={child.href} href={child.href!} onClick={onItemClick}>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start h-8 text-sm",
                                  pathname === child.href
                                    ? "bg-blue-50 text-blue-700 hover:bg-blue-50"
                                    : "hover:bg-gray-100"
                                )}
                              >
                                <span className="flex-1 text-left truncate">{child.title}</span>
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link href={item.href!} onClick={onItemClick}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-2 h-9",
                          pathname === item.href
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-50"
                            : "hover:bg-gray-100"
                        )}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">{item.title}</span>
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </nav>
      </ScrollArea>
      {error && (
        <div className="px-3 py-2 border-t border-gray-200">
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function DynamicSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log("[DynamicSidebar] Sidebar component mounted, fetching user data");

    async function fetchUserAndPermissions() {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        console.log("[DynamicSidebar] Fetching user data from /api/auth/me");
        const response = await fetch("/api/auth/me");
        console.log("[DynamicSidebar] User fetch response status:", response.status);
        const result = await response.json();
        console.log("[DynamicSidebar] User fetch result:", result);

        if (!response.ok || !result.success || !result.user?.id) {
          console.log("[DynamicSidebar] User fetch failed, redirecting to login");
          setError("User not authenticated");
          toast({
            title: "Error",
            description: "Failed to load user data",
            variant: "destructive",
          });
          router.push("/login");
          return;
        }

        console.log("[DynamicSidebar] User data loaded successfully:", result.user);
        setUser({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          email_verified: result.user.email_verified,
          status: result.user.status,
          createdAt: result.user.createdAt,
          unitAssignments: result.user.unitAssignments || [],
          userRoles: result.user.userRoles || [],
        });

        // Fetch modules and permissions only if user has roles
        const roleId = result.user.unitAssignments?.[0]?.roleId || result.user.userRoles?.[0]?.roleId;
        console.log("[DynamicSidebar] Role ID:", roleId);

        if (!roleId) {
          console.log("[DynamicSidebar] No roleId found, setting empty menu");
          setMenuData({ modules: [] });
          setError("No roles assigned to user");
          toast({
            title: "Warning",
            description: "No roles assigned. Please contact an administrator.",
            variant: "default",
          });
          setLoading(false);
          return;
        }

        const [
          modulesResponse,
          permissionsResponse,
          rolePermissionsResponse,
          userPermissionsResponse,
        ] = await Promise.all([
          fetch(`/api/modules?userId=${result.user.id}`, {
            headers: { Authorization: `Bearer ${result.user.token || ""}` },
          }),
          fetch("/api/permissions", {
            headers: { Authorization: `Bearer ${result.user.token || ""}` },
          }),
          fetch(`/api/role-permissions?roleId=${roleId}`, {
            headers: { Authorization: `Bearer ${result.user.token || ""}` },
          }),
          fetch(`/api/user-permissions?userId=${result.user.id}`, {
            headers: { Authorization: `Bearer ${result.user.token || ""}` },
          }),
        ]);

        const modulesData = await modulesResponse.json();
        const permissionsData = await permissionsResponse.json();
        const rolePermissionsData = await rolePermissionsResponse.json();
        const userPermissionsData = await userPermissionsResponse.json();

        console.log("[DynamicSidebar] Fetched data:", {
          modules: modulesData,
          permissions: permissionsData,
          rolePermissions: rolePermissionsData,
          userPermissions: userPermissionsData,
        });

        if (!modulesData.success) {
          throw new Error(modulesData.error || "Failed to fetch modules");
        }
        if (!permissionsData.success) {
          throw new Error(permissionsData.error || "Failed to fetch permissions");
        }
        if (!rolePermissionsData.success) {
          throw new Error(rolePermissionsData.error || "Failed to fetch role permissions");
        }
        if (!userPermissionsData.success) {
          throw new Error(userPermissionsData.error || "Failed to fetch user permissions");
        }

        setMenuData({ modules: modulesData.data || [] });
        setPermissions(permissionsData.data || []);
        setRolePermissions(rolePermissionsData.data || []);
        setUserPermissions(userPermissionsData.data || []);
      } catch (error) {
        console.error("[DynamicSidebar] Error fetching data:", error);
        setError(error instanceof Error ? error.message : "Failed to load data");
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load data",
          variant: "destructive",
        });
        setMenuData({ modules: [] });
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndPermissions();
  }, [router, toast]);

  const hasPermissionForModule = (moduleId: string): boolean => {
    console.log("[DynamicSidebar] Checking permissions for moduleId:", moduleId);

    // Check for system admin
    const isSystemAdmin = userPermissions.some((up) => up.isSystemAdmin);
    if (isSystemAdmin) {
      console.log("[DynamicSidebar] User is system admin, granting access to moduleId:", moduleId);
      return true;
    }

    const userHasPermission = userPermissions.some((up) => {
      const match =
        up.userId === user?.id &&
        up.moduleId === moduleId &&
        up.granted &&
        up.isActive &&
        up.canView;
      console.log("[DynamicSidebar] User permission check:", {
        userId: up.userId,
        moduleId: up.moduleId,
        granted: up.granted,
        isActive: up.isActive,
        canView: up.canView,
        match,
      });
      return match;
    });

    if (userHasPermission) {
      console.log("[DynamicSidebar] User has permission for moduleId:", moduleId);
      return true;
    }

    const userRoleId = user?.unitAssignments?.[0]?.roleId || user?.userRoles?.[0]?.roleId;
    console.log("[DynamicSidebar] User roleId:", userRoleId);

    if (!userRoleId) {
      console.log("[DynamicSidebar] No roleId found for user, denying access");
      return false;
    }

    const roleHasPermission = rolePermissions.some((rp) => {
      const match = rp.roleId === userRoleId && rp.moduleId === moduleId && rp.granted;
      console.log("[DynamicSidebar] Role permission check:", {
        roleId: rp.roleId,
        moduleId: rp.moduleId,
        granted: rp.granted,
        match,
      });
      return match;
    });

    console.log("[DynamicSidebar] Role permission result for moduleId:", moduleId, roleHasPermission);
    return roleHasPermission;
  };

  const transformMenuData = (modules: Module[]): MenuItem[] => {
    const baseMenuItems: MenuItem[] = [];

    const createMenuItem = (module: Module, parentPath = ""): MenuItem | null => {
      console.log("[DynamicSidebar] Processing module:", module.id, module.name);

      const modulePath = parentPath ? `${parentPath}/${module.path}` : module.path;
      const href =
        module.moduleType === "child" ? `/${modulePath}?id=${module.id}` : `/${modulePath}`;

      const moduleChildren: MenuItem[] = (module.children || [])
        .map((child) => createMenuItem(child, modulePath))
        .filter((child): child is MenuItem => child !== null);

      const hasDirectPermission = hasPermissionForModule(module.id);
      console.log("[DynamicSidebar] Module permission check:", {
        moduleId: module.id,
        hasDirectPermission,
        hasChildren: moduleChildren.length > 0,
      });

      if (!hasDirectPermission && moduleChildren.length === 0) {
        console.log("[DynamicSidebar] Skipping module (no permissions or children):", module.id);
        return null;
      }

      const menuItem = {
        id: module.id,
        title: module.name,
        href: href,
        icon: module.icon || "Package",
        children: moduleChildren.length > 0 ? moduleChildren : undefined,
      };

      console.log("[DynamicSidebar] Created menu item:", menuItem.id, menuItem.title);
      return menuItem;
    };

    modules.forEach((module) => {
      const menuItem = createMenuItem(module);
      if (menuItem) {
        baseMenuItems.push(menuItem);
        console.log("[DynamicSidebar] Added menu item:", menuItem.id);
      }
    });

    console.log("[DynamicSidebar] Total menu items created:", baseMenuItems.length);
    return baseMenuItems;
  };

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <>
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" disabled>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
          <div className="p-[1.4rem] border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">ERP System</h1>
            <p className="text-xs text-gray-500 mt-1">Loading...</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </>
    );
  }

  const modules = menuData?.modules || [];
  const menuItems = transformMenuData(modules);

  if (menuItems.length === 0 && !error) {
    setError("No accessible modules available");
    toast({
      title: "Warning",
      description: "No accessible modules available. Please contact an administrator.",
      variant: "default",
    });
  }

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white shadow-md">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 sm:w-96">
            <SidebarContent
              menuItems={menuItems}
              pathname={pathname}
              menuData={menuData}
              error={error}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
              onItemClick={handleMobileMenuClose}
            />
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        <SidebarContent
          menuItems={menuItems}
          pathname={pathname}
          menuData={menuData}
          error={error}
          expandedItems={expandedItems}
          toggleExpanded={toggleExpanded}
        />
      </div>
    </>
  );
}