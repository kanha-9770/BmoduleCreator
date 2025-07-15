import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Lock } from "lucide-react";

interface User {
  status: string;
  // Add other user properties if needed
}

interface UserStatsProps {
  users: User[]; // This will now receive filteredUsers
}

export default function UserStats({ users }: UserStatsProps) {
  const userStats = {
    total: users.length,
    active: users.filter((u) => u.status.toLowerCase() === "active").length,
    inactive: users.filter((u) => u.status.toLowerCase() === "inactive").length,
    paused: users.filter((u) => u.status.toLowerCase() === "paused").length, // Changed from "pause" to "paused"
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{userStats.active}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
          <UserX className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{userStats.inactive}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paused Users</CardTitle>
          <Lock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{userStats.paused}</div>
        </CardContent>
      </Card>
    </div>
  );
}