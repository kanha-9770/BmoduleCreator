"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Heart,
  Truck,
  Factory,
  Warehouse,
  Briefcase,
  LayoutDashboard,
  List,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Wallet,
  Clock,
  CreditCard,
  Receipt,
  BookOpen,
  PiggyBank,
  Building,
  Boxes,
  ArrowRightLeft,
  Calculator,
  ShoppingBag,
  Building2,
  FileSignature,
  MessageSquare,
  UsersIcon,
  Tag,
  Megaphone,
  Target,
  Star,
  Activity,
  Calendar,
  Network,
  MapPin,
  Cog,
  CheckCircle,
  Wrench,
  PackageCheck,
  PackageSearch,
  TruckIcon,
  FolderKanban,
  CheckSquare,
  Flag,
  FileTextIcon,
  CalendarDays,
  Timer,
  CalendarClock,
  GraduationCap,
  UserCheck,
  ClipboardList,
  Gift,
  Edit,
  BarChart3,
  ListTree,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { MODULE_CONFIGS } from "@/lib/module-configs"
import type { SubmoduleConfig } from "@/lib/types"

const iconMap = {
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Heart,
  Truck,
  Factory,
  Warehouse,
  Briefcase,
  UserPlus,
  Wallet,
  Clock,
  CreditCard,
  Receipt,
  BookOpen,
  PiggyBank,
  Building,
  Boxes,
  ArrowRightLeft,
  Calculator,
  ShoppingBag,
  Building2,
  FileSignature,
  MessageSquare,
  UsersIcon,
  Tag,
  Megaphone,
  Target,
  Star,
  Activity,
  Calendar,
  Network,
  MapPin,
  Cog,
  CheckCircle,
  Wrench,
  PackageCheck,
  PackageSearch,
  TruckIcon,
  FolderKanban,
  CheckSquare,
  Flag,
  FileTextIcon,
  CalendarDays,
  Timer,
  CalendarClock,
  GraduationCap,
  UserCheck,
  ClipboardList,
  Gift,
  Edit,
  BarChart3,
  ListTree,
}

const pageLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/list", label: "Records", icon: List },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
]

function SubmoduleNav({
  submodule,
  parentPath,
  level = 0,
}: {
  submodule: SubmoduleConfig
  parentPath: string
  level?: number
}) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const hasSubmodules = submodule.submodules && submodule.submodules.length > 0
  const currentPath = `${parentPath}/${submodule.id}`
  const isActive = pathname.startsWith(currentPath)

  const Icon = iconMap[submodule.icon as keyof typeof iconMap] || Package
  const paddingLeft = `${(level + 1) * 1}rem`

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-between text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && "text-sidebar-accent-foreground",
          )}
          style={{ paddingLeft }}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="text-sm truncate">{submodule.name}</span>
          </div>
          <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 transition-transform", isOpen && "rotate-90")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1">
        <div className="space-y-1 mb-2 pb-2 border-b border-sidebar-border/50">
          {pageLinks.map((link) => {
            const PageIcon = link.icon
            const href = `${currentPath}${link.href}`
            const isPageActive = pathname === href

            return (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isPageActive &&
                      "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                  )}
                  style={{ paddingLeft: `${(level + 2) * 1}rem` }}
                >
                  <PageIcon className="h-3 w-3" />
                  <span className="text-xs">{link.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>

        {hasSubmodules &&
          submodule.submodules?.map((sub) => (
            <SubmoduleNav key={sub.id} submodule={sub} parentPath={currentPath} level={level + 1} />
          ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const [openModules, setOpenModules] = React.useState<string[]>(["hrm"])

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-xl font-bold text-sidebar-foreground">ERP System</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {Object.values(MODULE_CONFIGS).map((module) => {
            const Icon = iconMap[module.icon as keyof typeof iconMap]
            const isOpen = openModules.includes(module.id)
            const isActive = pathname.startsWith(`/${module.id}`)

            return (
              <Collapsible key={module.id} open={isOpen} onOpenChange={() => toggleModule(module.id)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{module.name}</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-1 pl-4">
                  <div className="space-y-1 mb-2 pb-2 border-b border-sidebar-border/50">
                    {pageLinks.map((link) => {
                      const PageIcon = link.icon
                      const href = `/${module.id}${link.href}`
                      const isPageActive = pathname === href

                      return (
                        <Link key={href} href={href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start gap-3 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              isPageActive &&
                                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                            )}
                          >
                            <PageIcon className="h-3.5 w-3.5" />
                            <span className="text-sm">{link.label}</span>
                          </Button>
                        </Link>
                      )
                    })}
                  </div>

                  {module.submodules && module.submodules.length > 0 && (
                    <div className="space-y-1">
                      {module.submodules.map((submodule) => (
                        <SubmoduleNav key={submodule.id} submodule={submodule} parentPath={`/${module.id}`} />
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
            <span className="text-xs font-semibold">AD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-sidebar-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@company.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
