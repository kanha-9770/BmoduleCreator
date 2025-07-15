import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react"

type User = {
  id: string | number;
  name: string;
  role: string;
  status: string;
};

type RoleDistributionProps = {
  users: User[];
  roles: (string | number)[];
  getStatusBadge: (status: string) => React.ReactNode;
};

export default function RoleDistribution({ users, roles, getStatusBadge }: RoleDistributionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role: any, idx: number) => {
        const roleKey = typeof role === "string" || typeof role === "number" ? role : idx;
        const roleUsers = users.filter((u) => u.role === role)
        return (
          <Card key={roleKey}>
            <CardHeader>
              <CardTitle className="text-lg">{role}</CardTitle>
              <CardDescription>{roleUsers.length} users assigned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roleUsers.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <span className="text-sm">{user.name}</span>
                    {getStatusBadge(user.status)}
                  </div>
                ))}
                {roleUsers.length > 3 && (
                  <div className="text-sm text-gray-500">+{roleUsers.length - 3} more users</div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}