"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Permission {
  id: string
  label: string
  description: string
}

interface Role {
  id: string
  name: string
  permissions: string[]
}

interface RolePermissionsProps {
  roles: Role[]
  permissions: Permission[]
  onPermissionChange: (roleId: string, permissionId: string, checked: boolean) => void
}

export function RolePermissions({ roles, permissions, onPermissionChange }: RolePermissionsProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Role Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Permission</th>
                {roles.map((role) => (
                  <th key={role.id} className="pb-3 text-center text-sm font-medium text-muted-foreground">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission) => (
                <tr key={permission.id} className="border-b border-border">
                  <td className="py-4">
                    <div>
                      <Label className="text-foreground">{permission.label}</Label>
                      <p className="text-sm text-muted-foreground">{permission.description}</p>
                    </div>
                  </td>
                  {roles.map((role) => (
                    <td key={role.id} className="py-4 text-center">
                      <Checkbox
                        checked={role.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => onPermissionChange(role.id, permission.id, checked as boolean)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
