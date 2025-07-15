"use client"

import { DialogFooter } from "@/components/ui/dialog"

import React from "react"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
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
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Loader2,
  Settings,
  Eye,
  BarChart3,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  FolderPlus,
  Grid,
  List,
  Table,
  FileSpreadsheet,
  Search,
  ArrowUpDown,
  Mail,
  Hash,
  Type,
  CalendarDays,
  Link,
  Upload,
  CheckSquare,
  Radio,
  ChevronDown,
  MoreHorizontal,
  Save,
  X,
  Lock,
  Edit3,
  MousePointer2,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import NextLink from "next/link"
import { cn } from "@/lib/utils"
import { PublicFormDialog } from "@/components/public-form-dialog"

interface FormModule {
  id: string
  name: string
  description?: string
  parentId?: string
  children?: FormModule[]
  forms?: Form[]
}

interface Form {
  id: string
  name: string
  description?: string
  moduleId: string
  isPublished: boolean
  updatedAt: string
  sections: FormSection[]
}

interface FormSection {
  id: string
  title: string
  fields: FormField[]
}

interface FormField {
  id: string
  label: string
  type: string
  order: number
  placeholder?: string
  description?: string
  validation?: any
  options?: any[]
  lookup?: any
}

interface FormRecord {
  id: string
  formId: string
  recordData: Record<string, any>
  submittedAt: string
  status: "pending" | "approved" | "rejected" | "submitted"
}

interface ProcessedFieldData {
  fieldId: string
  fieldLabel: string
  fieldType: string
  value: any
  displayValue: string
  icon: string
  order: number
  sectionId?: string
  sectionTitle?: string
}

interface EnhancedFormRecord extends FormRecord {
  processedData: ProcessedFieldData[]
}

interface FormFieldWithSection extends FormField {
  sectionTitle: string
  sectionId: string
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
  value: any
  originalValue: any
  fieldType: string
  fieldLabel: string
}

interface ParentModuleOption {
  id: string
  name: string
  level: number
}

export default function HomePage() {
  const { toast } = useToast()
  const [modules, setModules] = useState<FormModule[]>([])
  const [filteredModules, setFilteredModules] = useState<FormModule[]>([])
  const [selectedModule, setSelectedModule] = useState<FormModule | null>(null)
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [formRecords, setFormRecords] = useState<EnhancedFormRecord[]>([])
  const [formFieldsWithSections, setFormFieldsWithSections] = useState<FormFieldWithSection[]>([])
  const [loading, setLoading] = useState(true)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmoduleDialogOpen, setIsSubmoduleDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<FormModule | null>(null)
  const [parentModuleForSubmodule, setParentModuleForSubmodule] = useState<FormModule | null>(null)
  const [moduleData, setModuleData] = useState({
    name: "",
    description: "",
    parentId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableParents, setAvailableParents] = useState<ParentModuleOption[]>([])
  const [viewMode, setViewMode] = useState<"excel" | "table" | "grid" | "list">("excel")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Records state
  const [recordSearchQuery, setRecordSearchQuery] = useState("")
  const [filteredRecords, setFilteredRecords] = useState<EnhancedFormRecord[]>([])
  const [recordSortField, setRecordSortField] = useState<string>("")
  const [recordSortOrder, setRecordSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(20)
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set())

  // Form dialog state
  const [selectedFormForFilling, setSelectedFormForFilling] = useState<string | null>(null)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)

  // ENHANCED INLINE EDITING STATE - DOUBLE CLICK + GLOBAL EDIT MODE
  const [editMode, setEditMode] = useState<"locked" | "single-click" | "double-click">("double-click")
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map())
  const [savingChanges, setSavingChanges] = useState(false)
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null)
  const [clickCount, setClickCount] = useState<Map<string, number>>(new Map())

  // Refs for input focus
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const openFormDialog = (formId: string) => {
    setSelectedFormForFilling(formId)
    setIsFormDialogOpen(true)
  }

  const closeFormDialog = () => {
    setIsFormDialogOpen(false)
    setSelectedFormForFilling(null)
  }

  // Helper function to get field icon
  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case "text":
        return Type
      case "email":
        return Mail
      case "number":
        return Hash
      case "date":
      case "datetime":
        return CalendarDays
      case "checkbox":
        return CheckSquare
      case "radio":
        return Radio
      case "select":
        return ChevronDown
      case "file":
        return Upload
      case "lookup":
        return Link
      case "textarea":
        return FileText
      case "tel":
      case "phone":
        return Hash
      case "url":
        return Link
      default:
        return Type
    }
  }

  // Enhanced helper function to format field values based on type
  const formatFieldValue = (fieldType: string, value: any): string => {
    if (value === null || value === undefined) return ""
    if (value === "") return ""

    switch (fieldType) {
      case "date":
      case "datetime":
        if (value) {
          try {
            const date = new Date(value)
            return date.toLocaleDateString()
          } catch {
            return String(value)
          }
        }
        return ""
      case "email":
      case "tel":
      case "phone":
      case "text":
      case "textarea":
      case "url":
        return String(value)
      case "number":
        if (typeof value === "number") {
          return value.toLocaleString()
        }
        if (typeof value === "string" && !isNaN(Number(value))) {
          return Number(value).toLocaleString()
        }
        return String(value)
      case "checkbox":
      case "switch":
        if (typeof value === "boolean") {
          return value ? "✓ Yes" : "✗ No"
        }
        if (typeof value === "string") {
          return value.toLowerCase() === "true" || value === "1" ? "✓ Yes" : "✗ No"
        }
        return value ? "✓ Yes" : "✗ No"
      case "lookup":
        return String(value)
      case "file":
        if (typeof value === "object" && value !== null) {
          if (value.name) return String(value.name)
          if (Array.isArray(value)) {
            return `${value.length} file(s)`
          }
          if (value.files && Array.isArray(value.files)) {
            return `${value.files.length} file(s)`
          }
        }
        return String(value)
      case "radio":
      case "select":
        return String(value)
      default:
        if (typeof value === "object" && value !== null) {
          return JSON.stringify(value).substring(0, 50) + "..."
        }
        return String(value)
    }
  }

  // Process record data to extract field values properly
  const processRecordData = (record: FormRecord, formFields: FormFieldWithSection[]): EnhancedFormRecord => {
    const processedData: ProcessedFieldData[] = []

    // Create field lookup map by ID
    const fieldById = new Map<string, FormFieldWithSection>()
    formFields.forEach((field) => {
      fieldById.set(field.id, field)
    })

    if (record.recordData && typeof record.recordData === "object") {
      // Process each field in the record data
      Object.entries(record.recordData).forEach(([fieldKey, fieldData]) => {
        // Ensure fieldData is an object and not null
        if (typeof fieldData === "object" && fieldData !== null) {
          const fieldInfo = fieldData as any
          // Get the form field definition
          const formField = fieldById.get(fieldKey)
          const displayValue = formatFieldValue(fieldInfo.type || "text", fieldInfo.value)

          processedData.push({
            fieldId: fieldKey,
            fieldLabel: fieldInfo.label || fieldKey,
            fieldType: fieldInfo.type || "text",
            value: fieldInfo.value,
            displayValue: displayValue,
            icon: fieldInfo.type || "text",
            order: formField?.order || fieldInfo.order || 999,
            sectionId: fieldInfo.sectionId,
            sectionTitle: fieldInfo.sectionTitle,
          })
        }
      })
    }

    // Sort by field order
    processedData.sort((a, b) => a.order - b.order)

    return {
      ...record,
      processedData,
    }
  }

  // ENHANCED CLICK HANDLING - DOUBLE CLICK + SINGLE CLICK MODES
  const handleCellClick = (
    recordId: string,
    fieldId: string,
    currentValue: any,
    fieldType: string,
    event: React.MouseEvent,
  ) => {
    event.preventDefault()
    event.stopPropagation()

    const cellKey = `${recordId}-${fieldId}`

    // Don't allow editing of file fields
    if (fieldType === "file") {
      toast({
        title: "Cannot Edit",
        description: "File fields cannot be edited inline",
        variant: "destructive",
      })
      return
    }

    // If table is locked, do nothing
    if (editMode === "locked") {
      return
    }

    // If single-click mode, edit immediately
    if (editMode === "single-click") {
      startCellEdit(recordId, fieldId, currentValue, fieldType)
      return
    }

    // Double-click mode logic
    if (editMode === "double-click") {
      const currentCount = clickCount.get(cellKey) || 0
      const newCount = currentCount + 1

      // Clear any existing timeout for this cell
      if (clickTimeout) {
        clearTimeout(clickTimeout)
      }

      // Update click count
      setClickCount((prev) => new Map(prev.set(cellKey, newCount)))

      if (newCount === 1) {
        // First click - set timeout to reset count
        const timeout = setTimeout(() => {
          setClickCount((prev) => {
            const newMap = new Map(prev)
            newMap.delete(cellKey)
            return newMap
          })
        }, 300) // 300ms window for double click
        setClickTimeout(timeout)
      } else if (newCount >= 2) {
        // Double click detected - start editing
        // Clear timeout and reset count
        if (clickTimeout) {
          clearTimeout(clickTimeout)
        }
        setClickCount((prev) => {
          const newMap = new Map(prev)
          newMap.delete(cellKey)
          return newMap
        })
        startCellEdit(recordId, fieldId, currentValue, fieldType)
      }
    }
  }

  // ENHANCED CELL EDIT FUNCTIONS
  const startCellEdit = (recordId: string, fieldId: string, currentValue: any, fieldType: string) => {
    const field = formFieldsWithSections.find((f) => f.id === fieldId)
    if (!field) {
      return
    }

    setEditingCell({
      recordId,
      fieldId,
      value: currentValue,
      originalValue: currentValue,
      fieldType,
      options: field.options,
    })

    // Focus the input after state update
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        if (fieldType === "text" || fieldType === "email" || fieldType === "url") {
          inputRef.current.select()
        }
      } else if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
      }
    }, 100)
  }

  const updateCellValue = (newValue: any) => {
    if (!editingCell) return

    setEditingCell({
      ...editingCell,
      value: newValue,
    })
  }

  const saveCellEdit = async () => {
    if (!editingCell) return

    const changeKey = `${editingCell.recordId}-${editingCell.fieldId}`
    const field = formFieldsWithSections.find((f) => f.id === editingCell.fieldId)

    // Add to pending changes
    setPendingChanges((prev) => {
      const newChanges = new Map(prev)
      newChanges.set(changeKey, {
        recordId: editingCell.recordId,
        fieldId: editingCell.fieldId,
        value: editingCell.value,
        originalValue: editingCell.originalValue,
        fieldType: editingCell.fieldType,
        fieldLabel: field?.label || editingCell.fieldId,
      })
      return newChanges
    })

    // Update the record in the UI immediately for visual feedback
    setFormRecords((prevRecords) => {
      return prevRecords.map((record) => {
        if (record.id === editingCell.recordId) {
          const updatedProcessedData = record.processedData.map((field) => {
            if (field.fieldId === editingCell.fieldId) {
              return {
                ...field,
                value: editingCell.value,
                displayValue: formatFieldValue(editingCell.fieldType, editingCell.value),
              }
            }
            return field
          })
          return {
            ...record,
            processedData: updatedProcessedData,
          }
        }
        return record
      })
    })

    setEditingCell(null)
    toast({
      title: "Change Staged",
      description: `Field "${field?.label}" has been modified. Click "Save All Changes" to persist.`,
    })
  }

  const cancelCellEdit = () => {
    setEditingCell(null)
  }

  const saveAllPendingChanges = async () => {
    if (pendingChanges.size === 0) return

    setSavingChanges(true)
    try {
      // Group changes by record ID
      const changesByRecord = new Map<string, PendingChange[]>()
      pendingChanges.forEach((change) => {
        if (!changesByRecord.has(change.recordId)) {
          changesByRecord.set(change.recordId, [])
        }
        changesByRecord.get(change.recordId)!.push(change)
      })

      let savedCount = 0
      // Save each record's changes
      for (const [recordId, changes] of changesByRecord) {
        // Find the record
        const record = formRecords.find((r) => r.id === recordId)
        if (!record) continue

        // Create updated record data
        const updatedRecordData = { ...record.recordData }
        changes.forEach((change) => {
          if (updatedRecordData[change.fieldId]) {
            updatedRecordData[change.fieldId] = {
              ...updatedRecordData[change.fieldId],
              value: change.value,
            }
          }
        })

        // Save to API
        const response = await fetch(`/api/forms/${selectedForm?.id}/records/${recordId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordData: updatedRecordData,
            submittedBy: "admin",
            status: record.status || "submitted",
          }),
        })

        const result = await response.json()
        if (!result.success) {
          throw new Error(`Failed to save record ${recordId}: ${result.error}`)
        }
        savedCount += changes.length
      }

      // Clear pending changes and refresh data
      setPendingChanges(new Map())
      await fetchFormRecords(selectedForm!.id)

      toast({
        title: "Success",
        description: `Successfully saved ${savedCount} changes across ${changesByRecord.size} records`,
      })
    } catch (error: any) {
      console.error("Error saving changes:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSavingChanges(false)
    }
  }

  const discardAllPendingChanges = () => {
    setPendingChanges(new Map())
    setEditingCell(null)
    // Refresh records to revert UI changes
    if (selectedForm) {
      fetchFormRecords(selectedForm.id)
    }
    toast({
      title: "Changes Discarded",
      description: "All unsaved changes have been discarded",
    })
  }

  // ENHANCED EDIT MODE TOGGLE
  const toggleEditMode = () => {
    if (editMode !== "locked" && (pendingChanges.size > 0 || editingCell)) {
      // If there are unsaved changes, ask user what to do
      const shouldSave = window.confirm("You have unsaved changes. Do you want to save them before changing edit mode?")
      if (shouldSave) {
        saveAllPendingChanges().then(() => {
          cycleEditMode()
        })
      } else {
        discardAllPendingChanges()
        cycleEditMode()
      }
    } else {
      cycleEditMode()
    }
  }

  const cycleEditMode = () => {
    setEditingCell(null)
    setPendingChanges(new Map())
    setClickCount(new Map())

    if (editMode === "locked") {
      setEditMode("double-click")
    } else if (editMode === "double-click") {
      setEditMode("single-click")
    } else {
      setEditMode("locked")
    }
  }

  // Get current value for a field (either from pending changes or original data)
  const getCurrentFieldValue = (recordId: string, fieldId: string, originalValue: any) => {
    const changeKey = `${recordId}-${fieldId}`
    const pendingChange = pendingChanges.get(changeKey)
    return pendingChange ? pendingChange.value : originalValue
  }

  // Check if a field has pending changes
  const hasFieldChanged = (recordId: string, fieldId: string) => {
    const changeKey = `${recordId}-${fieldId}`
    return pendingChanges.has(changeKey)
  }

  // ENHANCED RENDER EDITABLE CELL WITH CLICK HANDLING
  const renderEditableCell = (record: EnhancedFormRecord, field: FormFieldWithSection, originalValue: string) => {
    const isCurrentlyEditing = editingCell?.recordId === record.id && editingCell?.fieldId === field.id
    const processedField = record.processedData.find((f) => f.fieldId === field.id)
    const currentValue = getCurrentFieldValue(record.id, field.id, processedField?.value)
    const hasChanged = hasFieldChanged(record.id, field.id)
    const cellKey = `${record.id}-${field.id}`
    const isBeingClicked = (clickCount.get(cellKey) || 0) > 0

    // If currently editing this cell
    if (isCurrentlyEditing) {
      switch (field.type) {
        case "text":
        case "email":
        case "url":
        case "tel":
        case "phone":
          return (
            <Input
              ref={inputRef}
              value={editingCell.value || ""}
              onChange={(e) => updateCellValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  saveCellEdit()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  cancelCellEdit()
                }
              }}
              onBlur={saveCellEdit}
              className="h-6 text-[10px] sm:text-xs border-2 border-blue-500 focus:border-blue-600 bg-white shadow-lg rounded-none"
              type={field.type === "phone" ? "tel" : field.type}
              placeholder={field.placeholder}
              autoFocus
            />
          )
        case "number":
          return (
            <Input
              ref={inputRef}
              value={editingCell.value || ""}
              onChange={(e) => updateCellValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  saveCellEdit()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  cancelCellEdit()
                }
              }}
              onBlur={saveCellEdit}
              className="h-6 text-[10px] sm:text-xs border-2 border-blue-500 focus:border-blue-600 bg-white shadow-lg rounded-none"
              type="number"
              placeholder={field.placeholder}
              autoFocus
            />
          )
        case "textarea":
          return (
            <Textarea
              ref={textareaRef}
              value={editingCell.value || ""}
              onChange={(e) => updateCellValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault()
                  saveCellEdit()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  cancelCellEdit()
                }
              }}
              onBlur={saveCellEdit}
              className="min-h-[60px] text-xs border-2 border-blue-500 focus:border-blue-600 resize-none bg-white shadow-lg rounded-none"
              rows={2}
              placeholder={field.placeholder}
              autoFocus
            />
          )
        case "date":
          return (
            <Input
              ref={inputRef}
              value={editingCell.value || ""}
              onChange={(e) => updateCellValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  saveCellEdit()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  cancelCellEdit()
                }
              }}
              onBlur={saveCellEdit}
              className="h-6 text-[10px] sm:text-xs border-2 border-blue-500 focus:border-blue-600 bg-white shadow-lg rounded-none"
              type="date"
              autoFocus
            />
          )
        case "checkbox":
        case "switch":
          return (
            <div className="flex items-center justify-center h-7">
              <Checkbox
                checked={Boolean(editingCell.value)}
                onCheckedChange={(checked) => {
                  updateCellValue(checked)
                  setTimeout(saveCellEdit, 100)
                }}
              />
            </div>
          )
        case "select":
          const options = Array.isArray(editingCell.options) ? editingCell.options : []
          return (
            <Select
              value={editingCell.value || ""}
              onValueChange={(value) => {
                updateCellValue(value)
                setTimeout(saveCellEdit, 100)
              }}
            >
              <SelectTrigger className="h-7 text-xs border-2 border-blue-500 focus:border-blue-600 bg-white shadow-lg rounded-none">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {options.map((option: any) => (
                  <SelectItem key={option.value || option.id} value={option.value || option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        default:
          return (
            <Input
              ref={inputRef}
              value={editingCell.value || ""}
              onChange={(e) => updateCellValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  saveCellEdit()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  cancelCellEdit()
                }
              }}
              onBlur={saveCellEdit}
              className="h-6 text-[10px] sm:text-xs border-2 border-blue-500 focus:border-blue-600 bg-white shadow-lg rounded-none"
              placeholder={field.placeholder}
              autoFocus
            />
          )
      }
    }

    // Normal display mode with responsive Excel-like styling
    return (
      <div
        className={cn(
          "h-7 px-1 sm:px-2 flex items-center text-[10px] sm:text-xs font-normal border-r border-b border-gray-300 bg-white",
          "cursor-cell select-none overflow-hidden whitespace-nowrap",
          // Edit mode styling
          editMode === "locked" && "cursor-default",
          editMode === "single-click" && "hover:bg-blue-50",
          editMode === "double-click" && "hover:bg-green-50",
          // Change highlighting
          hasChanged && "bg-yellow-100 text-yellow-800 font-medium",
          // Click feedback
          isBeingClicked && editMode === "double-click" && "bg-green-100",
        )}
        onClick={(e) => handleCellClick(record.id, field.id, currentValue, field.type, e)}
        title={formatFieldValue(field.type, currentValue)}
      >
        <span className="truncate">{formatFieldValue(field.type, currentValue) || ""}</span>
        {hasChanged && <span className="ml-1 text-yellow-600 font-bold">*</span>}
      </div>
    )
  }

  // Get edit mode display info
  const getEditModeInfo = () => {
    switch (editMode) {
      case "locked":
        return {
          icon: Lock,
          label: "🔒 LOCKED",
          description: "Read Only Mode",
          color: "text-red-600 bg-red-50 border-red-300 hover:bg-red-100",
        }
      case "single-click":
        return {
          icon: MousePointer2,
          label: "👆 SINGLE CLICK",
          description: "Click any cell to edit",
          color: "text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100",
        }
      case "double-click":
        return {
          icon: Edit3,
          label: "👆👆 DOUBLE CLICK",
          description: "Double-click any cell to edit",
          color: "text-green-600 bg-green-50 border-green-300 hover:bg-green-100",
        }
    }
  }

  useEffect(() => {
    fetchModules()
  }, [])

  useEffect(() => {
    if (selectedForm) {
      fetchFormRecords(selectedForm.id)
    }
  }, [selectedForm])

  useEffect(() => {
    // Filter and sort modules based on search query and sort order
    let updatedModules = [...modules]

    // Filter by search query
    if (searchQuery) {
      const filterModules = (modules: FormModule[]): FormModule[] => {
        return modules
          .filter((module) => module.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((module) => ({
            ...module,
            children: module.children ? filterModules(module.children) : [],
          }))
          .filter(
            (module) => module.name.toLowerCase().includes(searchQuery.toLowerCase()) || module.children?.length > 0,
          )
      }
      updatedModules = filterModules(modules)
    }

    // Sort modules
    const sortModules = (modules: FormModule[]): FormModule[] => {
      const sorted = [...modules].sort((a, b) => {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      })
      return sorted.map((module) => ({
        ...module,
        children: module.children ? sortModules(module.children) : [],
      }))
    }

    setFilteredModules(sortModules(updatedModules))
  }, [modules, searchQuery, sortOrder])

  // Records filtering and sorting
  useEffect(() => {
    let filtered = [...formRecords]

    // Apply search filter
    if (recordSearchQuery) {
      filtered = filtered.filter((record) => {
        return (
          record.processedData.some((field) =>
            field.displayValue.toLowerCase().includes(recordSearchQuery.toLowerCase()),
          ) || record.id.toLowerCase().includes(recordSearchQuery.toLowerCase())
        )
      })
    }

    // Apply sorting
    if (recordSortField) {
      filtered.sort((a, b) => {
        let aValue = ""
        let bValue = ""

        if (recordSortField === "submittedAt") {
          aValue = a.submittedAt
          bValue = b.submittedAt
        } else if (recordSortField === "status") {
          aValue = a.status || ""
          bValue = b.status || ""
        } else {
          const aField = a.processedData.find((f) => f.fieldId === recordSortField)
          const bField = b.processedData.find((f) => f.fieldId === recordSortField)
          aValue = aField?.displayValue || ""
          bValue = bField?.displayValue || ""
        }

        const comparison = aValue.localeCompare(bValue)
        return recordSortOrder === "asc" ? comparison : -comparison
      })
    }

    setFilteredRecords(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [formRecords, recordSearchQuery, recordSortField, recordSortOrder])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout)
      }
    }
  }, [clickTimeout])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/modules")
      const data = await response.json()
      console.log("Fetched modules at modules:", data);

      if (data.success) {
        setModules(data.data)
        setFilteredModules(data.data)
        buildParentOptions(data.data)
        if (data.data.length > 0 && !selectedModule) {
          setSelectedModule(data.data[0])
        }
      } else {
        throw new Error(data.error || "Failed to fetch modules")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load modules. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const buildParentOptions = (moduleList: FormModule[]) => {
    const flattenModules = (modules: FormModule[], level = 0): ParentModuleOption[] => {
      const options: ParentModuleOption[] = []
      modules.forEach((module) => {
        options.push({ id: module.id, name: module.name, level })
        if (module.children && module.children.length > 0) {
          options.push(...flattenModules(module.children, level + 1))
        }
      })
      return options
    }
    setAvailableParents(flattenModules(moduleList))
  }

  const fetchFormRecords = async (formId: string) => {
    try {
      setRecordsLoading(true)

      // First fetch the form to get field definitions
      const formResponse = await fetch(`/api/forms/${formId}`)
      const formData = await formResponse.json()

      if (formData.success && formData.data) {
        const form = formData.data

        // Extract all form fields with section information
        const fieldsWithSections: FormFieldWithSection[] = []
        if (form.sections) {
          let fieldOrder = 0
          form.sections.forEach((section: any) => {
            if (section.fields) {
              section.fields.forEach((field: any) => {
                fieldsWithSections.push({
                  ...field,
                  order: field.order || fieldOrder++,
                  sectionTitle: section.title,
                  sectionId: section.id,
                })
              })
            }
          })
        }
        setFormFieldsWithSections(fieldsWithSections)

        // Then fetch records
        const response = await fetch(`/api/forms/${formId}/records`)
        const data = await response.json()
        console.log("Fetched records:", data)

        if (data.success && data.records) {
          // Process records with field data
          const processedRecords = (data.records || []).map((record: FormRecord) =>
            processRecordData(record, fieldsWithSections),
          )
          setFormRecords(processedRecords)
        } else {
          setFormRecords([])
        }
      }
    } catch (error: any) {
      setFormRecords([])
    } finally {
      setRecordsLoading(false)
    }
  }

  const handleCreateModule = async () => {
    if (!moduleData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Module name is required.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const createData = {
        name: moduleData.name,
        description: moduleData.description,
        parentId: moduleData.parentId || undefined,
      }

      const response = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      })

      const data = await response.json()
      if (data.success) {
        await fetchModules()
        setIsCreateDialogOpen(false)
        setIsSubmoduleDialogOpen(false)
        setModuleData({ name: "", description: "", parentId: "" })
        setParentModuleForSubmodule(null)
        toast({
          title: "Success",
          description: "Module created successfully!",
        })
      } else {
        throw new Error(data.error || "Failed to create module")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create module.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditModule = async () => {
    if (!editingModule || !moduleData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Module name is required.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const updateData = {
        name: moduleData.name,
        description: moduleData.description,
        parentId: moduleData.parentId || undefined,
      }

      const response = await fetch(`/api/modules/${editingModule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()
      if (data.success) {
        await fetchModules()
        setIsEditDialogOpen(false)
        setEditingModule(null)
        setModuleData({ name: "", description: "", parentId: "" })
        toast({
          title: "Success",
          description: "Module updated successfully!",
        })
      } else {
        throw new Error(data.error || "Failed to update module")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update module.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) {
      return
    }

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        await fetchModules()
        if (selectedModule?.id === moduleId) {
          setSelectedModule(null)
          setSelectedForm(null)
        }
        toast({
          title: "Success",
          description: "Module deleted successfully!",
        })
      } else {
        throw new Error(data.error || "Failed to delete module")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete module.",
        variant: "destructive",
      })
    }
  }

  const handlePublishForm = async (form: Form) => {
    try {
      const response = await fetch(`/api/forms/${form.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !form.isPublished }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchModules()
        toast({
          title: "Success",
          description: `Form ${form.isPublished ? "unpublished" : "published"} successfully!`,
        })
      } else {
        throw new Error(data.error || "Failed to publish form")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to publish form.",
        variant: "destructive",
      })
    }
  }

  const copyFormLink = (formId: string) => {
    const link = `${window.location.origin}/form/${formId}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Success",
      description: "Form link copied to clipboard!",
    })
  }

  const openEditDialog = (module: FormModule) => {
    setEditingModule(module)
    setModuleData({
      name: module.name,
      description: module.description || "",
      parentId: module.parentId || "",
    })
    setIsEditDialogOpen(true)
  }

  const openSubmoduleDialog = (module: FormModule) => {
    setParentModuleForSubmodule(module)
    setModuleData({
      name: "",
      description: "",
      parentId: module.id,
    })
    setIsSubmoduleDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const renderModuleAccordion = (modules: FormModule[], level = 0) => {
    return modules.map((module) => (
      <AccordionItem key={module.id} value={module.id} className="border-b border-gray-200">
        <AccordionTrigger
          className={`py-2 pl-${4 + level * 2} pr-4 hover:bg-gray-50 rounded-lg transition-colors duration-200`}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FileText className="h-4 w-4 text-gray-500" />
            {module.name}
            {(module.forms ?? []).length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-600 text-xs">
                {(module.forms ?? []).length}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pl-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant={selectedModule?.id === module.id ? "secondary" : "ghost"}
                className="flex-1 justify-start text-left text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  setSelectedModule(module)
                  setSelectedForm(null)
                }}
              >
                Select Module
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openSubmoduleDialog(module)}
                title="Add Submodule"
                className="hover:bg-gray-100 rounded-lg"
              >
                <FolderPlus className="h-4 w-4 text-gray-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(module)}
                title="Edit Module"
                className="hover:bg-gray-100 rounded-lg"
              >
                <Edit className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
            {module.children && module.children.length > 0 && (
              <Accordion type="single" collapsible className="ml-2">
                {renderModuleAccordion(module.children, level + 1)}
              </Accordion>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    ))
  }

  // Get field labels from current form structure
  const getFormFieldLabels = () => {
    return formFieldsWithSections.map((field) => ({
      id: field.id,
      label: field.label,
      type: field.type,
      order: field.order,
      sectionTitle: field.sectionTitle,
    }))
  }

  const renderSortIcon = (field: string) => {
    if (sortOrder === "asc") return <ArrowUp className="h-4 w-4" />
    return <ArrowDown className="h-4 w-4" />
  }

  const renderFormsExcel = (forms: Form[]) => (
    <div className="overflow-auto border border-gray-300 rounded-lg shadow-sm bg-white">
      <table className="w-full text-xs">
        <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-300">
          <tr>
            <th className="p-2 text-left font-semibold text-gray-700 border-r border-gray-300">
              <div className="flex items-center gap-1">
                Name
                <ArrowUpDown className="h-3 w-3 text-gray-500" />
              </div>
            </th>
            <th className="p-2 text-left font-semibold text-gray-700 border-r border-gray-300">
              <div className="flex items-center gap-1">
                Status
                <ArrowUpDown className="h-3 w-3 text-gray-500" />
              </div>
            </th>
            <th className="p-2 text-left font-semibold text-gray-700 border-r border-gray-300">
              <div className="flex items-center gap-1">
                Updated
                <ArrowUpDown className="h-3 w-3 text-gray-500" />
              </div>
            </th>
            <th className="p-2 text-right font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form: Form, index) => (
            <tr
              key={form.id}
              className={`border-b border-gray-300 hover:bg-gray-50 cursor-pointer ${selectedForm?.id === form.id ? "bg-blue-50" : index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              onClick={() => setSelectedForm(form)}
            >
              <td className="p-2 text-gray-700 border-r border-gray-300">
                <Button
                  variant="link"
                  className="text-blue-500 hover:underline"
                  onClick={() => openFormDialog(form.id)}
                >
                  {form.name}
                </Button>
              </td>
              <td className="p-2 border-r border-gray-300">
                <Badge variant={form.isPublished ? "default" : "secondary"} className="text-xs">
                  {form.isPublished ? "Published" : "Draft"}
                </Badge>
              </td>
              <td className="p-2 text-gray-700 border-r border-gray-300">
                {new Date(form.updatedAt).toLocaleDateString()}
              </td>
              <td className="p-2 text-right">
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublishForm(form)}
                    className="text-xs border-gray-300 hover:bg-gray-100"
                  >
                    {form.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <NextLink href={`/builder/${form.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
                    >
                      Edit
                    </Button>
                  </NextLink>
                  <NextLink href={`/preview/${form.id}`} target="_blank">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
                    >
                      Preview
                    </Button>
                  </NextLink>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderFormsTable = (forms: Form[]) => (
    <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
      <table className="w-full text-sm bg-white">
        <thead className="bg-gray-100">
          <tr className="border-b border-gray-300">
            <th className="p-3 text-left font-semibold text-gray-700">Name</th>
            <th className="p-3 text-left font-semibold text-gray-700">Status</th>
            <th className="p-3 text-left font-semibold text-gray-700">Updated</th>
            <th className="p-3 text-right font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form: Form, index) => (
            <tr
              key={form.id}
              className={`border-b border-gray-300 hover:bg-gray-50 cursor-pointer ${selectedForm?.id === form.id ? "bg-blue-50" : index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              onClick={() => setSelectedForm(form)}
            >
              <td className="p-3 text-gray-700">
                <Button
                  variant="link"
                  className="text-blue-500 hover:underline"
                  onClick={() => openFormDialog(form.id)}
                >
                  {form.name}
                </Button>
              </td>
              <td className="p-3">
                <Badge variant={form.isPublished ? "default" : "secondary"} className="text-xs">
                  {form.isPublished ? "Published" : "Draft"}
                </Badge>
              </td>
              <td className="p-3 text-gray-700">{new Date(form.updatedAt).toLocaleDateString()}</td>
              <td className="p-3 text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublishForm(form)}
                    className="text-xs border-gray-300 hover:bg-gray-100"
                  >
                    {form.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <NextLink href={`/builder/${form.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
                    >
                      Edit
                    </Button>
                  </NextLink>
                  <NextLink href={`/preview/${form.id}`} target="_blank">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
                    >
                      Preview
                    </Button>
                  </NextLink>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderFormsGrid = (forms: Form[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {forms.map((form: Form) => (
        <Card
          key={form.id}
          className={`hover:shadow-md transition-shadow duration-200 border border-gray-300 rounded-lg`}
        >
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">
              <Button variant="link" className="text-blue-500 hover:underline" onClick={() => openFormDialog(form.id)}>
                {form.name}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={form.isPublished ? "default" : "secondary"} className="text-xs">
                  {form.isPublished ? "Published" : "Draft"}
                </Badge>
                <span className="text-xs text-gray-500">Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePublishForm(form)}
                  className="text-xs border-gray-300 hover:bg-gray-100"
                >
                  {form.isPublished ? "Unpublish" : "Publish"}
                </Button>
                <NextLink href={`/builder/${form.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
                  >
                    Edit
                  </Button>
                </NextLink>
                <NextLink href={`/preview/${form.id}`} target="_blank">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
                  >
                    Preview
                  </Button>
                </NextLink>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderFormsList = (forms: Form[]) => (
    <div className="space-y-2">
      {forms.map((form: Form) => (
        <Card
          key={form.id}
          className={`hover:shadow-md transition-shadow duration-200 border border-gray-300 rounded-lg`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  <Button
                    variant="link"
                    className="text-blue-500 hover:underline"
                    onClick={() => openFormDialog(form.id)}
                  >
                    {form.name}
                  </Button>
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant={form.isPublished ? "default" : "secondary"} className="text-xs">
                    {form.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-xs text-gray-500">Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePublishForm(form)}
                className="text-xs border-gray-300 hover:bg-gray-100"
              >
                {form.isPublished ? "Unpublish" : "Publish"}
              </Button>
              <NextLink href={`/builder/${form.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
                >
                  Edit
                </Button>
              </NextLink>
              <NextLink href={`/preview/${form.id}`} target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-300 hover:bg-gray-100 bg-transparent"
                >
                  Preview
                </Button>
              </NextLink>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  const editModeInfo = getEditModeInfo()

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Fixed Header */}
      <div className="bg-white shadow-md border-b border-gray-200 flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">ERP System</h1>
              <p className="text-sm text-gray-600">Manage your forms and modules</p>
            </div>
            <div className="flex items-center gap-3">
              <Tabs
                value={viewMode}
                onValueChange={(value) => setViewMode(value as any)}
                className="bg-gray-50 rounded-lg p-1"
              >
                <TabsList className="bg-transparent">
                  <TabsTrigger
                    value="excel"
                    className="flex items-center gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Excel
                  </TabsTrigger>
                  <TabsTrigger
                    value="table"
                    className="flex items-center gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    <Table className="h-4 w-4" /> Table
                  </TabsTrigger>
                  <TabsTrigger
                    value="grid"
                    className="flex items-center gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    <Grid className="h-4 w-4" /> Grid
                  </TabsTrigger>
                  <TabsTrigger
                    value="list"
                    className="flex items-center gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    <List className="h-4 w-4" /> List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> New Module
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white rounded-lg">
                  <DialogHeader>
                    <DialogTitle>Edit Module</DialogTitle>
                    <DialogDescription>Update module details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-700">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={moduleData.name}
                        onChange={(e) => setModuleData({ ...moduleData, name: e.target.value })}
                        placeholder="Module name"
                        className="border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={moduleData.description}
                        onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })}
                        placeholder="Module description"
                        rows={3}
                        className="border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="parentId" className="text-gray-700">
                        Parent Module
                      </Label>
                      <select
                        id="parentId"
                        value={moduleData.parentId}
                        onChange={(e) => setModuleData({ ...moduleData, parentId: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">No Parent (Top-level)</option>
                        {availableParents.map((parent) => (
                          <option key={parent.id} value={parent.id}>
                            {"  ".repeat(parent.level)}
                            {parent.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-gray-300 text-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateModule}
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sticky Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 shadow-sm flex flex-col">
          <div className="p-4 space-y-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800">Modules</h2>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 border-gray-300 focus:ring-blue-500 text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                title={sortOrder === "asc" ? "Sort Z-A" : "Sort A-Z"}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {filteredModules.length ? (
              <Accordion type="single" collapsible className="w-full">
                {renderModuleAccordion(filteredModules)}
              </Accordion>
            ) : (
              <div className="text-center text-gray-500 py-4">No modules found</div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 flex-1 overflow-y-auto">
            {selectedModule ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedModule.name}</h2>
                    <p className="text-sm text-gray-600">{selectedModule.description || "No description"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSubmoduleDialog(selectedModule)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      <FolderPlus className="h-4 w-4 mr-2" /> Add Submodule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(selectedModule)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteModule(selectedModule.id)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                    <NextLink href={`/modules/${selectedModule.id}`}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </NextLink>
                  </div>
                </div>

                {/* Forms Display */}
                <Card className="border-gray-300 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Forms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedModule.forms?.length ? (
                      <>
                        {viewMode === "excel" && renderFormsExcel(selectedModule.forms)}
                        {viewMode === "table" && renderFormsTable(selectedModule.forms)}
                        {viewMode === "grid" && renderFormsGrid(selectedModule.forms)}
                        {viewMode === "list" && renderFormsList(selectedModule.forms)}
                      </>
                    ) : (
                      <div className="text-center py-4 text-gray-500">No forms in this module</div>
                    )}
                  </CardContent>
                </Card>

                {/* Records Excel View */}
                {selectedForm && (
                  <Card className="border-gray-300 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-800">
                          Records ({formRecords.length})
                        </CardTitle>

                        {/* ENHANCED EDIT MODE CONTROLS */}
                        <div className="flex items-center gap-2">
                          {/* Edit Mode Toggle Button */}
                          <Button
                            variant="outline"
                            onClick={toggleEditMode}
                            className={cn(
                              "flex items-center gap-2 font-medium border-2 transition-all",
                              editModeInfo.color,
                            )}
                          >
                            <editModeInfo.icon className="h-4 w-4" />
                            {editModeInfo.label}
                          </Button>

                          {/* Pending Changes Indicator */}
                          {pendingChanges.size > 0 && (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                {pendingChanges.size} changes
                              </Badge>
                              <Button
                                onClick={saveAllPendingChanges}
                                disabled={savingChanges}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                              >
                                {savingChanges ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save All Changes
                                  </>
                                )}
                              </Button>
                              <Button onClick={discardAllPendingChanges} variant="outline" size="sm">
                                <X className="h-4 w-4 mr-2" />
                                Discard
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Edit Mode Help Text */}
                      <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg border mt-4">
                        <div className="flex items-center gap-2">
                          <editModeInfo.icon className="h-4 w-4" />
                          <span className="font-medium">{editModeInfo.description}</span>
                        </div>
                        {editMode === "double-click" && (
                          <div className="mt-1 text-xs">
                            Double-click any cell to start editing. Press Enter to save, Escape to cancel.
                          </div>
                        )}
                        {editMode === "single-click" && (
                          <div className="mt-1 text-xs">
                            Click any cell to start editing. Press Enter to save, Escape to cancel.
                          </div>
                        )}
                        {editMode === "locked" && (
                          <div className="mt-1 text-xs">
                            Table is in read-only mode. Click the edit mode button to enable editing.
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {recordsLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Search and Filter Controls */}
                          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50 p-4 rounded-lg">
                            <div className="flex flex-col sm:flex-row gap-2 flex-1">
                              <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  placeholder="Search records..."
                                  value={recordSearchQuery}
                                  onChange={(e) => setRecordSearchQuery(e.target.value)}
                                  className="pl-10 border-gray-300 focus:ring-blue-500"
                                />
                              </div>
                              <Select
                                value={recordsPerPage.toString()}
                                onValueChange={(value) => setRecordsPerPage(Number(value))}
                              >
                                <SelectTrigger className="w-[120px]">
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
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {filteredRecords.length} of {formRecords.length} records
                              </Badge>
                              {selectedRecords.size > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {selectedRecords.size} selected
                                </Badge>
                              )}
                            </div>
                          </div>

                          {filteredRecords.length ? (
                            <>
                              {/* Responsive Excel-like Table */}
                              <div className="border border-gray-400 bg-white rounded-lg overflow-hidden shadow-sm">
                                <div className="overflow-auto max-h-[60vh]">
                                  <div className="inline-block min-w-full">
                                    <div style={{ fontFamily: "Calibri, sans-serif" }}>
                                      {/* Column Headers Row */}
                                      <div className="flex bg-gray-100 border-b border-gray-400 sticky top-0 z-20 min-w-max">
                                        {/* Select All Checkbox */}
                                        <div className="w-10 h-8 border-r border-gray-400 bg-gray-200 flex items-center justify-center">
                                          <Checkbox
                                            checked={
                                              selectedRecords.size === filteredRecords.length &&
                                              filteredRecords.length > 0
                                            }
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                setSelectedRecords(new Set(filteredRecords.map((r) => r.id)))
                                              } else {
                                                setSelectedRecords(new Set())
                                              }
                                            }}
                                            className="h-3 w-3"
                                          />
                                        </div>

                                        {/* Row number column header */}
                                        <div className="w-12 h-8 border-r border-gray-400 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                                          #
                                        </div>

                                        {/* Actions column */}
                                        <div className="w-20 sm:w-24 h-8 border-r border-gray-400 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                                          Actions
                                        </div>

                                        {/* Submitted date column */}
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

                                        {/* Status column */}
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

                                        {/* Dynamic field columns */}
                                        {getFormFieldLabels().map((field) => (
                                          <div
                                            key={field.id}
                                            className="w-32 sm:w-40 h-8 border-r border-gray-400 bg-gray-200 flex flex-col items-center justify-center text-xs font-bold text-gray-700 px-1 cursor-pointer hover:bg-gray-300"
                                            title={`${field.sectionTitle} - ${field.label} (${field.type})`}
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
                                              <div className="text-[9px] sm:text-[10px] text-gray-500 font-normal truncate w-full text-center">
                                                {field.sectionTitle}
                                              </div>
                                              <div className="flex items-center gap-1 truncate w-full justify-center">
                                                {React.createElement(getFieldIcon(field.type), {
                                                  className: "h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0",
                                                })}
                                                <span className="truncate text-[10px] sm:text-xs font-bold">
                                                  {field.label}
                                                </span>
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

                                      {/* Data Rows */}
                                      {filteredRecords
                                        .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                                        .map((record, rowIndex) => (
                                          <div key={record.id} className="flex hover:bg-blue-50 min-w-max">
                                            {/* Select Checkbox */}
                                            <div className="w-10 h-7 border-r border-b border-gray-300 bg-white flex items-center justify-center">
                                              <Checkbox
                                                checked={selectedRecords.has(record.id)}
                                                onCheckedChange={(checked) => {
                                                  const newSelected = new Set(selectedRecords)
                                                  if (checked) {
                                                    newSelected.add(record.id)
                                                  } else {
                                                    newSelected.delete(record.id)
                                                  }
                                                  setSelectedRecords(newSelected)
                                                }}
                                                className="h-3 w-3"
                                              />
                                            </div>

                                            {/* Row number */}
                                            <div className="w-12 h-7 border-r border-b border-gray-300 bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                              {(currentPage - 1) * recordsPerPage + rowIndex + 1}
                                            </div>

                                            {/* Actions cell */}
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

                                            {/* Submitted date cell */}
                                            <div className="w-28 sm:w-32 h-7 border-r border-b border-gray-300 bg-white flex items-center px-2 text-[10px] sm:text-xs">
                                              <span className="hidden sm:inline">
                                                {new Date(record.submittedAt).toLocaleDateString()}
                                              </span>
                                              <span className="sm:hidden">
                                                {new Date(record.submittedAt).toLocaleDateString("en-US", {
                                                  month: "short",
                                                  day: "numeric",
                                                })}
                                              </span>
                                            </div>

                                            {/* Status cell */}
                                            <div className="w-20 sm:w-24 h-7 border-r border-b border-gray-300 bg-white flex items-center justify-center px-1">
                                              <Badge
                                                variant="outline"
                                                className="text-[9px] sm:text-xs px-1 py-0 h-4 border"
                                              >
                                                <span className="hidden sm:inline">{record.status || "submitted"}</span>
                                                <span className="sm:hidden">
                                                  {(record.status || "submitted").charAt(0).toUpperCase()}
                                                </span>
                                              </Badge>
                                            </div>

                                            {/* Dynamic field cells */}
                                            {getFormFieldLabels().map((fieldDef) => {
                                              const formField = formFieldsWithSections.find((f) => f.id === fieldDef.id)
                                              if (!formField) {
                                                return (
                                                  <div
                                                    key={fieldDef.id}
                                                    className="w-32 sm:w-40 h-7 border-r border-b border-gray-300 bg-white flex items-center px-2 text-xs text-gray-400"
                                                  >
                                                    —
                                                  </div>
                                                )
                                              }
                                              return (
                                                <div key={fieldDef.id} className="w-32 sm:w-40">
                                                  {renderEditableCell(record, formField, "")}
                                                </div>
                                              )
                                            })}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Pagination Controls */}
                              {filteredRecords.length > recordsPerPage && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg">
                                  <div className="text-sm text-gray-600">
                                    Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
                                    {Math.min(currentPage * recordsPerPage, filteredRecords.length)} of{" "}
                                    {filteredRecords.length} records
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                      disabled={currentPage === 1}
                                      className="text-xs"
                                    >
                                      Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                      {Array.from(
                                        { length: Math.min(5, Math.ceil(filteredRecords.length / recordsPerPage)) },
                                        (_, i) => {
                                          const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)
                                          let pageNum
                                          if (totalPages <= 5) {
                                            pageNum = i + 1
                                          } else if (currentPage <= 3) {
                                            pageNum = i + 1
                                          } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                          } else {
                                            pageNum = currentPage - 2 + i
                                          }

                                          return (
                                            <Button
                                              key={pageNum}
                                              variant={currentPage === pageNum ? "default" : "outline"}
                                              size="sm"
                                              onClick={() => setCurrentPage(pageNum)}
                                              className="w-8 h-8 p-0 text-xs"
                                            >
                                              {pageNum}
                                            </Button>
                                          )
                                        },
                                      )}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setCurrentPage(
                                          Math.min(Math.ceil(filteredRecords.length / recordsPerPage), currentPage + 1),
                                        )
                                      }
                                      disabled={currentPage === Math.ceil(filteredRecords.length / recordsPerPage)}
                                      className="text-xs"
                                    >
                                      Next
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p className="text-lg font-medium">No records found</p>
                              <p className="text-sm">
                                {recordSearchQuery ? "Try adjusting your search" : "No records have been submitted yet"}
                              </p>
                              {recordSearchQuery && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setRecordSearchQuery("")
                                  }}
                                  className="mt-2"
                                >
                                  Clear Search
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">Select a module to view its forms and records</div>
            )}
          </div>
        </div>

        {/* Form Details Panel */}
        {selectedForm && (
          <div className="w-80 bg-white border-l border-gray-200 shadow-sm p-4 flex-shrink-0 overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Form Details</h2>
            <Card className="border-gray-300 shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">{selectedForm.name}</h3>
                  <p className="text-sm text-gray-600">Status: {selectedForm.isPublished ? "Published" : "Draft"}</p>
                </div>
                {selectedForm.isPublished && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Public Link:</p>
                    <div className="flex gap-2">
                      <Input
                        value={`${window.location.origin}/form/${selectedForm.id}`}
                        readOnly
                        className="text-xs border-gray-300 focus:ring-blue-500"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyFormLink(selectedForm.id)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <NextLink href={`/builder/${selectedForm.id}`}>
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit Form
                    </Button>
                  </NextLink>
                  <NextLink href={`/preview/${selectedForm.id}`} target="_blank">
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
                    >
                      <Eye className="h-4 w-4 mr-2" /> Preview
                    </Button>
                  </NextLink>
                  <NextLink href={`/forms/${selectedForm.id}/analytics`}>
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" /> Analytics
                    </Button>
                  </NextLink>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Module Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>Update module details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-gray-700">
                Name
              </Label>
              <Input
                id="edit-name"
                value={moduleData.name}
                onChange={(e) => setModuleData({ ...moduleData, name: e.target.value })}
                placeholder="Module name"
                className="border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-gray-700">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={moduleData.description}
                onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })}
                placeholder="Module description"
                rows={3}
                className="border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="edit-parentId" className="text-gray-700">
                Parent Module
              </Label>
              <select
                id="edit-parentId"
                value={moduleData.parentId}
                onChange={(e) => setModuleData({ ...moduleData, parentId: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No Parent (Top-level)</option>
                {availableParents
                  .filter((parent) => parent.id !== editingModule?.id)
                  .map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {"  ".repeat(parent.level)}
                      {parent.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditModule}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Submodule Dialog */}
      <Dialog open={isSubmoduleDialogOpen} onOpenChange={setIsSubmoduleDialogOpen}>
        <DialogContent className="bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Create Submodule</DialogTitle>
            <DialogDescription>Add a new submodule under {parentModuleForSubmodule?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="submodule-name" className="text-gray-700">
                Name
              </Label>
              <Input
                id="submodule-name"
                value={moduleData.name}
                onChange={(e) => setModuleData({ ...moduleData, name: e.target.value })}
                placeholder="Submodule name"
                className="border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="submodule-description" className="text-gray-700">
                Description
              </Label>
              <Textarea
                id="submodule-description"
                value={moduleData.description}
                onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })}
                placeholder="Submodule description"
                rows={3}
                className="border-gray-300 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmoduleDialogOpen(false)
                setParentModuleForSubmodule(null)
              }}
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateModule}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Submodule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PublicFormDialog formId={selectedFormForFilling} isOpen={isFormDialogOpen} onClose={closeFormDialog} />
    </div>
  )
}
