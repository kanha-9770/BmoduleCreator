"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/compone  nts/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, ArrowUp, ArrowDown, Save, X, MoreHorizontal, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Form {
  id: string
  name: string
}

interface ProcessedFieldData {
  recordId?: string // Added recordId field
  recordIdFromAPI?: string // Added recordIdFromAPI field
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
  formName?: string // Added formName field
}

interface EnhancedFormRecord {
  id: string
  formId: string
  formName?: string
  recordData: Record<string, any>
  submittedAt: string
  status: "pending" | "approved" | "rejected" | "submitted"
  processedData: ProcessedFieldData[]
  originalRecordIds?: Map<string, string> // formId -> original record ID
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

  // === renderFieldEditor – handles all field types ===
  const renderFieldEditor = (record: EnhancedFormRecord, fieldDef: FormFieldWithSection) => {
    const fieldData = record.processedData.find(
      (pd) => pd.fieldId === fieldDef.id || pd.fieldId === fieldDef.originalId,
    )

    const actualRecordId = fieldData?.recordId || record.id
    const actualFormId = fieldData?.formId || record.formId

    const pendingChange = pendingChanges.get(`${record.id}-${fieldDef.id}`)
    const currentValue = pendingChange ? pendingChange.value : (fieldData?.value ?? "")
    const originalValue = fieldData?.value ?? ""

    const originalFieldId = fieldData?.fieldId || fieldDef.originalId

    // --- Text / Number / Date / Default ---
    if (!["lookup", "dropdown"].includes(fieldDef.type)) {
      return (
        <Input
          value={currentValue}
          onChange={(e) => {
            const newValue = e.target.value

            const newPendingChanges = new Map(pendingChanges)
            newPendingChanges.set(`${record.id}-${fieldDef.id}`, {
              recordId: actualRecordId,
              fieldId: fieldDef.id,
              originalFieldId: originalFieldId,
              value: newValue,
              originalValue,
              fieldType: fieldDef.type,
              fieldLabel: fieldDef.label,
            })

            setPendingChanges(newPendingChanges)
          }}
          onBlur={() => {
            setEditingCell(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              setEditingCell(null)
            } else if (e.key === "Escape") {
              setPendingChanges(
                new Map(Array.from(pendingChanges).filter(([key]) => key !== `${record.id}-${fieldDef.id}`)),
              )
              setEditingCell(null)
            }
          }}
          autoFocus
          className="h-7 text-[10px] sm:text-xs p-1"
          aria-label={`Edit ${fieldDef.label}`}
        />
      )
    }

    // --- Dropdown & Lookup ---
    const options = fieldDef.type === "lookup" ? (fieldDef.lookup?.options ?? []) : (fieldDef.options ?? [])

    const normalised = options.map((opt: any) => ({
      value: opt.value ?? opt.id ?? opt,
      label: opt.label ?? opt.name ?? opt,
    }))

    return (
      <Select
        value={currentValue?.toString() ?? "default"}
        onValueChange={(newValue) => {
          setPendingChanges(
            new Map(pendingChanges).set(`${record.id}-${fieldDef.id}`, {
              recordId: actualRecordId,
              fieldId: fieldDef.id,
              originalFieldId: originalFieldId,
              value: newValue,
              originalValue,
              fieldType: fieldDef.type,
              fieldLabel: fieldDef.label,
            }),
          )
        }}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCell(null)
          }
        }}
      >
        <SelectTrigger className="h-7 text-[10px] sm:text-xs p-1">
          <SelectValue placeholder="— Select —" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">— None —</SelectItem>
          {normalised.map((opt: any) => (
            <SelectItem key={opt.value} value={opt.value.toString()}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // === Helper: Get unique field definitions ===
  const getUniqueFieldDefinitions = () => {
    const fieldMap = new Map()

    formRecords.forEach((record) => {
      record.processedData.forEach((fieldData) => {
        const key = fieldData.fieldId
        if (!fieldMap.has(key)) {
          fieldMap.set(key, {
            id: fieldData.fieldId,
            originalId: fieldData.fieldId,
            label: fieldData.fieldLabel,
            type: fieldData.fieldType,
            order: fieldData.order || 999,
            sectionTitle: fieldData.sectionTitle || "Default Section",
            sectionId: fieldData.sectionId || "",
            formId: fieldData.formId || record.formId,
            formName: record.formName || "Unknown Form",
            options: fieldData.options,
            lookup: fieldData.lookup,
          })
        }
      })
    })

    return Array.from(fieldMap.values()).sort((a, b) => {
      if (a.formId !== b.formId) return a.formId.localeCompare(b.formId)
      return a.order - b.order
    })
  }

  // === Helper: Compute merged records ===
  const computeMergedRecords = (): EnhancedFormRecord[] => {
    const recordsByForm = new Map<string, EnhancedFormRecord[]>()
    for (const record of formRecords) {
      if (!recordsByForm.has(record.formId)) {
        recordsByForm.set(record.formId, [])
      }
      recordsByForm.get(record.formId)!.push(record)
    }

    for (const records of recordsByForm.values()) {
      records.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    }

    let maxRows = 0
    for (const records of recordsByForm.values()) {
      maxRows = Math.max(maxRows, records.length)
    }

    const mergedRecordsList: EnhancedFormRecord[] = []
    for (let i = 0; i < maxRows; i++) {
      const mergedRecord: EnhancedFormRecord = {
        id: `merged-${i}`,
        formId: "merged",
        formName: "Merged",
        recordData: {},
        submittedAt: "",
        status: "submitted",
        processedData: [],
        originalRecordIds: new Map<string, string>(),
      }

      let latestSubmittedAt = 0
      let latestStatus: EnhancedFormRecord["status"] = "submitted"
      const combinedProcessedData: ProcessedFieldData[] = []
      const combinedRecordData: Record<string, any> = {}

      for (const [formId, records] of recordsByForm.entries()) {
        if (i < records.length) {
          const rec = records[i]
          mergedRecord.originalRecordIds!.set(rec.formId, rec.id)

          const updatedProcessedData = rec.processedData.map((pd) => ({
            ...pd,
            formId: rec.formId,
          }))
          combinedProcessedData.push(...updatedProcessedData)
          Object.assign(combinedRecordData, rec.recordData)
          const subTime = new Date(rec.submittedAt).getTime()
          if (subTime > latestSubmittedAt) {
            latestSubmittedAt = subTime
            mergedRecord.submittedAt = rec.submittedAt
            latestStatus = rec.status
          }
        }
      }

      mergedRecord.processedData = combinedProcessedData
      mergedRecord.recordData = combinedRecordData
      mergedRecord.status = latestStatus

      if (latestSubmittedAt > 0) {
        mergedRecordsList.push(mergedRecord)
      }
    }

    return mergedRecordsList
  }

  // === Sorting ===
  const sortRecords = (records: EnhancedFormRecord[]): EnhancedFormRecord[] => {
    return [...records].sort((a, b) => {
      let valA: any, valB: any
      if (recordSortField === "submittedAt") {
        valA = new Date(a.submittedAt).getTime()
        valB = new Date(b.submittedAt).getTime()
      } else if (recordSortField === "status") {
        valA = a.status
        valB = b.status
      } else {
        const fieldDataA = a.processedData.find((pd) => pd.fieldId === recordSortField)
        const fieldDataB = b.processedData.find((pd) => pd.fieldId === recordSortField)
        valA = fieldDataA?.displayValue || fieldDataA?.value || ""
        valB = fieldDataB?.displayValue || fieldDataB?.value || ""
      }
      if (valA < valB) return recordSortOrder === "asc" ? -1 : 1
      if (valA > valB) return recordSortOrder === "asc" ? 1 : -1
      return 0
    })
  }

  const handleDoubleClick = (record: EnhancedFormRecord, fieldDef: FormFieldWithSection) => {
    if (editMode !== "double-click" || savingChanges) return

    const fieldData = record.processedData.find((pd) => pd.fieldId === fieldDef.id)
    if (!fieldData) return

    setEditingCell({
      recordId: record.id,
      fieldId: fieldDef.id,
      value: fieldData.value || "",
      originalValue: fieldData.value || "",
      fieldType: fieldDef.type,
      options: fieldDef.options,
    })
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    record: EnhancedFormRecord,
    fieldDef: FormFieldWithSection,
  ) => {
    if (e.key === "Enter" && !savingChanges && editMode !== "locked") {
      const fieldData = record.processedData.find((pd) => pd.fieldId === fieldDef.id)
      if (!fieldData) return

      setEditingCell({
        recordId: record.id,
        fieldId: fieldDef.id,
        value: fieldData.value || "",
        originalValue: fieldData.value || "",
        fieldType: fieldDef.type,
        options: fieldDef.options,
      })
    }
  }

  // === DATA PREPARATION ===
  const mergedRecords = computeMergedRecords()
  const originalRecords = formRecords

  // Choose base records: merged or filtered by form
  let baseRecords: EnhancedFormRecord[] = mergedRecords
  if (selectedFormFilter !== "all") {
    baseRecords = originalRecords.filter((r) => r.formId === selectedFormFilter)
  }

  const sortedRecords = sortRecords(baseRecords)

  // Apply search filter
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

  // Title based on selection
  const selectedFormName =
    selectedFormFilter === "all"
      ? "All Forms"
      : (allModuleForms.find((f) => f.id === selectedFormFilter)?.name ?? "Unknown")

  return (
    <Card className="border-gray-300 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {selectedFormFilter === "all" ? "Merged Records" : `${selectedFormName} Records`}
          </CardTitle>
          <div className="flex items-center gap-2">
            {pendingChanges.size > 0 && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={async () => {
                    await saveAllPendingChanges()
                    setEditingCell(null)
                  }}
                  disabled={savingChanges}
                >
                  {savingChanges ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    discardAllPendingChanges()
                    setEditingCell(null)
                  }}
                  disabled={savingChanges}
                >
                  <X className="h-4 w-4 mr-2" />
                  Discard
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleEditMode}
              className={cn("flex items-center gap-2", editModeInfo.color)}
            >
              {React.createElement(editModeInfo.icon, { className: "h-4 w-4" })}
              {editModeInfo.label}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-4 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search records..."
                  value={recordSearchQuery}
                  onChange={(e) => setRecordSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:ring-blue-500 h-8"
                />
              </div>
              <Select value={selectedFormFilter} onValueChange={setSelectedFormFilter}>
                <SelectTrigger className="w-[180px] h-8">
                  <Filter className="h-4 w-4 mr-2" />
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
              <Select value={recordsPerPage.toString()} onValueChange={(value) => setRecordsPerPage(Number(value))}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {totalRecords > recordsPerPage && (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
              <div className="text-sm text-gray-600">
                Showing {startIdx + 1} to {Math.min(endIdx, totalRecords)} of {totalRecords} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {Math.ceil(totalRecords / recordsPerPage)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(Math.ceil(totalRecords / recordsPerPage), currentPage + 1))}
                  disabled={currentPage >= Math.ceil(totalRecords / recordsPerPage)}
                >
                  Next
                </Button>
              </div>
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
                      <div className="flex items-center gap-1">
                        <span className="hidden sm:inline">Submitted</span>
                        <span className="sm:hidden">Date</span>
                        {recordSortField === "submittedAt" &&
                          (recordSortOrder === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          ))}
                      </div>
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
                      <div className="flex items-center gap-1">
                        Status
                        {recordSortField === "status" &&
                          (recordSortOrder === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          ))}
                      </div>
                    </div>
                    {uniqueFieldDefs.map((field) => (
                      <div
                        key={field.id}
                        className="w-32 sm:w-40 h-8 border-r border-gray-400 bg-gray-200 flex flex-col items-center justify-center text-xs font-bold text-gray-700 px-1 cursor-pointer hover:bg-gray-300"
                        title={`${field.formName} - ${field.sectionTitle} - ${field.label} (${field.type})`}
                        onClick={() => {
                          if (recordSortField === field.id) {
                            setRecordSortOrder(recordSortOrder === "asc" ? "desc" : "asc")
                          } else {
                            setRecordSortField(field.id)
                            setRecordSortOrder("asc")
                          }
                        }}
                      >
                        <div className="flex flex-col items-center gap-0.5 truncate w-full">
                          <div className="text-[8px] sm:text-[9px] text-blue-600 font-normal truncate w-full text-center">
                            {field.formName}
                          </div>
                          <div className="flex items-center gap-1 truncate w-full justify-center">
                            {React.createElement(getFieldIcon(field.type), {
                              className: "h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0",
                            })}
                            <span className="truncate text-[10px] sm:text-xs font-bold">{field.label}</span>
                            {recordSortField === field.id &&
                              (recordSortOrder === "asc" ? (
                                <ArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              ) : (
                                <ArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              ))}
                          </div>
                        </div>
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
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-5 w-5 p-0 hover:bg-gray-100">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="text-xs">
                              <Eye className="h-3 w-3 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">
                              <Edit className="h-3 w-3 mr-2" />
                              Edit Record
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs text-red-600">
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="w-28 sm:w-32 h-7 border-r border-b border-gray-300 bg-white flex items-center px-2 text-[10px] sm:text-xs">
                        <span className="hidden sm:inline">{new Date(record.submittedAt).toLocaleDateString()}</span>
                        <span className="sm:hidden">
                          {new Date(record.submittedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="w-20 sm:w-24 h-7 border-r border-b border-gray-300 bg-white px-1">
                        <div className="text-[9px] sm:text-xs px-1 py-0 h-4">
                          <span className="hidden sm:inline">{record.status || "submitted"}</span>
                          <span className="sm:hidden">{(record.status || "submitted").charAt(0).toUpperCase()}</span>
                        </div>
                      </div>

                      {uniqueFieldDefs.map((fieldDef) => {
                        const fieldData = record.processedData.find((pd) => pd.fieldId === fieldDef.id)
                        const pendingChange = pendingChanges.get(`${record.id}-${fieldDef.id}`)
                        const displayValue = pendingChange
                          ? pendingChange.value
                          : fieldData?.displayValue || fieldData?.value || ""
                        const isEditing =
                          editingCell && editingCell.recordId === record.id && editingCell.fieldId === fieldDef.id

                        return (
                          <div
                            key={`${record.id}-${fieldDef.id}`}
                            id={`${record.id}-${fieldDef.id}`}
                            className={cn(
                              "w-32 sm:w-40 h-7 border-r border-b border-gray-300 bg-white flex items-center justify-start px-2 text-[10px] sm:text-xs",
                              isEditing && "ring-1 ring-blue-500",
                              pendingChange && !isEditing && "bg-yellow-50",
                              editMode === "double-click" && !isEditing && "cursor-pointer hover:bg-gray-100",
                            )}
                            title={`${fieldDef.label}: ${displayValue}`}
                            onDoubleClick={() => handleDoubleClick(record, fieldDef)}
                            onKeyDown={(e) => handleKeyDown(e, record, fieldDef)}
                            tabIndex={0}
                            aria-label={`Cell for ${fieldDef.label} in record ${record.id}`}
                          >
                            {isEditing ? (
                              renderFieldEditor(record, fieldDef)
                            ) : (
                              <span className="truncate">{displayValue || "—"}</span>
                            )}
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
