"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: number;
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
  createdAt: string;
  permissions: string[];
  deleted?: boolean;
  originalRowIndex?: number;
};

type AllUsersProps = {
  filteredUsers: User[];
  roles: string[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedRole: string;
  setSelectedRole: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  setEditingUser: (user: User) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  deleteUser: (userId: string) => void;
  updateUser: (updatedUser: User) => void;
};

export default function AllUsers({
  filteredUsers,
  roles,
  searchTerm,
  setSearchTerm,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  getStatusBadge,
  setEditingUser,
  setIsEditDialogOpen,
  deleteUser,
  updateUser,
}: AllUsersProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [userToUpdateStatus, setUserToUpdateStatus] = useState<User | null>(
    null
  );
  const [newStatus, setNewStatus] = useState<string>("");

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser(userToDelete.userId);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleStatusClick = (user: User) => {
    setUserToUpdateStatus(user);
    setNewStatus(user.status.toLowerCase()); // Normalize to lowercase for consistency
    setStatusDialogOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (userToUpdateStatus && newStatus) {
      const updatedUser = {
        ...userToUpdateStatus,
        status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1), // Capitalize for API consistency
      };
      try {
        const response = await fetch("/api/adminUser/add-user-info", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        });

        if (!response.ok) {
          throw new Error("Failed to update user status");
        }

        updateUser(updatedUser);
        setStatusDialogOpen(false);
        setUserToUpdateStatus(null);
        setNewStatus("");
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>
              Manage all system users and their access
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Employee Code</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Report To</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user?.id}>
                <TableCell>{user.userId}</TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell>{user.employeeCode}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.reportTo}</TableCell>
                <TableCell className="lowercase">{user.email}</TableCell>
                <TableCell className="normal-case">{user.password}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>
                  <div className="text-sm flex items-center">
                    {user.lastLogin}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusClick(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Change Status
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this user?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action will mark the user as deleted in the system. The
                user will no longer be visible in the user list, but their data
                will be preserved in the database for audit purposes.
                {userToDelete && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <strong>User:</strong> {userToDelete.name} (
                    {userToDelete.email})
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteConfirm}
              >
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Status Change Dialog */}
        <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change User Status</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-800">
                Select a new status for the user.
                {userToUpdateStatus && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-gray-800">
                    <strong>User:</strong> {userToUpdateStatus.name} (
                    {userToUpdateStatus.email})
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleStatusConfirm}>
                Update Status
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
