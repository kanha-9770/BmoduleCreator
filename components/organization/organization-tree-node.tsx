"use client";

import { useState } from "react";
import type { OrganizationUnit } from "@/types/role";
import { useRoles } from "@/context/role-context";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

interface OrganizationTreeNodeProps {
  unit: OrganizationUnit;
  isLast?: boolean;
  parentLines?: boolean[];
  siblingIndex?: number;
  totalSiblings?: number;
}

interface AssignedUser {
  id: string;
  name: string;
}

export function OrganizationTreeNode({
  unit,
  isLast = false,
  parentLines = [],
  siblingIndex = 0,
  totalSiblings = 1,
}: OrganizationTreeNodeProps) {
  const { state, dispatch } = useRoles();
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  console.log("Unit data:", unit);

  const isExpanded = state.expandedOrgNodes.has(unit.id);
  const hasChildren = unit.children.length > 0;

  const handleToggleExpand = () => {
    dispatch({ type: "TOGGLE_ORG_EXPAND", payload: { unitId: unit.id } });
  };

  const handleEdit = () => {
    dispatch({
      type: "SELECT_ORG_UNIT",
      payload: { unit: { ...unit } },
    });
  };

  const handleAddChild = () => {
    dispatch({
      type: "SELECT_ORG_UNIT",
      payload: {
        unit: {
          id: "new",
          name: "",
          description: "",
          level: unit.level + 1,
          children: [],
          parentId: unit.id,
          unitRoles: [],
          userAssignments: [],
        } as OrganizationUnit,
      },
    });
  };

  const confirmDelete = async () => {
    try {
      console.log(`Attempting to delete unit with ID: ${unit.id}`);
      const response = await axios.delete(`/api/units/${unit.id}`);
      console.log("Delete response:", response.data);

      dispatch({ type: "DELETE_ORG_UNIT", payload: { unitId: unit.id } });
      setShowDeleteDialog(false);

      toast({
        title: "Success",
        description: `"${unit.name}" and its child units deleted successfully`,
      });
    } catch (error: any) {
      console.error(
        "Failed to delete unit:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.status === 404
          ? "Unit not found. It may have already been deleted."
          : error.response?.status === 403
          ? "Cannot delete root unit."
          : error.response?.data?.error ||
            "Failed to delete unit. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const getLevelColor = (level: number) => {
    const colors = [
      "text-blue-800",
      "text-purple-700",
      "text-green-700",
      "text-orange-700",
      "text-red-700",
    ];
    return colors[level] || "text-gray-700";
  };

  const getTreePrefix = () => {
    let prefix = "";
    parentLines.forEach((showLine) => {
      prefix += showLine ? "│   " : "    ";
    });
    if (unit.level > 0) {
      prefix += isLast ? "└── " : "├── ";
    }
    return prefix;
  };

  const getAssignedUserCount = () => {
    const count = unit.userAssignments?.length || 0;
    console.log("User Count:", count, "UserAssignments:", unit.userAssignments);
    return count;
  };

  const getAssignedRoleNames = () => {
    if (!unit.unitRoles || unit.unitRoles.length === 0) return [];
    return unit.unitRoles.map((unitRole) => unitRole.role.name);
  };

  const getAssignedUsers = () => {
    if (!unit.userAssignments || !Array.isArray(unit.userAssignments)) {
      console.log("No assigned users or invalid format:", unit.userAssignments);
      return [];
    }
    const assignedUsers = unit.userAssignments
      .map((assignment) => {
        const user: AssignedUser = assignment.user
          ? {
              id: assignment.user.id,
              name: assignment.user.name || "Unknown User",
            }
          : { id: assignment.userId, name: "Unknown User" };
        const role = assignment.role;
        console.log("Processing assignment:", { user, role, assignment });
        return { user, role, assignment };
      })
      .filter((item) => item.role);
    console.log("Assigned Users:", assignedUsers);
    return assignedUsers;
  };

  const assignedRoleNames = getAssignedRoleNames();

  return (
    <>
      <div>
        <div
          className={cn(
            "flex items-center group hover:bg-gray-50 py-2 px-2 rounded transition-colors duration-200",
            isHovered && "bg-gray-50"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span className="text-gray-400 select-none whitespace-pre">
            {getTreePrefix()}
          </span>
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpand}
              className="p-0 h-4 w-4 mr-1 hover:bg-gray-200"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          <div className="flex-1 flex items-center gap-2">
            <span className={cn("font-medium", getLevelColor(unit.level))}>
              {unit.name}
            </span>
            <div className="flex items-center gap-2">
              {assignedRoleNames.length > 0 && (
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">
                    {assignedRoleNames.length} role
                    {assignedRoleNames.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {getAssignedUserCount() > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">
                    {getAssignedUserCount()} user
                    {getAssignedUserCount() !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div
            className={cn(
              "ml-auto flex items-center gap-1 transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddChild}
              className="h-6 w-6 p-0 hover:bg-green-100 text-green-600"
              title="Add child unit"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-6 w-6 p-0 hover:bg-blue-100 text-blue-600"
              title="Edit unit"
            >
              <Edit className="h-3 w-3" />
            </Button>
            {unit.id !== "reliance" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                title="Delete unit"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        {(assignedRoleNames.length > 0 || getAssignedUserCount() > 0) &&
          isHovered && (
            <div className="ml-8 mt-1 mb-2 space-y-2">
              {assignedRoleNames.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Roles:</p>
                  <div className="flex flex-wrap gap-1">
                    {assignedRoleNames.map((roleName) => (
                      <Badge
                        key={roleName}
                        variant="secondary"
                        className="text-xs bg-purple-100 text-purple-800"
                      >
                        <Shield className="h-2 w-2 mr-1" />
                        {roleName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-600 mb-1">Users:</p>
                {getAssignedUserCount() > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {getAssignedUsers()
                      .slice(0, 3)
                      .map(({ user, role }) => (
                        <Badge
                          key={user.id}
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-800"
                        >
                          <Users className="h-2 w-2 mr-1" />
                          {user.name} ({role!.name})
                        </Badge>
                      ))}
                    {getAssignedUserCount() > 3 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-gray-100 text-gray-600"
                      >
                        +{getAssignedUserCount() - 3} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-600"
                  >
                    No users assigned
                  </Badge>
                )}
              </div>
            </div>
          )}
        {isExpanded && hasChildren && (
          <div>
            {unit.children.map((child, index) => (
              <OrganizationTreeNode
                key={child.id}
                unit={child}
                isLast={index === unit.children.length - 1}
                parentLines={[...parentLines, !isLast]}
                siblingIndex={index}
                totalSiblings={unit.children.length}
              />
            ))}
          </div>
        )}
      </div>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organizational Unit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{unit.name}"
              {unit.children.length > 0
                ? ` and its ${unit.children.length} child unit${
                    unit.children.length > 1 ? "s" : ""
                  }`
                : ""}
              ? This action cannot be undone.
              {assignedRoleNames.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    This unit has {assignedRoleNames.length} assigned role
                    {assignedRoleNames.length !== 1 ? "s" : ""}:{" "}
                    {assignedRoleNames.join(", ")}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Unit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
