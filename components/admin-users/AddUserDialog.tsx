"use client";

import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";

interface User {
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
  originalRowIndex?: number;
}

interface AddUserDialogProps {
  roles: string[];
  addUser: (user: {
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
  }) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingUser: User | null;
  updateUser: (user: User) => void;
  isEditMode: boolean;
  setIsEditMode: (open: boolean) => void;
}

export default function AddUserDialog({
  roles,
  addUser,
  isOpen,
  setIsOpen,
  editingUser,
  updateUser,
  isEditMode,
  setIsEditMode,
}: AddUserDialogProps) {
  const departments = [
    "IT",
    "Sales",
    "Production",
    "HR",
    "Purchase",
    "Finance",
  ];
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id: 0,
      userId: "",
      department: "",
      employeeCode: "",
      name: "",
      role: "",
      reportTo: "",
      email: "",
      password: "",
      status: "Active",
      lastLogin: "",
    },
  });

  useEffect(() => {
    if (editingUser && isEditMode) {
      setValue("id", editingUser.id);
      setValue("userId", editingUser.userId);
      setValue("department", editingUser.department);
      setValue("employeeCode", editingUser.employeeCode);
      setValue("name", editingUser.name);
      setValue("role", editingUser.role);
      setValue("reportTo", editingUser.reportTo);
      setValue("email", editingUser.email);
      setValue("password", editingUser.password);
      setValue("status", "Active");
      setValue("lastLogin", editingUser.lastLogin);
    } else {
      reset();
    }
  }, [editingUser, isEditMode, setValue, reset]);

  const capitalizeWords = (str: string) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const onSubmit = async (data: {
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
  }) => {
    const formattedData = {
      id: data.id,
      userId: capitalizeWords(data.userId),
      department: capitalizeWords(data.department),
      employeeCode: capitalizeWords(data.employeeCode),
      name: capitalizeWords(data.name),
      role: capitalizeWords(data.role),
      reportTo: capitalizeWords(data.reportTo),
      email: data.email,
      password: data.password,
      status: "Active",
      lastLogin:
        data.lastLogin ||
        new Date()
          .toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .replace(/(\d+)\/(\d+)\/(\d+)/, "$2/$1/$3"),
      createdAt:
        editingUser?.createdAt || new Date().toISOString().split("T")[0],
      permissions:
        data.role === "Admin"
          ? ["all_modules"]
          : [data.department.toLowerCase()],
    };

    try {
      if (isEditMode && editingUser) {
        const response = await fetch("/api/adminUser/add-user-info", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });

        if (!response.ok) {
          throw new Error("Failed to update user in Google Sheets");
        }

        updateUser(formattedData);
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        const response = await fetch("/api/adminUser/add-user-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });

        if (!response.ok) {
          throw new Error("Failed to save user to Google Sheets");
        }

        addUser(formattedData);
        toast({
          title: "Success",
          description: "Data successfully submitted",
        });
      }

      reset();
      setIsOpen(false);
      setIsEditMode(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process user",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog
      open={isOpen || isEditMode}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          setIsOpen(false);
          setIsEditMode(false);
        } else {
          setIsOpen(true);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update user details and permissions"
              : "Create a new user account with appropriate permissions"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("id")} />
          <input type="hidden" {...register("status")} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="Enter User ID"
                {...register("userId", { required: "User ID is required" })}
                disabled={isEditMode}
              />
              {errors.userId && (
                <p className="text-red-600 text-sm">{errors.userId.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Controller
                name="department"
                control={control}
                rules={{ required: "Department is required" }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department && (
                <p className="text-red-600 text-sm">
                  {errors.department.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="employeeCode">Employee Code</Label>
            <Input
              id="employeeCode"
              placeholder="Enter Employee Code"
              {...register("employeeCode", {
                required: "Employee Code is required",
              })}
            />
            {errors.employeeCode && (
              <p className="text-red-600 text-sm">
                {errors.employeeCode.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter Full Name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-red-600 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-red-600 text-sm">{errors.role.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="reportTo">Report To</Label>
              <Controller
                name="reportTo"
                control={control}
                rules={{ required: "Report To is required" }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report to" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.reportTo && (
                <p className="text-red-600 text-sm">
                  {errors.reportTo.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.smith@company.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <p className="text-red-600 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setIsOpen(false);
                setIsEditMode(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}