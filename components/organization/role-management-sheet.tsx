"use client"

import { useRoles } from "@/context/role-context"
import { RoleTreeNode } from "./role-tree-node"
import { StatisticsPopup } from "./statistics-popup"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import {
  ExpandIcon,
  ShrinkIcon,
  Plus,
  Users,
  Database,
  Shield,
  X,
  ChevronUp,
  ChevronDown,
  BarChart3,
  Maximize2,
  Minimize2,
} from "lucide-react"
import type { Role } from "@/types/role"
import { cn } from "@/lib/utils"

export function RoleManagementSheet() {
  const { state, dispatch } = useRoles()

  const handleExpandAll = () => {
    dispatch({ type: "EXPAND_ALL" })
  }

  const handleCollapseAll = () => {
    dispatch({ type: "COLLAPSE_ALL" })
  }

  const handleCreateRoot = () => {
    dispatch({
      type: "SELECT_ROLE",
      payload: {
        role: {
          id: "new",
          name: "",
          description: "",
          shareDataWithPeers: false,
          level: 0,
          children: [],
          parentId: undefined,
        },
      },
    })
  }

  const handleClose = () => {
    dispatch({ type: "CLOSE_ROLE_SHEET" })
  }

  const handleToggleHeader = () => {
    dispatch({ type: "TOGGLE_HEADER_COLLAPSE" })
  }

  const handleToggleTreeOnly = () => {
    dispatch({ type: "TOGGLE_TREE_ONLY_MODE" })
  }

  const handleOpenStats = () => {
    dispatch({ type: "TOGGLE_STATS_POPUP" })
  }

  const getTotalNodes = (roles: Role[]): number => {
    return roles.reduce((total, role) => {
      return total + 1 + getTotalNodes(role.children)
    }, 0)
  }

  const getMaxDepth = (roles: Role[]): number => {
    if (roles.length === 0) return 0
    return Math.max(...roles.map((role) => 1 + getMaxDepth(role.children)))
  }

  const getSharedRoles = (roles: Role[]): number => {
    return roles.reduce((total, role) => {
      const current = role.shareDataWithPeers ? 1 : 0
      return total + current + getSharedRoles(role.children)
    }, 0)
  }

  return (
    <Sheet open={state.isRoleSheetOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[900px] sm:max-w-[900px] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Role Hierarchy Management
                </SheetTitle>
                <SheetDescription className="text-gray-600 mt-1">
                  Define and manage organizational roles with the same hierarchical tree structure
                </SheetDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Collapsible Statistics Dashboard */}
          {!state.isTreeOnlyMode && (
            <div className={cn("transition-all duration-300", state.isHeaderCollapsed && "pb-2")}>
              {!state.isHeaderCollapsed && (
                <div className="px-6 py-4 border-b bg-white">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">Total Roles</p>
                      <p className="text-xl font-semibold text-gray-900">{getTotalNodes(state.roles)}</p>
                    </div>

                    <div className="text-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Database className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">Max Depth</p>
                      <p className="text-xl font-semibold text-gray-900">{getMaxDepth(state.roles)}</p>
                    </div>

                    <div className="text-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-sm text-gray-600">Data Shared</p>
                      <p className="text-xl font-semibold text-gray-900">{getSharedRoles(state.roles)}</p>
                    </div>

                    <div className="text-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <ExpandIcon className="h-5 w-5 text-orange-600" />
                      </div>
                      <p className="text-sm text-gray-600">Expanded</p>
                      <p className="text-xl font-semibold text-gray-900">{state.expandedNodes.size}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Header Toggle Button */}
              <div className="flex justify-center py-2 border-b bg-gray-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleHeader}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {state.isHeaderCollapsed ? (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show Statistics
                    </>
                  ) : (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Hide Statistics
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Control Panel */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button onClick={handleCreateRoot} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Root Role
                </Button>

                {/* Tree-Only Mode Toggle */}
                <Button
                  variant="outline"
                  onClick={handleToggleTreeOnly}
                  className={cn(
                    "border-2 transition-colors",
                    state.isTreeOnlyMode
                      ? "border-purple-500 bg-purple-50 text-purple-700 hover:bg-purple-100"
                      : "border-gray-300 hover:border-purple-300",
                  )}
                >
                  {state.isTreeOnlyMode ? (
                    <>
                      <Minimize2 className="h-4 w-4 mr-2" />
                      Full View
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Tree Only
                    </>
                  )}
                </Button>

                {/* Statistics Popup Button */}
                <Button
                  variant="outline"
                  onClick={handleOpenStats}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistics
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExpandAll}
                  className="text-blue-600 hover:text-blue-700 bg-transparent border-blue-200"
                >
                  <ExpandIcon className="h-4 w-4 mr-1" />
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCollapseAll}
                  className="text-blue-600 hover:text-blue-700 bg-transparent border-blue-200"
                >
                  <ShrinkIcon className="h-4 w-4 mr-1" />
                  Collapse All
                </Button>
              </div>
            </div>
          </div>

          {/* Role Tree */}
          <div
            className={cn(
              "flex-1 overflow-auto px-6 bg-white transition-all duration-300",
              state.isTreeOnlyMode ? "py-2" : "py-4",
            )}
          >
            {state.roles.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No roles defined yet</p>
                <Button onClick={handleCreateRoot} className="bg-blue-600 hover:bg-blue-700">
                  Create Your First Role
                </Button>
              </div>
            ) : (
              <div className="space-y-0">
                {!state.isTreeOnlyMode && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Role Hierarchy Structure</h3>
                    <p className="text-sm text-blue-700">
                      This hierarchical view shows the complete role structure with reporting relationships and data
                      sharing permissions.
                    </p>
                  </div>
                )}
                <div className="font-mono text-sm">
                  {state.roles.map((role, index) => (
                    <RoleTreeNode
                      key={role.id}
                      role={role}
                      isLast={index === state.roles.length - 1}
                      siblingIndex={index}
                      totalSiblings={state.roles.length}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer with Status */}
          {!state.isTreeOnlyMode && (
            <div className="px-6 py-3 border-t bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Role Management System v2.0
                  </span>
                  <span className="text-gray-400">|</span>
                  <span>Hierarchical Structure Active</span>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <span>
                    {state.expandedNodes.size} of {getTotalNodes(state.roles)} roles expanded
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-green-600 font-medium">{getSharedRoles(state.roles)} roles sharing data</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Popup */}
        <StatisticsPopup
          isOpen={state.isStatsPopupOpen}
          onClose={() => dispatch({ type: "TOGGLE_STATS_POPUP" })}
          type="roles"
          data={state.roles}
          expandedCount={state.expandedNodes.size}
        />
      </SheetContent>
    </Sheet>
  )
}
