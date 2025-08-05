"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { ApiClient } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  status: string;
}

interface Permission {
  id: string;
  userId: string;
  resourceType: "module" | "form";
  resourceId: string;
  resource?: {
    id: string;
    name: string;
    description?: string;
    moduleId?: string; // For forms
  };
  permissions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canManage: boolean;
  };
  isSystemAdmin: boolean;
  grantedBy?: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

interface PermissionContextType {
  user: User | null;
  permissions: Permission[];
  isLoading: boolean;
  error: string | null;
  isSystemAdmin: boolean;
  hasModuleAccess: (moduleId: string) => boolean;
  hasFormAccess: (formId: string) => boolean;
  getAccessibleActions: (
    moduleId: string,
    formId?: string
  ) => {
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canManage: boolean;
  };
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSystemAdmin = permissions.some((p) => p.isSystemAdmin);

  const loadUserContext = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("[PermissionContext] Loading user context...");

      // Get user context from your existing API
      const response = await ApiClient.get("/api/auth/context");

      if (!response.success) {
        throw new Error(response.error || "Failed to load user context");
      }

      const { user: userData, permissions: userPermissions } = response.data;

      console.log("[PermissionContext] User context loaded:", {
        user: userData?.email,
        permissionCount: userPermissions?.length || 0,
        isSystemAdmin:
          userPermissions?.some((p: any) => p.isSystemAdmin) || false,
      });

      setUser(userData);
      setPermissions(userPermissions || []);
    } catch (err) {
      console.error("[PermissionContext] Error loading user context:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load permissions"
      );
      setUser(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserContext();
  }, []);

  const hasModuleAccess = (moduleId: string): boolean => {
    if (!user) return false;

    // System admin has access to everything
    if (isSystemAdmin) return true;

    // Check ONLY explicit module permission - no inheritance
    const modulePermission = permissions.find(
      (p) => p.resourceType === "module" && p.resourceId === moduleId
    );

    if (modulePermission) {
      return (
        modulePermission.permissions.canView ||
        modulePermission.permissions.canManage
      );
    }

    // Do NOT check form permissions for module access - only explicit module permissions
    return false;
  };

  const hasFormAccess = (formId: string): boolean => {
    if (!user) return false;

    // System admin has access to everything
    if (isSystemAdmin) return true;

    // Check explicit form permission first
    const formPermission = permissions.find(
      (p) => p.resourceType === "form" && p.resourceId === formId
    );

    if (formPermission) {
      return (
        formPermission.permissions.canView ||
        formPermission.permissions.canManage
      );
    }

    // Check if user has explicit module manage permission for this form's module
    const formWithResource = permissions.find(
      (p) => p.resourceType === "form" && p.resourceId === formId
    );
    if (formWithResource?.resource?.moduleId) {
      const modulePermission = permissions.find(
        (p) =>
          p.resourceType === "module" &&
          p.resourceId === formWithResource.resource!.moduleId
      );
      // Only module MANAGE permission grants access to all forms in that module
      return modulePermission?.permissions.canManage || false;
    }

    return false;
  };

  const getAccessibleActions = (moduleId: string, formId?: string) => {
    if (!user) {
      return {
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canManage: false,
      };
    }

    // System admin can do everything
    if (isSystemAdmin) {
      return {
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canManage: true,
      };
    }

    if (formId) {
      // Form-level permissions
      const formPermission = permissions.find(
        (p) => p.resourceType === "form" && p.resourceId === formId
      );

      if (formPermission) {
        return {
          canView:
            formPermission.permissions.canView ||
            formPermission.permissions.canManage,
          canAdd:
            formPermission.permissions.canCreate ||
            formPermission.permissions.canManage,
          canEdit:
            formPermission.permissions.canEdit ||
            formPermission.permissions.canManage,
          canDelete:
            formPermission.permissions.canDelete ||
            formPermission.permissions.canManage,
          canManage: formPermission.permissions.canManage,
        };
      }

      // Check module permission for form
      const modulePermission = permissions.find(
        (p) => p.resourceType === "module" && p.resourceId === moduleId
      );

      if (modulePermission?.permissions.canManage) {
        return {
          canView: true,
          canAdd: true,
          canEdit: true,
          canDelete: true,
          canManage: true,
        };
      }
    }

    // Module-level permissions
    const modulePermission = permissions.find(
      (p) => p.resourceType === "module" && p.resourceId === moduleId
    );

    if (modulePermission) {
      return {
        canView:
          modulePermission.permissions.canView ||
          modulePermission.permissions.canManage,
        canAdd:
          modulePermission.permissions.canCreate ||
          modulePermission.permissions.canManage,
        canEdit:
          modulePermission.permissions.canEdit ||
          modulePermission.permissions.canManage,
        canDelete:
          modulePermission.permissions.canDelete ||
          modulePermission.permissions.canManage,
        canManage: modulePermission.permissions.canManage,
      };
    }

    return {
      canView: false,
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canManage: false,
    };
  };

  const refreshPermissions = async () => {
    await loadUserContext();
  };

  const contextValue: PermissionContextType = {
    user,
    permissions,
    isLoading,
    error,
    isSystemAdmin,
    hasModuleAccess,
    hasFormAccess,
    getAccessibleActions,
    refreshPermissions,
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}
