"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PermissionMatrix } from "@/components/rbac/PermissionMatrix"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function RolePermissions() {
  const [searchTerm, setSearchTerm] = useState("")
  // Type definitions for Employee and Permissions
  type Permissions = Record<string, Record<string, Record<string, boolean>>>
  type Employee = {
    id: string
    name: string
    email: string
    role: string
    department: string
    status: string
    permissions: Permissions
  }

  type Module = {
    id: string
    name: string
    description: string
    subModules: Array<{
      id: string
      name: string
    }>
  }

  const [employees, setEmployees] = useState<Employee[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [originalPermissions, setOriginalPermissions] = useState<Employee[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch employees and permissions from database
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch("/api/employees/permissions")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          })
          return
        }

        console.log("Fetched data:", { employeesCount: data.employees?.length, modulesCount: data.modules?.length })
        setEmployees(data.employees || [])
        setModules(data.modules || [])
        setOriginalPermissions(JSON.parse(JSON.stringify(data.employees || []))) // Deep copy
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch employee permissions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Toggle employee permission (only in edit mode)
  const toggleEmployeePermission = (employeeId: string, moduleId: string, submoduleId: string, permissionType: string) => {
    if (!isEditMode) return

    // Find current permission value
    const employee = employees.find((emp) => emp.id === employeeId)
    if (!employee) {
      console.error("Employee not found:", employeeId)
      return
    }

    const currentValue = employee.permissions[moduleId]?.[submoduleId]?.[permissionType] || false
    const newValue = !currentValue

    // Update local state
    setEmployees((prevEmployees) =>
      prevEmployees.map((employee) =>
        employee.id === employeeId
          ? {
              ...employee,
              permissions: {
                ...employee.permissions,
                [moduleId]: {
                  ...employee.permissions[moduleId],
                  [submoduleId]: {
                    ...(employee.permissions[moduleId]?.[submoduleId] || {}),
                    [permissionType]: newValue,
                  },
                },
              },
            }
          : employee,
      ),
    )

    setHasChanges(true)
  }

  // Enable edit mode
  const handleEdit = () => {
    setIsEditMode(true)
    setOriginalPermissions(JSON.parse(JSON.stringify(employees))) // Deep copy current state
    setHasChanges(false)
  }

  // Cancel edit mode and revert changes
  const handleCancel = () => {
    setEmployees(JSON.parse(JSON.stringify(originalPermissions))) // Restore original state
    setIsEditMode(false)
    setHasChanges(false)
    toast({
      title: "Changes Cancelled",
      description: "All changes have been reverted",
    })
  }

  // Save all permission changes
  const handleSave = async () => {
    if (!hasChanges) {
      setIsEditMode(false)
      return
    }

    try {
      const changedPermissions: any[] = []

      // Compare current state with original to find changes
      employees.forEach((employee) => {
        const originalEmployee = originalPermissions.find((orig) => orig.id === employee.id)
        if (!originalEmployee) return

        Object.keys(employee.permissions).forEach((moduleId) => {
          Object.keys(employee.permissions[moduleId]).forEach((submoduleId) => {
            const currentPerms = employee.permissions[moduleId][submoduleId]
            const originalPerms = originalEmployee.permissions[moduleId]?.[submoduleId] || {}

            // Check each permission type for changes
            Object.keys(currentPerms).forEach((permissionType) => {
              if (currentPerms[permissionType] !== originalPerms[permissionType]) {
                changedPermissions.push({
                  employeeId: employee.id,
                  moduleId,
                  submoduleId,
                  permissionType,
                  value: currentPerms[permissionType],
                })
              }
            })
          })
        })
      })

      if (changedPermissions.length === 0) {
        setIsEditMode(false)
        setHasChanges(false)
        return
      }

      // Save all changes to database
      const savePromises = changedPermissions.map((change) =>
        fetch("/api/employees/permissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(change),
        }),
      )

      const results = await Promise.all(savePromises)

      // Check if all requests were successful
      const failedRequests = results.filter((result) => !result.ok)
      if (failedRequests.length > 0) {
        throw new Error(`${failedRequests.length} permission updates failed`)
      }

      setIsEditMode(false)
      setHasChanges(false)
      setOriginalPermissions(JSON.parse(JSON.stringify(employees))) // Update original state

      toast({
        title: "Permissions Saved",
        description: `Successfully updated ${changedPermissions.length} permission(s)`,
      })
    } catch (error) {
      console.error("Error saving permissions:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save permissions. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Define filteredEmployees based on searchTerm
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate submodules count
  const totalSubmodules = modules.reduce((total, module) => total + (module.subModules?.length || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600">Configure user roles and individual employee permissions</p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
            <div className="text-sm text-gray-600">Total Employees</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {employees.filter((emp) => emp.status === "Active").length}
            </div>
            <div className="text-sm text-gray-600">Active Employees</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{modules.length}</div>
            <div className="text-sm text-gray-600">Total Modules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{totalSubmodules}</div>
            <div className="text-sm text-gray-600">Sub-Modules</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsContent value="permissions" className="space-y-4">
          <PermissionMatrix
            employees={filteredEmployees}
            modules={modules}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            toggleEmployeePermission={toggleEmployeePermission}
            isEditMode={isEditMode}
            hasChanges={hasChanges}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}