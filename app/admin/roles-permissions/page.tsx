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
import { UserRoleAssignments } from "@/components/admin/user-role-assignments";
import { UserPermissionOverrides } from "@/components/admin/user-permission-overrides";
import { FormsSidebar } from "@/components/admin/forms-sidebar";
import { FormsPermissionMatrix } from "@/components/admin/forms-permission-matrix";
import { Search, Users, Shield, Settings, Grid3x3 as Grid3X3, Folder, FileText } from "lucide-react";

interface Form {
  id: string;
  name: string;
  description?: string;
  isEmployeeForm?: boolean;
  isUserForm?: boolean;
}

interface Module {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  level: number;
  forms: Form[];
  children: Module[];
}

export default function RolesPermissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedSubmodule, setSelectedSubmodule] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch("/api/modules-permission");
        console.log("Fetching modules with forms", response);

        const result = await response.json();
        if (result.success) {
          setModules(result.data);
          console.log("Modules with forms loaded:", result.data);
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleFormSelect = (formId: string, moduleId: string, submoduleId?: string) => {
    setSelectedForm(formId);
    setSelectedModule(moduleId);
    setSelectedSubmodule(submoduleId || null);
    console.log("Form selected:", { formId, moduleId, submoduleId });
  };

  const getFormCount = (modules: Module[]): number => {
    return modules.reduce((total, module) => {
      const moduleForms = module.forms?.length || 0;
      const submoduleForms = module.children.reduce((subTotal, child) => {
        return subTotal + (child.forms?.length || 0);
      }, 0);
      return total + moduleForms + submoduleForms;
    }, 0);
  };

  const totalForms = getFormCount(modules);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900">Available Modules</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{modules.length}</div>
            <div className="text-sm text-blue-700">
              Modules with {modules.reduce((total, m) => total + m.children.length, 0)} submodules
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900">Available Forms</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{totalForms}</div>
            <div className="text-sm text-green-700">
              Forms across all modules
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-purple-900">Form Permissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {selectedForm ? "Selected" : "None"}
            </div>
            <div className="text-sm text-purple-700">
              {selectedForm ? "Form selected for permission management" : "Select a form to manage permissions"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Forms & Permissions
          </h1>
          <p className="text-muted-foreground">
            Manage form-based permissions with hierarchical visibility
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms, roles, or users..."
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

      <Tabs defaultValue="forms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forms" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Form Permissions</span>
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

        <TabsContent value="forms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <FormsSidebar
                searchTerm={searchTerm}
                onFormSelect={handleFormSelect}
                selectedForm={selectedForm}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Form Permission Matrix</CardTitle>
                  <CardDescription>
                    Manage permissions for the selected form. Permissions granted to forms automatically make parent modules and submodules visible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormsPermissionMatrix
                    searchTerm={searchTerm}
                    selectedForm={selectedForm}
                    selectedModule={selectedModule}
                    selectedSubmodule={selectedSubmodule}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
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