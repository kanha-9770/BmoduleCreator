"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePermissions } from "@/lib/permission-context"
import { ApiClient } from "@/lib/api-client"
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
  Shield,
  Brain,
  Database,
  BarChart3,
  Menu,
  AlertCircle,
} from "lucide-react"

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
  Shield,
  Brain,
  Database,
  BarChart3,
}

interface Form {
  id: string
  moduleId: string
  name: string
  description: string
  isPublished: boolean
  formUrl: string | null
}

interface Module {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  moduleType: "standard" | "master" | "child"
  level: number
  path: string
  isActive: boolean
  forms: Form[]
  children: Module[]
}

interface MenuData {
  modules: Module[]
  userRole: string
  userDepartment: string
}

interface MenuItem {
  id: string
  title: string
  href?: string
  icon?: string
  children?: MenuItem[]
  hasPermission: boolean
  permissionLevel: {
    view: boolean
    add: boolean
    edit: boolean
    delete: boolean
    manage: boolean
  }
}

interface SidebarContentProps {
  menuItems: MenuItem[]
  pathname: string
  menuData: MenuData | null
  error: string | null
  expandedItems: string[]
  toggleExpanded: (title: string) => void
  onItemClick?: () => void
  user: any
  permissions: any[]
  isSystemAdmin: boolean
}

function SidebarContent({
  menuItems,
  pathname,
  menuData,
  error,
  expandedItems,
  toggleExpanded,
  onItemClick,
  user,
  permissions,
  isSystemAdmin,
}: SidebarContentProps) {
  const getPermissionBadge = (permissionLevel: any) => {
    const permissionsList = []
    if (permissionLevel.view) permissionsList.push("V")
    if (permissionLevel.add) permissionsList.push("A")
    if (permissionLevel.edit) permissionsList.push("E")
    if (permissionLevel.delete) permissionsList.push("D")
    if (permissionLevel.manage) permissionsList.push("M")

    if (permissionsList.length === 0) return null

    const badgeColor = permissionLevel.manage
      ? "bg-green-100 text-green-800 border-green-300"
      : permissionsList.length >= 3
        ? "bg-blue-100 text-blue-800 border-blue-300"
        : "bg-gray-100 text-gray-800 border-gray-300"

    return (
      <Badge variant="outline" className={cn("text-xs ml-auto", badgeColor)}>
        {permissionsList.join("")}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">ERP System</h1>
        <div className="text-xs text-gray-500 mt-1">
          <p>
            {user?.name || "Loading..."} ({user?.role || menuData?.userRole || "User"})
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span>{permissions.length} permissions</span>
            {isSystemAdmin && (
              <Badge variant="destructive" className="text-xs">
                Admin
              </Badge>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.length === 0 && !error ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No accessible modules</p>
              <p className="text-xs text-gray-400 mt-1">Contact your administrator for access</p>
            </div>
          ) : (
            menuItems.map((item) => {
              if (!item.hasPermission) return null

              const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Package

              return (
                <div key={item.id} className="flex flex-col">
                  {item.children && item.children.length > 0 ? (
                    <div>
                      <Button
                        variant="ghost"
                        className={cn("w-full justify-start gap-2 h-9", "hover:bg-gray-100")}
                        onClick={() => toggleExpanded(item.title)}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">{item.title}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {getPermissionBadge(item.permissionLevel)}
                          {expandedItems.includes(item.title) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </Button>
                      {expandedItems.includes(item.title) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((child) => {
                            if (!child.hasPermission) return null
                            return (
                              <Link key={child.href} href={child.href!} onClick={onItemClick}>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start h-8 text-sm",
                                    pathname === child.href
                                      ? "bg-blue-50 text-blue-700 hover:bg-blue-50"
                                      : "hover:bg-gray-100",
                                  )}
                                >
                                  <span className="flex-1 text-left truncate">{child.title}</span>
                                  {getPermissionBadge(child.permissionLevel)}
                                </Button>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link href={item.href!} onClick={onItemClick}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-2 h-9",
                          pathname === item.href ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : "hover:bg-gray-100",
                        )}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">{item.title}</span>
                        {getPermissionBadge(item.permissionLevel)}
                      </Button>
                    </Link>
                  )}
                </div>
              )
            })
          )}
        </nav>
      </ScrollArea>

      {error && (
        <div className="px-3 py-2 border-t border-gray-200">
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Failed to load menu: {error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function DynamicSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Use the permission context
  const {
    user,
    permissions,
    isLoading: permissionsLoading,
    hasModuleAccess,
    hasFormAccess,
    getAccessibleActions,
    isSystemAdmin,
  } = usePermissions()

  useEffect(() => {
    async function fetchMenuData() {
      if (!user || permissionsLoading) return

      try {
        setLoading(true)
        setError(null)

        console.log("[DynamicSidebar] Fetching modules with permission filtering")

        // Use your existing API client with proper authentication
        const response = await ApiClient.get("/api/modules", user.id, user.email)

        console.log("Fetched modules at sidebar:", response)

        if (!response.success) {
          throw new Error(response.error || "Failed to fetch modules")
        }

        setMenuData({
          modules: response.data || [],
          userRole: user.role || "User",
          userDepartment: user.department || "",
        })
      } catch (error) {
        console.error("Error fetching menu data:", error)
        setError(error instanceof Error ? error.message : "Failed to load menu")
        setMenuData({
          modules: [],
          userRole: user?.role || "User",
          userDepartment: user?.department || "",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMenuData()
  }, [user, permissionsLoading])

  const hasModulePermission = (moduleId: string, action: string): boolean => {
    if (!user) return false

    // System admin has all permissions
    if (isSystemAdmin) return true

    // Check ONLY explicit module permission - no inheritance from forms
    const modulePermission = permissions.find((p) => p.resourceType === "module" && p.resourceId === moduleId)

    if (modulePermission) {
      switch (action) {
        case "view":
          return modulePermission.permissions.canView || modulePermission.permissions.canManage
        case "create":
          return modulePermission.permissions.canCreate || modulePermission.permissions.canManage
        case "edit":
          return modulePermission.permissions.canEdit || modulePermission.permissions.canManage
        case "delete":
          return modulePermission.permissions.canDelete || modulePermission.permissions.canManage
        case "manage":
          return modulePermission.permissions.canManage
        default:
          return false
      }
    }

    // No explicit module permission found
    return false
  }

  const getModulePermissions = (moduleId: string) => {
    if (!user) {
      return {
        view: false,
        add: false,
        edit: false,
        delete: false,
        manage: false,
      }
    }

    // System admin has all permissions
    if (isSystemAdmin) {
      return {
        view: true,
        add: true,
        edit: true,
        delete: true,
        manage: true,
      }
    }

    return {
      view: hasModulePermission(moduleId, "view"),
      add: hasModulePermission(moduleId, "create"),
      edit: hasModulePermission(moduleId, "edit"),
      delete: hasModulePermission(moduleId, "delete"),
      manage: hasModulePermission(moduleId, "manage"),
    }
  }

  const transformMenuData = (modules: Module[]): MenuItem[] => {
    if (!user) return []

    const baseMenuItems: MenuItem[] = []

    const createMenuItem = (module: Module, parentPath = ""): MenuItem => {
      const modulePath = parentPath ? `${parentPath}/${module.path}` : module.path

      // Get actual permissions for this specific module (explicit only)
      const permissionLevel = getModulePermissions(module.id)
      const hasAccess = hasModuleAccess(module.id) // This now checks explicit permissions only

      // For child modules, append the ID as a query parameter
      const href = module.moduleType === "child" ? `/${modulePath}?id=${module.id}` : `/${modulePath}`

      // Create children from nested modules - only include if user has explicit permission
      const moduleChildren: MenuItem[] = (module.children || [])
        .map((child) => createMenuItem(child, modulePath))
        .filter((child) => child.hasPermission) // Only include children user has explicit access to

      return {
        id: module.id,
        title: module.name,
        href: href,
        icon: module.icon || "Package",
        hasPermission: hasAccess, // Based on explicit permissions only
        permissionLevel,
        children: moduleChildren.length > 0 ? moduleChildren : undefined,
      }
    }

    modules.forEach((module) => {
      const menuItem = createMenuItem(module)
      // Only add to menu if user has explicit permission for this module
      if (menuItem.hasPermission) {
        baseMenuItems.push(menuItem)
      }
    })

    console.log(`[DynamicSidebar] Created ${baseMenuItems.length} menu items from ${modules.length} modules`)
    return baseMenuItems
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  if (permissionsLoading || loading) {
    return (
      <>
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" disabled>
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop Sidebar */}
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
    )
  }

  const modules = menuData?.modules || []
  const menuItems = transformMenuData(modules)

  return (
    <>
      {/* Mobile Menu Button */}
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
              user={user}
              permissions={permissions}
              isSystemAdmin={isSystemAdmin}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        <SidebarContent
          menuItems={menuItems}
          pathname={pathname}
          menuData={menuData}
          error={error}
          expandedItems={expandedItems}
          toggleExpanded={toggleExpanded}
          user={user}
          permissions={permissions}
          isSystemAdmin={isSystemAdmin}
        />
      </div>
    </>
  )
}
