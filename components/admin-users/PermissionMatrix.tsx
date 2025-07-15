import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type User = {
  id: string | number
  name: string
  role: string
  permissions: string[]
}

interface PermissionMatrixProps {
  users: User[]
}

export default function PermissionMatrix({ users }: PermissionMatrixProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Matrix</CardTitle>
        <CardDescription>View and manage user permissions across all modules</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">User</th>
                <th className="text-center p-2">Sales</th>
                <th className="text-center p-2">Production</th>
                <th className="text-center p-2">Purchase</th>
                <th className="text-center p-2">Inventory</th>
                <th className="text-center p-2">HR</th>
                <th className="text-center p-2">Admin</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-2">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.role}</div>
                    </div>
                  </td>
                  <td className="text-center p-2">
                    {user.permissions.includes("sales") || user.permissions.includes("all_modules") ? (
                      <Badge className="bg-green-100 text-green-800">✓</Badge>
                    ) : (
                      <Badge variant="secondary">✗</Badge>
                    )}
                  </td>
                  <td className="text-center p-2">
                    {user.permissions.includes("production") || user.permissions.includes("all_modules") ? (
                      <Badge className="bg-green-100 text-green-800">✓</Badge>
                    ) : (
                      <Badge variant="secondary">✗</Badge>
                    )}
                  </td>
                  <td className="text-center p-2">
                    {user.permissions.includes("purchase") || user.permissions.includes("all_modules") ? (
                      <Badge className="bg-green-100 text-green-800">✓</Badge>
                    ) : (
                      <Badge variant="secondary">✗</Badge>
                    )}
                  </td>
                  <td className="text-center p-2">
                    {user.permissions.includes("inventory") || user.permissions.includes("all_modules") ? (
                      <Badge className="bg-green-100 text-green-800">✓</Badge>
                    ) : (
                      <Badge variant="secondary">✗</Badge>
                    )}
                  </td>
                  <td className="text-center p-2">
                    {user.permissions.includes("hr") || user.permissions.includes("all_modules") ? (
                      <Badge className="bg-green-100 text-green-800">✓</Badge>
                    ) : (
                      <Badge variant="secondary">✗</Badge>
                    )}
                  </td>
                  <td className="text-center p-2">
                    {user.permissions.includes("all_modules") || user.permissions.includes("user_management") ? (
                      <Badge className="bg-green-100 text-green-800">✓</Badge>
                    ) : (
                      <Badge variant="secondary">✗</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}