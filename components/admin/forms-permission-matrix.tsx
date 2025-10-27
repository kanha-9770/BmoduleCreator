"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Save,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Users,
  FileText,
  AlertCircle,
} from "lucide-react";

interface Form {
  id: string;
  name: string;
  description?: string;
  moduleId: string;
  isEmployeeForm?: boolean;
  isUserForm?: boolean;
}

interface Module {
  id: string;
  name: string;
  description?: string;
  level: number;
  children: Module[];
  parentId?: string;
  icon?: string;
  color?: string;
  forms: Form[];
}

interface Role {
  id: string;
  name: string;
  description?: string;
  level: number;
  isActive: boolean;
  userCount: number;
  users: User[];
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  location?: string;
  status: string;
  unitAssignments: Array<{
    unitId: string;
    unit: { name: string };
    roleId: string;
  }>;
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
  formId?: string;
  granted: boolean;
  canDelegate: boolean;
}

interface UserPermission {
  userId: string;
  permissionId: string;
  moduleId: string;
  formId?: string;
  granted: boolean;
  reason?: string;
  isActive: boolean;
}

interface FormsPermissionMatrixProps {
  searchTerm: string;
  selectedForm: string | null;
  selectedModule: string | null;
  selectedSubmodule: string | null;
}

export function FormsPermissionMatrix({
  searchTerm,
  selectedForm,
  selectedModule,
  selectedSubmodule,
}: FormsPermissionMatrixProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Map<string, boolean>>(new Map());

  // Standard form permissions - always available
  const standardFormPermissions = [
    { id: "1", name: "VIEW", category: "READ" as const, resource: "form" },
    { id: "2", name: "CREATE", category: "WRITE" as const, resource: "form" },
    { id: "3", name: "EDIT", category: "WRITE" as const, resource: "form" },
    { id: "4", name: "DELETE", category: "DELETE" as const, resource: "form" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(
          "[MATRIX] Starting to fetch all data for forms permissions..."
        );

        // Fetch all data
        const [
          modulesResponse,
          rolesResponse,
          usersResponse,
          permissionsResponse,
          rolePermissionsResponse,
          userPermissionsResponse,
        ] = await Promise.all([
          fetch("/api/modules-permission")
            .then((r) => r.json())
            .catch(() => ({ success: false, data: [] })),
          fetch("/api/role")
            .then((r) => r.json())
            .catch(() => ({ success: false, data: [] })),
          fetch("/api/user")
            .then((r) => r.json())
            .catch(() => ({ success: false, data: [] })),
          fetch("/api/permissions")
            .then((r) => r.json())
            .catch(() => ({ success: false, data: [] })),
          fetch("/api/role-permissions")
            .then((r) => r.json())
            .catch(() => ({ success: false, data: [] })),
          fetch("/api/user-permissions")
            .then((r) => r.json())
            .catch(() => ({ success: false, data: [] })),
        ]);

        console.log("[MATRIX] API responses:", {
          modules: modulesResponse.success,
          roles: rolesResponse.success,
          users: usersResponse.success,
          permissions: permissionsResponse.success,
          rolePermissions: rolePermissionsResponse.success,
          userPermissions: userPermissionsResponse.success,
        });

        // Set data with fallbacks
        setModules(modulesResponse.success ? modulesResponse.data : []);
        setRoles(rolesResponse.success ? rolesResponse.data : []);
        setUsers(usersResponse.success ? usersResponse.data : []);
        setPermissions(
          permissionsResponse.success && permissionsResponse.data.length > 0
            ? permissionsResponse.data
            : standardFormPermissions
        );
        setRolePermissions(
          rolePermissionsResponse.success ? rolePermissionsResponse.data : []
        );
        setUserPermissions(
          userPermissionsResponse.success ? userPermissionsResponse.data : []
        );
        console.log("[MATRIX] data", usersResponse);
        console.log("[MATRIX] Data loaded:", {
          modules: modulesResponse.success ? modulesResponse.data.length : 0,
          roles: rolesResponse.success ? rolesResponse.data.length : 0,
          users: usersResponse.success ? usersResponse.data.length : 0,
          permissions:
            permissionsResponse.success && permissionsResponse.data.length > 0
              ? permissionsResponse.data.length
              : standardFormPermissions.length,
          rolePermissions: rolePermissionsResponse.success
            ? rolePermissionsResponse.data.length
            : 0,
          userPermissions: userPermissionsResponse.success
            ? userPermissionsResponse.data.length
            : 0,
        });
      } catch (error) {
        console.error("[MATRIX] Error fetching data:", error);
        setPermissions(standardFormPermissions);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleRole = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  const hasRolePermission = (
    roleId: string,
    formId: string,
    permissionId: string
  ): boolean => {
    if (!roleId || !formId || !permissionId) return false;

    const key = `role-${roleId}-${formId}-${permissionId}`;
    if (changes.has(key)) {
      return changes.get(key)!;
    }

    const hasPermission = rolePermissions.some(
      (rp) =>
        rp.roleId === roleId &&
        rp.formId === formId &&
        rp.permissionId === permissionId &&
        rp.granted
    );

    console.log("[MATRIX] Role permission check:", {
      roleId,
      formId,
      permissionId,
      hasPermission,
    });
    return hasPermission;
  };

  const hasUserPermission = (
    userId: string,
    formId: string,
    permissionId: string
  ): boolean => {
    if (!userId || !formId || !permissionId) return false;

    const key = `user-${userId}-${formId}-${permissionId}`;
    if (changes.has(key)) {
      return changes.get(key)!;
    }

    // Check direct user permission
    const userPermission = userPermissions.find(
      (up) =>
        up.userId === userId &&
        up.formId === formId &&
        up.permissionId === permissionId &&
        up.isActive
    );

    if (userPermission) {
      return userPermission.granted;
    }

    // Check inherited from role
    const user = users.find((u) => u.id === userId);
    if (!user || !user.unitAssignments || user.unitAssignments.length === 0)
      return false;

    const userRoleId = user.unitAssignments[0].roleId;
    return hasRolePermission(userRoleId, formId, permissionId);
  };

  const toggleRolePermission = (
    roleId: string,
    formId: string,
    permissionId: string
  ) => {
    const key = `role-${roleId}-${formId}-${permissionId}`;
    const currentValue = hasRolePermission(roleId, formId, permissionId);
    console.log("[MATRIX] Toggling role permission:", {
      roleId,
      formId,
      permissionId,
      currentValue,
      newValue: !currentValue,
    });
    setChanges((prev) => new Map(prev.set(key, !currentValue)));
  };

  const toggleUserPermission = (
    userId: string,
    formId: string,
    permissionId: string
  ) => {
    const key = `user-${userId}-${formId}-${permissionId}`;
    const currentValue = hasUserPermission(userId, formId, permissionId);
    console.log("[MATRIX] Toggling user permission:", {
      userId,
      formId,
      permissionId,
      currentValue,
      newValue: !currentValue,
    });
    setChanges((prev) => new Map(prev.set(key, !currentValue)));
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const roleUpdates: any[] = [];
      const userUpdates: any[] = [];

      changes.forEach((granted, key) => {
        if (key.startsWith("role-")) {
          const parts = key.split("-");
          const roleId = parts[1];
          const formId = parts[2];
          const permissionId = parts[3];

          // Get the module ID from the form details
          const moduleId = formDetails?.module.id || null;

          roleUpdates.push({
            roleId,
            moduleId,
            formId,
            permissionId,
            granted,
            canDelegate: false,
          });
        } else if (key.startsWith("user-")) {
          const parts = key.split("-");
          const userId = parts[1];
          const formId = parts[2];
          const permissionId = parts[3];
          // Get the module ID from the form details
          const moduleId = formDetails?.module.id || null;
          userUpdates.push({
            userId,
            moduleId,
            formId,
            permissionId,
            granted,
            reason: "Manual override",
            isActive: true,
          });
        }
      });

      console.log("[MATRIX] Saving changes:", {
        roleUpdates: roleUpdates.length,
        userUpdates: userUpdates.length,
        roleUpdatesData: roleUpdates,
        userUpdatesData: userUpdates,
      });

      const promises = [];
      if (roleUpdates.length > 0) {
        promises.push(
          fetch("/api/role-permissions", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(roleUpdates),
          })
        );
      }

      if (userUpdates.length > 0) {
        promises.push(
          fetch("/api/user-permissions", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userUpdates),
          })
        );
      }

      const responses = await Promise.all(promises);

      // Check if all responses were successful
      for (const response of responses) {
        if (!response.ok) {
          const errorData = await response.json();
          console.error("[MATRIX] API Error:", errorData);
          throw new Error(`API Error: ${errorData.error || "Unknown error"}`);
        } else {
          const successData = await response.json();
          console.log("[MATRIX] API Success:", successData);
        }
      }

      setChanges(new Map());
      console.log("[MATRIX] Changes saved successfully");

      // Refresh the data to show updated permissions
      window.location.reload();
    } catch (error) {
      console.error("[MATRIX] Failed to save changes:", error);
      alert("Failed to save changes. Please check the console for details.");
    } finally {
      setSaving(false);
    }
  };

  const getUsersForRole = (roleId: string): User[] => {
    return users.filter((user) => {
      return (
        user.unitAssignments &&
        user.unitAssignments.some((assignment) => assignment.roleId === roleId)
      );
    });
  };

  const getSelectedFormDetails = () => {
    if (!selectedForm) return null;

    for (const module of modules) {
      const moduleForm = module.forms?.find((f) => f.id === selectedForm);
      if (moduleForm) {
        return {
          form: moduleForm,
          module: module,
          submodule: null,
          path: `${module.name} > ${moduleForm.name}`,
        };
      }

      for (const submodule of module.children || []) {
        const submoduleForm = submodule.forms?.find(
          (f) => f.id === selectedForm
        );
        if (submoduleForm) {
          return {
            form: submoduleForm,
            module: module,
            submodule: submodule,
            path: `${module.name} > ${submodule.name} > ${submoduleForm.name}`,
          };
        }
      }
    }
    return null;
  };

  const formDetails = getSelectedFormDetails();
  // Modified to exclude roles with name "Admin" (case-insensitive)
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase() !== "admin" &&
      (role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  console.log("[MATRIX] Current state:", {
    selectedForm,
    formDetails: formDetails ? formDetails.path : null,
    permissions: permissions.length,
    roles: filteredRoles.length,
    changes: changes.size,
    loading,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
        <span>Loading permission matrix...</span>
      </div>
    );
  }

  if (!selectedForm || !formDetails) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Form Selected</h3>
          <p className="text-muted-foreground text-center">
            Please select a form from the sidebar to manage its permissions.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Available: {modules.length} modules, {filteredRoles.length} roles,{" "}
            {permissions.length} permissions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Form Details Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-900">Selected Form</CardTitle>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-green-700 font-medium">
              {formDetails.path}
            </div>
            {formDetails.form.description && (
              <div className="text-sm text-green-600">
                {formDetails.form.description}
              </div>
            )}
            <div className="flex items-center space-x-2">
              {formDetails.form.isEmployeeForm && (
                <Badge variant="outline" className="text-xs border-green-300">
                  Employee Form
                </Badge>
              )}
              {formDetails.form.isUserForm && (
                <Badge variant="outline" className="text-xs border-blue-300">
                  User Form
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Debug Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">System Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Modules:</span>
            <span className="ml-2 text-blue-600">{modules.length}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Roles:</span>
            <span className="ml-2 text-blue-600">{filteredRoles.length}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Users:</span>
            <span className="ml-2 text-blue-600">{users.length}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Permissions:</span>
            <span className="ml-2 text-blue-600">{permissions.length}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Role Perms:</span>
            <span className="ml-2 text-blue-600">{rolePermissions.length}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Changes:</span>
            <span className="ml-2 text-blue-600">{changes.size}</span>
          </div>
        </div>
      </div>

      {/* Save Changes Button */}
      {changes.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{changes.size} changes</Badge>
            <span className="text-sm text-muted-foreground">
              You have unsaved permission changes
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setChanges(new Map())}>
              Discard
            </Button>
            <Button onClick={saveChanges} disabled={saving}>
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Permission Matrix */}
      <div className="border rounded-lg overflow-hidden">
        <ScrollArea className="h-[700px]">
          <div className="min-w-full">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b z-10">
              <div className="flex">
                <div className="w-64 p-4 border-r bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Roles / Users</h3>
                </div>
                <div className="flex-1">
                  <div className="px-6 py-3 bg-gray-50 border-b text-center">
                    <div className="font-semibold text-gray-900">
                      Form: {formDetails.form.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {formDetails.path}
                    </div>
                  </div>
                  <div className="flex bg-gray-25">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="min-w-[120px] p-3 border-r border-gray-200 text-center"
                      >
                        <div className="text-sm font-medium text-gray-800">
                          {permission.name}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {permission.category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Roles and Users */}
            <div className="divide-y">
              {filteredRoles.map((role) => (
                <div key={role.id}>
                  <Collapsible
                    open={expandedRoles.has(role.id)}
                    onOpenChange={() => toggleRole(role.id)}
                  >
                    {/* Role row */}
                    <div className="flex border-b hover:bg-gray-50">
                      <div className="w-64 border-r">
                        <CollapsibleTrigger asChild>
                          <div className="p-4 cursor-pointer hover:bg-gray-25 flex items-center">
                            <div className="flex items-center space-x-2">
                              {expandedRoles.has(role.id) ? (
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                              )}
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {role.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {role.description}
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge
                                    variant={
                                      role.isActive ? "default" : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {role.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  <div className="flex items-center text-xs text-gray-600">
                                    <Users className="h-3 w-3 mr-1" />
                                    {getUsersForRole(role.id).length} users
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                      </div>

                      <div className="flex-1">
                        <div className="flex">
                          {permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="min-w-[120px] p-4 border-r border-gray-200 flex items-center justify-center bg-gray-25 hover:bg-blue-50"
                            >
                              <Checkbox
                                checked={hasRolePermission(
                                  role.id,
                                  selectedForm,
                                  permission.id
                                )}
                                onCheckedChange={() =>
                                  toggleRolePermission(
                                    role.id,
                                    selectedForm,
                                    permission.id
                                  )
                                }
                                className="h-5 w-5"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <CollapsibleContent>
                      {getUsersForRole(role.id).map((user) => (
                        <div
                          key={user.id}
                          className="flex border-b bg-blue-25 hover:bg-blue-50"
                        >
                          <div className="w-64 p-3 border-r pl-8">
                            <div className="text-sm font-medium text-gray-900">
                              ↳ {user.first_name} {user.last_name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {user.email}
                            </div>
                            {user.department && (
                              <div className="text-xs text-blue-600 mt-1">
                                {user.department}
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex">
                              {permissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="min-w-[120px] p-3 border-r border-gray-200 flex items-center justify-center bg-blue-25 hover:bg-blue-100"
                                >
                                  <Checkbox
                                    checked={hasUserPermission(
                                      user.id,
                                      selectedForm,
                                      permission.id
                                    )}
                                    onCheckedChange={() =>
                                      toggleUserPermission(
                                        user.id,
                                        selectedForm,
                                        permission.id
                                      )
                                    }
                                    className="h-5 w-5"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>

            {filteredRoles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No roles found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Help Text */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          <strong>Form-Based Permissions:</strong> Grant permissions at the form
          level. Form access automatically makes parent modules visible.
        </p>
        <p>
          <strong>Permission Types:</strong>{" "}
          {permissions.map((p, i) => (
            <span key={p.id}>
              {p.name} ({p.category}){i < permissions.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
