"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RolePermissionMatrix } from "@/components/admin/role-permission-matrix";
import { UserRoleAssignments } from "@/components/admin/user-role-assignments";
import { UserPermissionOverrides } from "@/components/admin/user-permission-overrides";
import { Search, Users, Shield, Settings, Grid3X3, Folder } from "lucide-react";

interface Module {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  level: number;
  children?: Module[];
}

export default function RolesPermissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch("/api/modules-permission");
        console.log("hey their i am module fetched data", response);

        const result = await response.json();
        if (result.success) {
          setModules(result.data);
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Grid3X3 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">Available Modules</CardTitle>
          </div>
          <CardDescription className="text-blue-700">
            System modules and their permissions are managed through the role
            matrix below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Loading modules...</span>
            </div>
          ) : modules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-blue-100 hover:border-blue-300 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: module.color || "#3B82F6" }}
                  >
                    {module.icon ? (
                      <span>{module.icon}</span>
                    ) : (
                      <Folder className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {module.name}
                    </p>
                    {module.description && (
                      <p className="text-xs text-gray-500 truncate">
                        {module.description}
                      </p>
                    )}
                  </div>
                  {module.children && module.children.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {module.children.length}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-blue-600">
              <Folder className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                No modules found. Please check your database connection.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground">
            Manage role-based permissions and user access controls
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles, users, or permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-80"
            />
          </div>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matrix" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Permission Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>User Assignments</span>
          </TabsTrigger>
          <TabsTrigger
            value="overrides"
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>User Overrides</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role-Permission Matrix</CardTitle>
              <CardDescription>
                Manage permissions for each role across all modules and
                submodules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RolePermissionMatrix
                searchTerm={searchTerm}
                selectedRole={selectedRole}
                onRoleSelect={setSelectedRole}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Role Assignments</CardTitle>
              <CardDescription>
                View and manage which users are assigned to each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRoleAssignments
                searchTerm={searchTerm}
                selectedRole={selectedRole}
                onRoleSelect={setSelectedRole}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overrides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Permission Overrides</CardTitle>
              <CardDescription>
                Manage individual user permission overrides beyond their role
                permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserPermissionOverrides
                searchTerm={searchTerm}
                selectedUser={selectedUser}
                onUserSelect={setSelectedUser}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
