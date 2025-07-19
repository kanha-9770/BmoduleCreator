export interface Permission {
  id: string
  employeeId: string
  moduleId: string
  submoduleId: string
  permissionType: 'view' | 'add' | 'edit' | 'delete'
  value: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EmployeePermissions {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: string
  permissions: {
    [moduleId: string]: {
      [submoduleId: string]: {
        view: boolean
        add: boolean
        edit: boolean
        delete: boolean
      }
    }
  }
}

export interface ModuleWithSubmodules {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
  subModules: {
    id: string
    name: string
    description?: string
    isActive: boolean
  }[]
}

export interface PermissionChangeRequest {
  employeeId: string
  moduleId: string
  submoduleId: string
  permissionType: 'view' | 'add' | 'edit' | 'delete'
  value: boolean
}