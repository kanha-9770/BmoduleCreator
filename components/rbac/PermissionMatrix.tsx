"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Save, X, Lock, Unlock } from "lucide-react"
import { useState } from "react"
import React from "react"

interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: string
  permissions: Record<string, Record<string, Record<string, boolean>>>
}

interface Module {
  id: string
  name: string
  description: string
  subModules: Array<{
    id: string
    name: string
  }>
}

interface PermissionMatrixProps {
  employees: Employee[]
  modules: Module[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  toggleEmployeePermission: (employeeId: string, moduleId: string, submoduleId: string, permissionType: string) => void
  isEditMode: boolean
  hasChanges: boolean
  isSaving: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}

export function PermissionMatrix({
  employees,
  modules,
  searchTerm,
  setSearchTerm,
  toggleEmployeePermission,
  isEditMode,
  hasChanges,
  isSaving,
  onEdit,
  onSave,
  onCancel,
}: PermissionMatrixProps) {
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  // CRUD operations for each submodule
  const crudOperations = [
    { id: "view", name: "VIEW", color: "text-blue-600" },
    { id: "create", name: "CREATE", color: "text-green-600" },
    { id: "edit", name: "EDIT", color: "text-yellow-600" },
    { id: "delete", name: "DELETE", color: "text-red-600" },
  ]

  const departments = ["all", ...Array.from(new Set(employees.map((emp) => emp.department)))]

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const hasPermission = (employee: Employee, moduleId: string, submoduleId: string, operation: string) => {
    return employee.permissions?.[moduleId]?.[submoduleId]?.[operation] || false
  }

  const togglePermission = (employeeId: string, moduleId: string, submoduleId: string, operation: string) => {
    if (!isEditMode) return
    console.log("[PermissionMatrix] Toggling permission:", { employeeId, moduleId, submoduleId, operation })
    toggleEmployeePermission(employeeId, moduleId, submoduleId, operation)
  }

  // Calculate total columns for each module (module-level + submodules)
  const getModuleColumnCount = (module: Module) => {
    return crudOperations.length + (module.subModules?.length || 0) * crudOperations.length
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Permission Matrix</CardTitle>
            <CardDescription className="text-base">
              Manage module and submodule permissions for employees
              <br />
              {isEditMode ? (
                <div className="flex items-center mt-2 text-orange-600">
                  <Unlock className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Edit Mode - Click checkboxes to modify permissions</span>
                </div>
              ) : (
                <div className="flex items-center mt-2 text-gray-600">
                  <Lock className="h-4 w-4 mr-1" />
                  <span className="text-sm">View Mode - Click Edit to modify permissions</span>
                </div>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
                disabled={isEditMode}
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={isEditMode}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Edit/Save/Cancel Buttons */}
            <div className="flex items-center space-x-2">
              {!isEditMode ? (
                <Button onClick={onEdit} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Permissions
                </Button>
              ) : (
                <>
                  <Button onClick={onCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button onClick={onSave} disabled={!hasChanges || isSaving} size="sm" className="min-w-[120px]">
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </>
                    )}
                    {hasChanges && <span className="ml-1 text-xs">(•)</span>}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            {/* Main Header Row */}
            <thead>
              <tr>
                <th
                  rowSpan={3}
                  className="border border-gray-300 p-3 bg-gray-100 font-bold text-center align-middle min-w-[150px]"
                >
                  EMPLOYEE NAME
                </th>
                <th
                  rowSpan={3}
                  className="border border-gray-300 p-3 bg-gray-100 font-bold text-center align-middle min-w-[120px]"
                >
                  ROLE
                </th>
                {modules.map((module) => (
                  <th
                    key={module.id}
                    colSpan={getModuleColumnCount(module)}
                    className="border border-gray-300 p-3 bg-blue-100 font-bold text-center"
                  >
                    {module.name.toUpperCase()}
                  </th>
                ))}
              </tr>
              {/* Submodule Header Row */}
              <tr>
                {modules.map((module) => (
                  <React.Fragment key={module.id}>
                    {/* Module-level permissions header */}
                    <th
                      colSpan={crudOperations.length}
                      className="border border-gray-300 p-2 bg-green-50 font-semibold text-center text-xs min-w-[120px]"
                    >
                      MODULE ACCESS
                    </th>
                    {/* Submodule headers */}
                    {(module.subModules || []).map((submodule) => (
                      <th
                        key={`${module.id}-${submodule.id}`}
                        colSpan={crudOperations.length}
                        className="border border-gray-300 p-2 bg-blue-50 font-semibold text-center text-xs min-w-[120px]"
                      >
                        {submodule.name}
                      </th>
                    ))}
                  </React.Fragment>
                ))}
              </tr>
              {/* CRUD Operations Header Row */}
              <tr>
                {modules.map((module) => (
                  <React.Fragment key={module.id}>
                    {/* Module-level CRUD operations */}
                    {crudOperations.map((operation) => (
                      <th
                        key={`${module.id}-_module-${operation.id}`}
                        className="border border-gray-300 p-1 bg-green-100 font-medium text-center text-xs min-w-[60px]"
                      >
                        <div className={`${operation.color} font-bold`}>{operation.name}</div>
                      </th>
                    ))}
                    {/* Submodule CRUD operations */}
                    {(module.subModules || []).map((submodule) =>
                      crudOperations.map((operation) => (
                        <th
                          key={`${module.id}-${submodule.id}-${operation.id}`}
                          className="border border-gray-300 p-1 bg-gray-50 font-medium text-center text-xs min-w-[60px]"
                        >
                          <div className={`${operation.color} font-bold`}>{operation.name}</div>
                        </th>
                      )),
                    )}
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredEmployees.map((employee, index) => (
                <tr key={employee.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {/* Employee Name */}
                  <td className="border border-gray-300 p-3 font-semibold">
                    <div>
                      <div className="font-bold text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-600">{employee.email}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {employee.department}
                        </Badge>
                        <Badge variant={employee.status === "Active" ? "default" : "secondary"} className="text-xs">
                          {employee.status}
                        </Badge>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="border border-gray-300 p-3 text-center font-medium">{employee.role}</td>

                  {/* Permission Checkboxes for each Module and Submodule */}
                  {modules.map((module) => (
                    <React.Fragment key={module.id}>
                      {/* Module-level permissions */}
                      {crudOperations.map((operation) => {
                        const isChecked = hasPermission(employee, module.id, "_module", operation.id)
                        return (
                          <td
                            key={`${employee.id}-${module.id}-_module-${operation.id}`}
                            className={`border border-gray-300 p-2 text-center transition-colors ${
                              isEditMode ? "hover:bg-green-100 cursor-pointer" : "cursor-not-allowed"
                            } ${!isEditMode ? "bg-gray-50" : "bg-green-50"}`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() =>
                                togglePermission(employee.id, module.id, "_module", operation.id)
                              }
                              className={`h-4 w-4 ${isEditMode ? "cursor-pointer" : "cursor-not-allowed"}`}
                              disabled={!isEditMode}
                              title={
                                isEditMode
                                  ? `${isChecked ? "Revoke" : "Grant"} ${operation.name} permission for ${module.name} module`
                                  : "Click Edit to modify permissions"
                              }
                            />
                          </td>
                        )
                      })}
                      
                      {/* Submodule permissions */}
                      {(module.subModules || []).map((submodule) =>
                        crudOperations.map((operation) => {
                          const isChecked = hasPermission(employee, module.id, submodule.id, operation.id)
                          return (
                            <td
                              key={`${employee.id}-${module.id}-${submodule.id}-${operation.id}`}
                              className={`border border-gray-300 p-2 text-center transition-colors ${
                                isEditMode ? "hover:bg-gray-100 cursor-pointer" : "cursor-not-allowed"
                              } ${!isEditMode ? "bg-gray-50" : ""}`}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() =>
                                  togglePermission(employee.id, module.id, submodule.id, operation.id)
                                }
                                className={`h-4 w-4 ${isEditMode ? "cursor-pointer" : "cursor-not-allowed"}`}
                                disabled={!isEditMode}
                                title={
                                  isEditMode
                                    ? `${isChecked ? "Revoke" : "Grant"} ${operation.name} permission for ${submodule.name}`
                                    : "Click Edit to modify permissions"
                                }
                              />
                            </td>
                          )
                        }),
                      )}
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No employees found matching your search criteria.</p>
          </div>
        )}

        {/* Status Bar */}
        {isEditMode && !isSaving && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-orange-700">
                <Unlock className="h-4 w-4 mr-2" />
                <span>Edit Mode Active - {hasChanges ? "You have unsaved changes" : "No changes made yet"}</span>
              </div>
              <div className="text-orange-600">Click Save to persist changes or Cancel to discard them</div>
            </div>
          </div>
        )}
        
        {/* Saving Status Bar */}
        {isSaving && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-center text-sm">
              <div className="flex items-center text-blue-700">
                <div className="w-4 h-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">Saving permissions... Please wait</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}