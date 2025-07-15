"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import UserStats from "@/components/admin-users/UserStats";
import RoleDistribution from "@/components/admin-users/RoleDistribution";
import PermissionMatrix from "@/components/admin-users/PermissionMatrix";
import AddUserDialog from "@/components/admin-users/AddUserDialog";
import AllUsers from "@/components/admin-users/AllUsers";

type User = {
  id: number;
  userId: string;
  department: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  reportTo: string;
  password: string;
  status: string;
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  deleted?: boolean;
  originalRowIndex?: number;
};

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/adminUser/add-user-info");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const roles = ["Admin", "Manager", "Employee", "HR Manager", "Supervisor"];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      Object.values(user).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" ||
      user.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus && !user.deleted;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-100 hover:bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="hover:bg-gray-100 bg-gray-100 text-gray-800">
            Inactive
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-yellow-100 hover:bg-yellow-100 text-yellow-800">
            Paused
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const addUser = (newUser: {
    userId: string;
    department: string;
    employeeCode: string;
    name: string;
    role: string;
    reportTo: string;
    email: string;
    password: string;
    status: string;
    lastLogin: string;
  }) => {
    setUsers((prevUsers) => [
      ...prevUsers,
      {
        id: prevUsers.length + 1,
        userId: newUser.userId,
        department: newUser.department,
        employeeCode: newUser.employeeCode,
        name: newUser.name,
        email: newUser.email,
        phone: "",
        role: newUser.role,
        reportTo: newUser.reportTo,
        password: newUser.password,
        status: newUser.status,
        lastLogin: newUser.lastLogin,
        createdAt: new Date().toISOString().split("T")[0],
        permissions:
          newUser.role === "Admin"
            ? ["all_modules"]
            : [newUser.department.toLowerCase()],
        deleted: false,
      },
    ]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.userId === updatedUser.userId ? { ...user, ...updatedUser } : user
      )
    );
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch("/api/adminUser/add-user-info", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.userId !== userId)
      );
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
        <AddUserDialog
          roles={roles}
          addUser={addUser}
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          editingUser={editingUser}
          updateUser={updateUser}
          isEditMode={isEditDialogOpen}
          setIsEditMode={setIsEditDialogOpen}
        />
      </div>

      <UserStats users={filteredUsers} />

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="roles">Role Distribution</TabsTrigger>
          <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <AllUsers
            filteredUsers={filteredUsers}
            roles={roles}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            getStatusBadge={getStatusBadge}
            setEditingUser={setEditingUser}
            setIsEditDialogOpen={setIsEditDialogOpen}
            deleteUser={deleteUser}
            updateUser={updateUser}
          />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RoleDistribution
            users={users}
            roles={roles}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionMatrix users={users} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
