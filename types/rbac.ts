export interface Role {
  id: string
  name: string
  description: string | null
  permissions: Permission[]
  createdAt: Date
  updatedAt: Date
}

export interface Permission {
  id: string
  name: string
  description: string | null
  resourceId: string | null
  resourceType: string | null
  roles: Role[]
  createdAt: Date
  updatedAt: Date
}

export interface RolePermission {
  id: string
  roleId: string
  permissionId: string
  role: Role
  permission: Permission
  createdAt: Date
  updatedAt: Date
}

export interface UserWithRole {
  id: string
  email: string
  name: string
  role?: Role
  permissions: Permission[]
}

export interface PermissionCheck {
  hasPermission: boolean
  missingPermissions?: string[]
}

export type ResourceType = 'FormModule' | 'Form' | 'FormSection' | 'FormField' | 'FormRecord'
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'publish'