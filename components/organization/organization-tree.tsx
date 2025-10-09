"use client";

import { useState, useEffect } from "react";
import { useRoles } from "@/context/role-context";
import { OrganizationTreeNode } from "./organization-tree-node";
import { StatisticsPopup } from "./statistics-popup";
import { Button } from "@/components/ui/button";
import {
  ExpandIcon,
  ShrinkIcon,
  Plus,
  Building2,
  Users,
  Database,
  ChevronUp,
  ChevronDown,
  BarChart3,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { OrganizationUnit } from "@/types/role";
import { cn } from "@/lib/utils";
import { OrganizationUnitFormModal } from "./organization-unit-form-modal";
import { useToast } from "@/hooks/use-toast";

interface Organization {
  id: string;
  name: string;
}

export function OrganizationTree() {
  const { state, dispatch } = useRoles();
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const result = await response.json();
        if (result.user?.organization?.name) {
          setOrganizationName(result.user.organization.name);
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
        toast({
          title: "Error",
          description: "Failed to load organization data",
          variant: "destructive",
        });
      }
    };

    fetchOrganization();
  }, [toast]);

  const handleExpandAll = () => {
    dispatch({ type: "EXPAND_ALL_ORG" });
  };

  const handleCollapseAll = () => {
    dispatch({ type: "COLLAPSE_ALL_ORG" });
  };

  const handleToggleHeader = () => {
    dispatch({ type: "TOGGLE_HEADER_COLLAPSE" });
  };

  const handleToggleTreeOnly = () => {
    dispatch({ type: "TOGGLE_TREE_ONLY_MODE" });
  };

  const handleOpenStats = () => {
    dispatch({ type: "TOGGLE_ORG_STATS_POPUP" });
  };

  const getTotalNodes = (units: OrganizationUnit[]): number => {
    if (!units || !Array.isArray(units)) return 0;
    return units.reduce((total, unit) => {
      return total + 1 + getTotalNodes(unit.children || []);
    }, 0);
  };

  const getMaxDepth = (units: OrganizationUnit[]): number => {
    if (!units || !Array.isArray(units) || units.length === 0) return 0;
    return Math.max(
      ...units.map((unit) => 1 + getMaxDepth(unit.children || []))
    );
  };

  const handleCreateRoot = () => {
    dispatch({
      type: "SELECT_ORG_UNIT",
      payload: {
        unit: {
          id: "new",
          name: "",
          description: "",
          level: 0,
          children: [],
          parentId: undefined,
          assignedRoles: [],
          assignedUsers: [],
        } as OrganizationUnit,
      },
    });
  };

  const organizationUnits = state.organizationUnits || [];

  return (
    <div className="space-y-6">
      {/* Collapsible Header */}
      {!state.isTreeOnlyMode && (
        <div
          className={cn(
            "transition-all duration-300",
            state.isHeaderCollapsed && "mb-2"
          )}
        >
          {!state.isHeaderCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Organization</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {organizationName || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Units</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {getTotalNodes(organizationUnits)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Depth</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {getMaxDepth(organizationUnits)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header Toggle Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleHeader}
              className="text-gray-500 hover:text-gray-700 bg-white border border-gray-200 shadow-sm"
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

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleCreateRoot}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Root Unit
          </Button>

          {/* Tree-Only Mode Toggle */}
          <Button
            variant="outline"
            onClick={handleToggleTreeOnly}
            className={cn(
              "border-2 transition-colors",
              state.isTreeOnlyMode
                ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "border-gray-300 hover:border-blue-300"
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
            className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
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
            className="text-blue-600 hover:text-blue-700 bg-transparent"
          >
            <ExpandIcon className="h-4 w-4 mr-1" />
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCollapseAll}
            className="text-blue-600 hover:text-blue-700 bg-transparent"
          >
            <ShrinkIcon className="h-4 w-4 mr-1" />
            Collapse All
          </Button>
        </div>
      </div>

      {/* Tree */}
      <div
        className={cn(
          "bg-white rounded-lg border border-gray-200 overflow-auto transition-all duration-300",
          state.isTreeOnlyMode
            ? "min-h-[calc(100vh-200px)] p-4"
            : "min-h-[600px] p-6"
        )}
      >
        {organizationUnits.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              No organizational units defined yet
            </p>
            <Button
              onClick={handleCreateRoot}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Your First Unit
            </Button>
          </div>
        ) : (
          <div className="space-y-0">
            {!state.isTreeOnlyMode && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Organizational Structure
                </h3>
                <p className="text-sm text-blue-700">
                  This hierarchical view shows the complete organizational
                  structure with all units and departments for{" "}
                  {organizationName || "your organization"}.
                </p>
              </div>
            )}
            <div className="font-mono text-sm ">
              {organizationUnits.map((unit, index) => (
                <OrganizationTreeNode
                  key={unit.id}
                  unit={unit}
                  isLast={index === organizationUnits.length - 1}
                  siblingIndex={index}
                  totalSiblings={organizationUnits.length}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Statistics Popup */}
      <StatisticsPopup
        isOpen={state.isOrgStatsPopupOpen}
        onClose={() => dispatch({ type: "TOGGLE_ORG_STATS_POPUP" })}
        type="organization"
        data={organizationUnits}
        expandedCount={state.expandedOrgNodes?.size || 0}
      />
      <OrganizationUnitFormModal />
    </div>
  );
}
