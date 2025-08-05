"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
}

interface MenuItem {
  id: string
  title: string
  href?: string
  icon?: string
  children?: MenuItem[]
}

interface SidebarContentProps {
  menuItems: MenuItem[]
  pathname: string
  menuData: MenuData | null
  error: string | null
  expandedItems: string[]
  toggleExpanded: (title: string) => void
  onItemClick?: () => void
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
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
          ERP System
        </h1>
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
              const IconComponent =
                iconMap[item.icon as keyof typeof iconMap] || Package

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
                        <span className="flex-1 text-left truncate">
                          {item.title}
                        </span>
                        {expandedItems.includes(item.title) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      {expandedItems.includes(item.title) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href!}
                              onClick={onItemClick}
                            >
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start h-8 text-sm",
                                  pathname === child.href
                                    ? "bg-blue-50 text-blue-700 hover:bg-blue-50"
                                    : "hover:bg-gray-100"
                                )}
                              >
                                <span className="flex-1 text-left truncate">
                                  {child.title}
                                </span>
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
                        <span className="flex-1 text-left truncate">
                          {item.title}
                        </span>
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

  useEffect(() => {
    async function fetchMenuData() {
      try {
        setLoading(true)
        setError(null)

        console.log("[DynamicSidebar] Fetching modules")

        const response = await fetch("/api/modules")

        const data = await response.json()

        console.log("Fetched modules at sidebar:", data)

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch modules")
        }

        setMenuData({
          modules: data.data || [],
        })
      } catch (error) {
        console.error("Error fetching menu data:", error)
        setError(
          error instanceof Error ? error.message : "Failed to load menu"
        )
        setMenuData({
          modules: [],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMenuData()
  }, [])

  const transformMenuData = (modules: Module[]): MenuItem[] => {
    const baseMenuItems: MenuItem[] = []

    const createMenuItem = (module: Module, parentPath = ""): MenuItem => {
      const modulePath = parentPath
        ? `${parentPath}/${module.path}`
        : module.path

      const href =
        module.moduleType === "child"
          ? `/${modulePath}?id=${module.id}`
          : `/${modulePath}`

      const moduleChildren: MenuItem[] = (module.children || []).map((child) =>
        createMenuItem(child, modulePath)
      )

      return {
        id: module.id,
        title: module.name,
        href: href,
        icon: module.icon || "Package",
        children: moduleChildren.length > 0 ? moduleChildren : undefined,
      }
    }

    modules.forEach((module) => {
      const menuItem = createMenuItem(module)
      baseMenuItems.push(menuItem)
    })

    console.log(
      `[DynamicSidebar] Created ${baseMenuItems.length} menu items from ${modules.length} modules`
    )
    return baseMenuItems
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  if (loading) {
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
            <Button
              variant="outline"
              size="icon"
              className="bg-white shadow-md"
            >
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

      {/* Desktop Sidebar */}
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
  )
}