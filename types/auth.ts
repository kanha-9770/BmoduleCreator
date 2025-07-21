export interface UserPermissions {
  canView: boolean
  canAdd: boolean
  canEdit: boolean
  canDelete: boolean
  canManage: boolean
}

export interface AuthenticatedUser {
  id: string
  email: string
  role?: string
  permissions: UserPermissions
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  permissions?: UserPermissions
  user?: {
    id: string
    email: string
    role?: string
  }
}

export interface PermissionMatrix {
  [moduleId: string]: {
    name: string
    description: string
    permissions: UserPermissions
    subModules: {
      [subModuleId: string]: {
        name: string
        permissions: UserPermissions
      }
    }
  }
}