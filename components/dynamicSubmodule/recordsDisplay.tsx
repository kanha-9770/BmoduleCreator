"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, ArrowUp, ArrowDown, Save, X, MoreHorizontal, Eye, Edit, Trash2, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { fetchEmployeeData } from "@/lib/employee-data"

interface Form {
  id: string
  name: string
}

interface ProcessedFieldData {
  recordId?: string
  recordIdFromAPI?: string
  lookup: any
  options: any
  fieldId: string
  fieldLabel: string
  fieldType: string
  value: any
  displayValue: string
  icon: string
  order: number
  sectionId?: string
  sectionTitle?: string
  formId?: string
  formName?: string
}

interface EnhancedFormRecord {
  id: string
  formId: string
  formName?: string
  recordData: Record<string, any>
  submittedAt: string
  status: "pending" | "approved" | "rejected" | "submitted"
  processedData: ProcessedFieldData[]
  originalRecordIds?: Map<string, string>
}

interface FormFieldWithSection {
  id: string
  originalId: string
  label: string
  type: string
  order: number
  sectionTitle: string
  sectionId: string
  formId: string
  formName: string
  placeholder?: string
  description?: string
  validation?: any
  options?: any[]
  lookup?: any
}

interface EditingCell {
  recordId: string
  fieldId: string
  value: any
  originalValue: any
  fieldType: string
  options?: any[]
}

interface PendingChange {
  recordId: string
  fieldId: string
  originalFieldId: string
  value: any
  originalValue: any
  fieldType: string
  fieldLabel: string
}

interface RecordsDisplayProps {
  allModuleForms: Form[]
  formRecords: EnhancedFormRecord[]
  formFieldsWithSections: FormFieldWithSection[]
  recordSearchQuery: string
  selectedFormFilter: string
  recordsPerPage: number
  currentPage: number
  selectedRecords: Set<string>
  editMode: "locked" | "single-click" | "double-click"
  editingCell: EditingCell | null
  pendingChanges: Map<string, PendingChange>
  savingChanges: boolean
  recordSortField: string
  recordSortOrder: "asc" | "desc"
  setRecordSearchQuery: (query: string) => void
  setSelectedFormFilter: (formId: string) => void
  setRecordsPerPage: (count: number) => void
  setCurrentPage: (page: number) => void
  setSelectedRecords: (records: Set<string>) => void
  setRecordSortField: (field: string) => void
  setRecordSortOrder: (order: "asc" | "desc") => void
  getFieldIcon: (fieldType: string) => any
  getEditModeInfo: () => {
    icon: any
    label: string
    description: string
    color: string
  }
  toggleEditMode: () => void
  saveAllPendingChanges: (changesToSave?: Map<string, PendingChange>) => Promise<void>
  discardAllPendingChanges: () => void
  setEditingCell: (cell: EditingCell | null) => void
  setPendingChanges: (changes: Map<string, PendingChange>) => void
  setFormRecords: (records: EnhancedFormRecord[]) => void
}

const RecordsDisplay: React.FC<RecordsDisplayProps> = ({
  allModuleForms,
  formRecords,
  formFieldsWithSections,
  recordSearchQuery,
  selectedFormFilter,
  recordsPerPage,
  currentPage,
  selectedRecords,
  editMode,
  editingCell,
  pendingChanges,
  savingChanges,
  recordSortField,
  recordSortOrder,
  setRecordSearchQuery,
  setSelectedFormFilter,
  setRecordsPerPage,
  setCurrentPage,
  setSelectedRecords,
  setRecordSortField,
  setRecordSortOrder,
  getFieldIcon,
  getEditModeInfo,
  toggleEditMode,
  saveAllPendingChanges,
  discardAllPendingChanges,
  setEditingCell,
  setPendingChanges,
  setFormRecords,
}) => {
  const { toast } = useToast()

  // Placeholder for records display - using a basic component
  // This will be replaced with the full implementation from the read-only context

  const [employeeDataCache, setEmployeeDataCache] = useState<Map<string, any>>(new Map())
  const [loadingEmployees, setLoadingEmployees] = useState<Set<string>>(new Set())

  const renderFieldEditor = (record: EnhancedFormRecord, fieldDef: FormFieldWithSection) => {
    // Placeholder for field editor rendering logic
  }

  const getUniqueFieldDefinitions = () => {
    // Placeholder for getting unique field definitions logic
    return []
  }

  const computeMergedRecords = (): EnhancedFormRecord[] => {
    // Placeholder for computing merged records logic
    return []
  }

  const sortRecords = (records: EnhancedFormRecord[]): EnhancedFormRecord[] => {
    // Placeholder for sorting records logic
    return records
  }

  const handleDoubleClick = (record: EnhancedFormRecord, fieldDef: FormFieldWithSection) => {
    // Placeholder for double click handling logic
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    record: EnhancedFormRecord,
    fieldDef: FormFieldWithSection,
  ) => {
    // Placeholder for key down handling logic
  }

  useEffect(() => {
    const loadEmployeeDataForRecords = async () => {
      const recordsToLoad = formRecords.filter((record) => {
        const userId = record.recordData?.userId?.value || record.recordData?.userId
        return userId && !employeeDataCache.has(userId) && !loadingEmployees.has(userId)
      })

      if (recordsToLoad.length === 0) return

      setLoadingEmployees((prev) => {
        const newSet = new Set(prev)
        recordsToLoad.forEach((r) => {
          const userId = r.recordData?.userId?.value || r.recordData?.userId
          if (userId) newSet.add(userId)
        })
        return newSet
      })

      for (const record of recordsToLoad) {
        const userId = record.recordData?.userId?.value || record.recordData?.userId
        if (userId) {
          const empData = await fetchEmployeeData(userId)
          if (empData) {
            setEmployeeDataCache((prev) => new Map(prev).set(userId, empData))
          }
          setLoadingEmployees((prev) => {
            const newSet = new Set(prev)
            newSet.delete(userId)
            return newSet
          })
        }
      }
    }

    loadEmployeeDataForRecords()
  }, [formRecords, employeeDataCache, loadingEmployees])

  const getEmployeeDataForRecord = (record: EnhancedFormRecord) => {
    const userId = record.recordData?.userId?.value || record.recordData?.userId
    if (!userId) return null
    return employeeDataCache.get(userId) || null
  }

  const isAttendanceForm = () => {
    return selectedFormFilter !== "all" || formRecords.some((r) => r.formName?.toLowerCase().includes("attendance"))
  }

  const employeeColumns = isAttendanceForm()
    ? [
        { id: "employee_name", label: "Employee Name", order: -5 },
        { id: "designation", label: "Designation", order: -4 },
        { id: "department", label: "Department", order: -3 },
        { id: "shift_times", label: "Working Hours", order: -2 },
        { id: "salary", label: "Salary", order: -1 },
      ]
    : []

  // DATA PREPARATION
  const mergedRecords = computeMergedRecords()
  const originalRecords = formRecords

  let baseRecords: EnhancedFormRecord[] = mergedRecords
  if (selectedFormFilter !== "all") {
    baseRecords = originalRecords.filter((r) => r.formId === selectedFormFilter)
  }

  const sortedRecords = sortRecords(baseRecords)

  let filteredRecords = sortedRecords
  if (recordSearchQuery) {
    const lowerQuery = recordSearchQuery.toLowerCase()
    filteredRecords = filteredRecords.filter((record) =>
      record.processedData.some((pd) => (pd.displayValue ?? "").toString().toLowerCase().includes(lowerQuery)),
    )
  }

  const totalRecords = filteredRecords.length
  const startIdx = (currentPage - 1) * recordsPerPage
  const endIdx = currentPage * recordsPerPage
  const paginatedRecords = filteredRecords.slice(startIdx, endIdx)

  const uniqueFieldDefs = getUniqueFieldDefinitions()

  const editModeInfo = getEditModeInfo()

  const selectedFormName =
    selectedFormFilter === "all"
      ? "All Forms"
      : (allModuleForms.find((f) => f.id === selectedFormFilter)?.name ?? "Unknown")

  return (
    <Card className="border-gray-300 shadow-sm">
      <CardHeader>
        <CardTitle>Records Display</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50 p-4 rounded-lg">
            <Input
              type="text"
              placeholder="Search records..."
              value={recordSearchQuery}
              onChange={(e) => setRecordSearchQuery(e.target.value)}
              className="w-full sm:w-auto"
            />
            <Select
              value={selectedFormFilter}
              onValueChange={setSelectedFormFilter}
              className="w-full sm:w-auto"
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Forms</SelectItem>
                {allModuleForms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={toggleEditMode}>
              {editModeInfo.icon}
              {editModeInfo.label}
            </Button>
            <Button variant="outline" onClick={saveAllPendingChanges}>
              {savingChanges ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
            <Button variant="outline" onClick={discardAllPendingChanges}>
              <X className="mr-2 h-4 w-4" />
              Discard Changes
            </Button>
          </div>

          {totalRecords > recordsPerPage && (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <Button variant="outline" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                <ArrowUp className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <span className="font-medium text-gray-700">
                Page {currentPage} of {Math.ceil(totalRecords / recordsPerPage)}
              </span>
              <Button variant="outline" onClick={() => setCurrentPage(currentPage + 1)} disabled={endIdx >= totalRecords}>
                <ArrowDown className="mr-2 h-4 w-4" />
                Next
              </Button>
            </div>
          )}

          <div className="border border-gray-400 bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-auto max-h-[60vh]">
              <div className="inline-block min-w-full">
                <div style={{ fontFamily: "Calibri, sans-serif" }}>
                  <div className="flex bg-gray-100 border-b border-gray-400 sticky top-0 z-20 min-w-max">
                    <div className="w-10 h-8 border-r border-gray-400 bg-gray-200 flex items-center justify-center">
                      <Checkbox
                        checked={selectedRecords.size === paginatedRecords.length && paginatedRecords.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRecords(new Set(paginatedRecords.map((r) => r.id)))
                          } else {
                            setSelectedRecords(new Set())
                          }
                        }}
                        className="h-3 w-3"
                      />
                    </div>
                    <div className="w-12 h-8 border-r border-gray-400 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                      #
                    </div>
                    <div className="w-20 sm:w-24 h-8 border-r border-gray-400 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                      Actions
                    </div>
                    <div
                      className="w-28 sm:w-32 h-8 border-r border-gray-400 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-300"
                      onClick={() => {
                        if (recordSortField === "submittedAt") {
                          setRecordSortOrder(recordSortOrder === "asc" ? "desc" : "asc")
                        } else {
                          setRecordSortField("submittedAt")
                          setRecordSortOrder("asc")
                        }
                      }}
                    >
                      Submitted At
                    </div>
                    <div
                      className="w-20 sm:w-24 h-8 border-r border-gray-400 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-300"
                      onClick={() => {
                        if (recordSortField === "status") {
                          setRecordSortOrder(recordSortOrder === "asc" ? "desc" : "asc")
                        } else {
                          setRecordSortField("status")
                          setRecordSortOrder("asc")
                        }
                      }}
                    >
                      Status
                    </div>

                    {employeeColumns.map((col) => (
                      <div
                        key={col.id}
                        className="w-32 sm:w-40 h-8 border-r border-gray-400 bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 px-1 cursor-pointer hover:bg-blue-200"
                        title={col.label}
                      >
                        <span className="truncate">{col.label}</span>
                      </div>
                    ))}

                    {uniqueFieldDefs.map((field) => (
                      <div
                        key={field.id}
                        className="w-32 sm:w-40 h-8 border-r border-gray-400 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-300"
                        onClick={() => {
                          if (recordSortField === field.fieldId) {
                            setRecordSortOrder(recordSortOrder === "asc" ? "desc" : "asc")
                          } else {
                            setRecordSortField(field.fieldId)
                            setRecordSortOrder("asc")
                          }
                        }}
                      >
                        <span className="truncate">{field.fieldLabel}</span>
                      </div>
                    ))}
                  </div>

                  {paginatedRecords.map((record, rowIndex) => (
                    <div key={record.id} className="flex hover:bg-blue-50 min-w-max">
                      <div className="w-10 h-7 border-r border-b border-gray-300 bg-white flex items-center justify-center">
                        <Checkbox
                          checked={selectedRecords.has(record.id)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedRecords)
                            if (checked) newSelected.add(record.id)
                            else newSelected.delete(record.id)
                            setSelectedRecords(newSelected)
                          }}
                          className="h-3 w-3"
                        />
                      </div>
                      <div className="w-12 h-7 border-r border-b border-gray-300 bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                        {startIdx + rowIndex + 1}
                      </div>
                      <div className="w-20 sm:w-24 h-7 border-r border-b border-gray-300 bg-white flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => console.log("View record", record.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log("Edit record", record.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log("Delete record", record.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="w-28 sm:w-32 h-7 border-r border-b border-gray-300 bg-white flex items-center px-2 text-[10px] sm:text-xs">
                        {new Date(record.submittedAt).toLocaleString()}
                      </div>
                      <div className="w-20 sm:w-24 h-7 border-r border-b border-gray-300 bg-white px-1">
                        <Badge variant={record.status === "approved" ? "success" : record.status === "rejected" ? "destructive" : "default"}>
                          {record.status}
                        </Badge>
                      </div>

                      {employeeColumns.map((col) => {
                        const empData = getEmployeeDataForRecord(record)
                        const isLoading = (() => {
                          const userId = record.recordData?.userId?.value || record.recordData?.userId
                          return userId ? loadingEmployees.has(userId) : false
                        })()

                        let cellContent = "—"
                        if (isLoading) {
                          cellContent = "Loading..."
                        } else if (empData) {
                          switch (col.id) {
                            case "employee_name":
                              cellContent = empData.employeeName
                              break
                            case "designation":
                              cellContent = empData.designation
                              break
                            case "department":
                              cellContent = empData.department
                              break
                            case "shift_times":
                              cellContent = `${empData.inTime} - ${empData.outTime}`
                              break
                            case "salary":
                              cellContent = empData.totalSalary ? `₹${empData.totalSalary.toLocaleString()}` : "—"
                              break
                          }
                        }

                        return (
                          <div
                            key={`${record.id}-${col.id}`}
                            className="w-32 sm:w-40 h-7 border-r border-b border-gray-300 bg-blue-50 flex items-center px-2 text-[10px] sm:text-xs"
                            title={cellContent}
                          >
                            <span className="truncate">{cellContent}</span>
                          </div>
                        )
                      })}

                      {uniqueFieldDefs.map((fieldDef) => {
                        const fieldData = record.processedData.find((pd) => pd.fieldId === fieldDef.id)
                        if (!fieldData) return null

                        return (
                          <div
                            key={`${record.id}-${fieldDef.id}`}
                            className="w-32 sm:w-40 h-7 border-r border-b border-gray-300 bg-white flex items-center px-2 text-[10px] sm:text-xs"
                            title={fieldData.displayValue}
                          >
                            <span className="truncate">{fieldData.displayValue}</span>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecordsDisplay
