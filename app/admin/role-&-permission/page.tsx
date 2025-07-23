"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PermissionMatrix } from "@/components/rbac/PermissionMatrix"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import ProtectedRoute from "@/components/protected-route"

export default function RolePermissions() {
  const [searchTerm, setSearchTerm] = useState("")
  
  // Type definitions for Employee and Permissions
  type Employee = {
    id: string
    name: string
    email: string
    role: string
    department: string
    status: string
    permissions: Record<string, Record<string, Record<string, boolean>>> // moduleId -> submoduleId -> action -> hasPermission
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
  const [isSaving, setIsSaving] = useState(false)

  // Fetch employees and permissions from database
  const fetchData = async () => {
    try {
      setLoading(true)
      console.log("[RolePermissions] Fetching employee permissions data...")
      
      const response = await fetch("/api/employees/permissions")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[RolePermissions] API Response:", result)

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch data")
      }

      const data = result.data || result
      console.log("[RolePermissions] Processed data:", { 
        employeesCount: data.employees?.length, 
        modulesCount: data.modules?.length,
        sampleEmployee: data.employees?.[0]
      })
      
      setEmployees(data.employees || [])
      setModules(data.modules || [])
      setOriginalPermissions(JSON.parse(JSON.stringify(data.employees || []))) // Deep copy
      
      console.log("[RolePermissions] State updated successfully")
    } catch (error) {
      console.error("[RolePermissions] Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch employee permissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Toggle employee permission (only in edit mode)
  const toggleEmployeePermission = (employeeId: string, moduleId: string, submoduleId: string, permissionType: string) => {
    if (!isEditMode) return

    console.log("[RolePermissions] Toggling permission:", {
      employeeId,
      moduleId,
      submoduleId,
      permissionType
    })

    // Find current permission value
    const employee = employees.find((emp) => emp.id === employeeId)
    if (!employee) {
      console.error("[RolePermissions] Employee not found:", employeeId)
      return
    }

    const currentValue = employee.permissions?.[moduleId]?.[submoduleId]?.[permissionType] || false
    const newValue = !currentValue

    console.log("[RolePermissions] Permission toggle:", {
      currentValue,
      newValue
    })

    // Update local state with correct structure
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
    console.log("[RolePermissions] Entering edit mode")
    setIsEditMode(true)
    setOriginalPermissions(JSON.parse(JSON.stringify(employees))) // Deep copy current state
    setHasChanges(false)
  }

  // Cancel edit mode and revert changes
  const handleCancel = () => {
    console.log("[RolePermissions] Cancelling edit mode")
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
      console.log("[RolePermissions] No changes to save")
      setIsEditMode(false)
      return
    }

    try {
      setIsSaving(true)
      console.log("[RolePermissions] Starting save process...")
      
      const employeeChanges: Record<string, Array<{
        moduleId: string
        submoduleId: string
        permissionType: string
        value: boolean
      }>> = {}

      // Compare current state with original to find changes
      employees.forEach((employee) => {
        const originalEmployee = originalPermissions.find((orig) => orig.id === employee.id)
        if (!originalEmployee) return

        const employeeId = employee.id
        const changes: Array<{
          moduleId: string
          submoduleId: string
          permissionType: string
          value: boolean
        }> = []

        // Check all modules and submodules for changes (including module-level permissions)
        modules.forEach((module) => {
          const moduleId = module.id
          
          // Check module-level permissions (_module)
          const currentModulePerms = employee.permissions[moduleId]?._module || {}
          const originalModulePerms = originalEmployee.permissions[moduleId]?._module || {}
          
          const permissionTypes = ['view', 'create', 'edit', 'delete', 'manage']
          permissionTypes.forEach((permissionType) => {
            const currentValue = currentModulePerms[permissionType] || false
            const originalValue = originalModulePerms[permissionType] || false
            
            if (currentValue !== originalValue) {
              changes.push({
                moduleId,
                submoduleId: '_module',
                permissionType,
                value: currentValue
              })
              console.log(`[RolePermissions] Module-level change detected for ${employee.name}: ${moduleId}:_module:${permissionType} = ${currentValue}`)
            }
          })
          
          // Check submodule-level permissions
          if (module.subModules && module.subModules.length > 0) {
            module.subModules.forEach((submodule) => {
              const submoduleId = submodule.id
              
              const currentPerms = employee.permissions[moduleId]?.[submoduleId] || {}
              const originalPerms = originalEmployee.permissions[moduleId]?.[submoduleId] || {}

              // Check each permission type for changes
              permissionTypes.forEach((permissionType) => {
                const currentValue = currentPerms[permissionType] || false
                const originalValue = originalPerms[permissionType] || false
                
                if (currentValue !== originalValue) {
                  changes.push({
                    moduleId,
                    submoduleId,
                    permissionType,
                    value: currentValue
                  })
                  console.log(`[RolePermissions] Submodule change detected for ${employee.name}: ${moduleId}:${submoduleId}:${permissionType} = ${currentValue}`)
                }
              })
            })
          }
        })

        if (changes.length > 0) {
          employeeChanges[employeeId] = changes
        }
      })

      const totalChanges = Object.values(employeeChanges).reduce((sum, changes) => sum + changes.length, 0)
      
      console.log("[RolePermissions] Total changes to save:", totalChanges)
      console.log("[RolePermissions] Employee changes:", employeeChanges)
      
      if (totalChanges === 0) {
        setIsEditMode(false)
        setHasChanges(false)
        setIsSaving(false)
        toast({
          title: "No Changes",
          description: "No permission changes detected",
        })
        return
      }

      // Save changes for each employee using batch API
      const savePromises = Object.entries(employeeChanges).map(async ([employeeId, changes]) => {
        console.log(`[RolePermissions] Saving ${changes.length} changes for employee ${employeeId}`)
        
        const response = await fetch("/api/employees/permissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId,
            batchUpdates: changes
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error(`[RolePermissions] Failed to save permissions for ${employeeId}:`, errorData)
          throw new Error(`Failed to save permissions for employee ${employeeId}: ${errorData.error || 'Unknown error'}`)
        }
        
        const result = await response.json()
        console.log(`[RolePermissions] Successfully saved permissions for ${employeeId}:`, result)
        return result
      })

      const results = await Promise.all(savePromises)
      console.log("[RolePermissions] All save operations completed:", results)

      // Update state to reflect saved changes
      setIsEditMode(false)
      setHasChanges(false)
      setOriginalPermissions(JSON.parse(JSON.stringify(employees))) // Update original state

      toast({
        title: "Permissions Saved",
        description: `Successfully updated ${totalChanges} permission(s) for ${Object.keys(employeeChanges).length} employee(s)`,
      })

      // Refresh data from server to ensure consistency
      console.log("[RolePermissions] Refreshing data from server...")
      await fetchData()

    } catch (error) {
      console.error("[RolePermissions] Error saving permissions:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save permissions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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
      <ProtectedRoute>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User-Specific Permissions</h1>
          <p className="text-gray-600">Configure individual user permissions for modules and submodules</p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {employees.filter((emp) => emp.status === "Active").length}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
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
            isSaving={isSaving}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </TabsContent>
      </Tabs>
    </div></ProtectedRoute>
  )
}