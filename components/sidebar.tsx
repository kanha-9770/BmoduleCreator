'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  FileText,
  Settings,
  Database,
  Activity,
  Shield,
  Folder,
  Menu,
  X,
  Building2,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Module {
  module_id: string
  module_name: string
  description?: string
  icon?: string
  color?: string
  path?: string
  parent_id?: string
  level: number
  sort_order: number
  module_type: string
}

interface User {
  id: string
  email: string
  name: string
}

// Icon mapping for different module types
const getModuleIcon = (iconName?: string, moduleType?: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'home': Home,
    'users': Users,
    'file-text': FileText,
    'settings': Settings,
    'database': Database,
    'activity': Activity,
    'shield': Shield,
    'folder': Folder,
    'building2': Building2,
  }

  if (iconName && iconMap[iconName]) {
    return iconMap[iconName]
  }

  // Fallback icons based on module type
  switch (moduleType) {
    case 'admin': return Shield
    case 'user': return Users
    case 'form': return FileText
    case 'data': return Database
    case 'master': return Shield // Added for 'master' type in your sample data
    default: return Folder
  }
}

export function DynamicSidebar() {
  const [modules, setModules] = useState<Module[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()

  // Function to generate path from module_name if path is null/undefined
  const generatePath = (module: Module): string => {
    if (module.path) {
      return module.path
    }
    // Convert module_name to kebab-case slug for routing (e.g., "Admin" -> "/admin")
    const slug = module.module_name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
    return `/${slug || 'module'}` // Fallback to '/module' if slug is empty
  }

  // Fetch user data
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        throw new Error('Failed to fetch user data')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setError('Failed to load user data')
    }
  }

  // Fetch permitted modules
  const fetchModules = async () => {
    try {
      const response = await fetch('/api/user/permitted-modules')
      if (response.ok) {
        const data = await response.json()
        console.log("i am akash ", data)
        setModules(data.modules || [])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch modules')
      }
    } catch (error: any) {
      console.error('Error fetching modules:', error)
      setError(error.message || 'Failed to load modules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
    fetchModules()
  }, [])

  // Build hierarchical structure
  const buildModuleTree = (modules: Module[]): Module[] => {
    const moduleMap = new Map<string, Module & { children: Module[] }>()

    // Initialize all modules
    modules.forEach(module => {
      moduleMap.set(module.module_id, { ...module, children: [] })
    })

    const rootModules: (Module & { children: Module[] })[] = []

    // Build tree structure
    modules.forEach(module => {
      const moduleWithChildren = moduleMap.get(module.module_id)!

      if (module.parent_id && module.parent_id !== null && moduleMap.has(module.parent_id)) {
        const parent = moduleMap.get(module.parent_id)!
        parent.children.push(moduleWithChildren)
      } else {
        // This is a root module (no parent_id or parent not found)
        rootModules.push(moduleWithChildren)
      }
    })

    // Recursively sort all modules by sort_order
    const sortModules = (modules: (Module & { children: Module[] })[]) => {
      modules.forEach(module => {
        if (module.children.length > 0) {
          module.children.sort((a, b) => a.sort_order - b.sort_order)
          // Cast children to correct type for recursion
          sortModules(module.children as (Module & { children: Module[] })[])
        }
      })
      return modules.sort((a, b) => a.sort_order - b.sort_order)
    }

    return sortModules(rootModules)
  }

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const handleModuleClick = (module: Module & { children?: Module[] }) => {
    const moduleHasChildren = hasChildren(module)

    if (moduleHasChildren) {
      // If it has children, toggle expand/collapse
      toggleModule(module.module_id)
    } else {
      // For leaf modules, navigate using generated or existing path with name and id
      const generatedPath = generatePath(module)
      router.push(`${generatedPath}?name=${encodeURIComponent(module.module_name)}&id=${encodeURIComponent(module.module_id)}`)
      setIsMobileOpen(false)
    }
  }

  const hasChildren = (module: Module & { children?: Module[] }) => {
    return module.children && module.children.length > 0
  }

  const renderModule = (module: Module & { children?: Module[] }, depth = 0) => {
    const IconComponent = getModuleIcon(module.icon, module.module_type)
    const moduleHasChildren = hasChildren(module)
    const isExpanded = expandedModules.has(module.module_id)
    
    // Generate href only for leaf modules (no children); use '#' for parents to prevent navigation
    const href = !moduleHasChildren 
      ? `${generatePath(module)}?name=${encodeURIComponent(module.module_name)}&id=${encodeURIComponent(module.module_id)}` 
      : '#'

    return (
      <div key={module.module_id} className="w-full">
        <Link
          href={href}
          className={cn(
            "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group block",
            moduleHasChildren
              ? "hover:bg-blue-50 dark:hover:bg-blue-900/20"
              : "hover:bg-gray-100 dark:hover:bg-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            moduleHasChildren && "font-semibold",
            depth > 0 && !isCollapsed && "ml-4"
          )}
          style={{ paddingLeft: isCollapsed ? '12px' : `${depth * 16 + 12}px` }}
          onClick={(e) => {
            if (moduleHasChildren) {
              e.preventDefault() // Prevent navigation for parent modules
              toggleModule(module.module_id)
            } else {
              // For leaf modules, allow default Link navigation (which uses href)
              // handleModuleClick is called separately if needed, but Link handles it
            }
          }}
        >
          <div className="flex items-center flex-1 min-w-0">
            <div
              className={cn(
                "flex-shrink-0 w-5 h-5 mr-3 transition-colors duration-200",
                module.color ? `text-[${module.color}]` :
                  moduleHasChildren
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
              )}
            >
              <IconComponent className="w-5 h-5" />
            </div>

            {!isCollapsed && (
              <>
                <span className="truncate text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                  {module.module_name}
                </span>

                {moduleHasChildren && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    ({module.children!.length})
                  </span>
                )}
              </>
            )}
          </div>

          {!isCollapsed && moduleHasChildren && (
            <div className="flex-shrink-0 ml-2">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400 transition-transform duration-200" />
              )}
            </div>
          )}
        </Link>

        {!isCollapsed && moduleHasChildren && isExpanded && (
          <div className="mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 ml-6">
            {module.children!.map(child => renderModule(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const moduleTree = buildModuleTree(modules)

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out lg:static lg:inset-0",
        isCollapsed ? "w-16" : "w-60",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {!isCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Admin Panel
                  </h1>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
            )}
            <button
              className="hidden lg:block absolute -right-3 p-1 rounded-full bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft className={cn(
                "w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-200",
                isCollapsed && "rotate-180"
              )} />
            </button>
          </div>

          {/* Navigation */}
          <div className={cn(
            "flex-1 overflow-y-auto",
            isCollapsed ? "p-2" : "p-4"
          )}>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className={cn(
                "p-4 bg-red-50 dark:bg-red-900/20 rounded-lg",
                isCollapsed && "flex justify-center p-2"
              )}>
                <p className={cn(
                  "text-sm text-red-600 dark:text-red-400",
                  isCollapsed && "sr-only"
                )}>{error}</p>
              </div>
            ) : modules.length === 0 ? (
              <div className={cn(
                "p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg",
                isCollapsed && "flex justify-center p-2"
              )}>
                <p className={cn(
                  "text-sm text-yellow-600 dark:text-yellow-400",
                  isCollapsed && "sr-only"
                )}>
                  No modules available
                </p>
              </div>
            ) : (
              <nav className="space-y-1">
                {moduleTree.map(module => renderModule(module))}
              </nav>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <Link href="/profile">
                  <Users className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </Link>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}