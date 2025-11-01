"use client"

import { useEffect, useState, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  Type,
  Mail,
  Hash,
  CalendarDays,
  Link,
  Upload,
  CheckSquare,
  Radio,
  ChevronDown,
  Lock,
  Edit3,
  MousePointer2,
  FileText,
} from "lucide-react"
import { PublicFormDialog } from "@/components/public-form-dialog"
import RecordsDisplay from "@/components/modules/recordsDisplay"
import FormsContent from "@/components/dynamicSubmodule/formsContent"
// Interfaces (unchanged)
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
  formName?: string
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
  formId?: string
  formName?: string
  recordId: string
  recordIdFromAPI: string
}

interface EnhancedFormRecord extends FormRecord {
  processedData: ProcessedFieldData[]
}

interface FormFieldWithSection extends FormField {
  originalId: string
  sectionTitle: string
  sectionId: string
  formId: string
  formName: string
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

export default function ModulePage({
  params,
}: {
  params: { moduleName: string; moduleId: string; slug?: string[] }
}) {
  const { toast } = useToast()
  const { module_name, module_Id, slug } = params

  const moduleId = module_Id
  const moduleName = module_name

  console.log("ModulePage: Initialized", { moduleId, moduleName, slug })

  const [selectedModule, setSelectedModule] = useState<FormModule | null>(null)
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [formRecords, setFormRecords] = useState<EnhancedFormRecord[]>([])
  const [allModuleForms, setAllModuleForms] = useState<Form[]>([])
  const [formFieldsWithSections, setFormFieldsWithSections] = useState<FormFieldWithSection[]>([])
  const [loading, setLoading] = useState(true)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"excel" | "table" | "grid" | "list">("excel")
  const [recordSearchQuery, setRecordSearchQuery] = useState("")
  const [recordSortField, setRecordSortField] = useState<string>("")
  const [recordSortOrder, setRecordSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(20)
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set())
  const [selectedFormFilter, setSelectedFormFilter] = useState<string>("all")
  const [selectedFormForFilling, setSelectedFormForFilling] = useState<string | null>(null)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState<"locked" | "single-click" | "double-click">("double-click")
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map())
  const [savingChanges, setSavingChanges] = useState(false)
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null)
  const [clickCount, setClickCount] = useState<Map<string, number>>(new Map())
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const openFormDialog = (formId: string) => {
    console.log("ModulePage: Opening form dialog", { formId })
    setSelectedFormForFilling(formId)
    setIsFormDialogOpen(true)
  }

  const closeFormDialog = () => {
    console.log("ModulePage: Closing form dialog")
    setIsFormDialogOpen(false)
    setSelectedFormForFilling(null)
  }

  const getFieldIcon = (fieldType: string) => {
    console.log("ModulePage: Getting field icon", { fieldType })
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

  const formatFieldValue = (fieldType: string, value: any): string => {
    console.log("ModulePage: Formatting field value", { fieldType, value })
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

  const processRecordData = (record: FormRecord, formFields: FormFieldWithSection[]): EnhancedFormRecord => {
    console.log("ModulePage: Processing record data", {
      recordId: record.id,
      formId: record.formId,
      fieldCount: formFields.length,
    })
    const processedData: ProcessedFieldData[] = []
    const fieldById = new Map<string, FormFieldWithSection>()
    formFields.forEach((field) => {
      fieldById.set(field.id, field)
      fieldById.set(field.originalId, field)
    })

    if (record.recordData && typeof record.recordData === "object") {
      Object.entries(record.recordData).forEach(([fieldKey, fieldData]) => {
        const formField = fieldById.get(fieldKey) || formFields.find((f) => f.originalId === fieldKey.split("_").pop())
        if (formField) {
          const value = fieldData && typeof fieldData === "object" && "value" in fieldData ? fieldData.value : fieldData
          const displayValue = formatFieldValue(formField.type || "text", value)
          processedData.push({
            recordId: record.id, // Actual database UUID
            recordIdFromAPI: record.id, // Same as recordId
            fieldId: fieldKey,
            fieldLabel: formField.label || fieldKey,
            fieldType: formField.type || "text",
            value: value,
            displayValue: displayValue,
            icon: formField.type || "text",
            order: formField.order || 999,
            sectionId: formField.sectionId,
            sectionTitle: formField.sectionTitle,
            formId: record.formId,
            formName: record.formName,
          })
        } else {
          console.warn("ModulePage: Form field not found for key", { fieldKey })
        }
      })
    } else {
      console.warn("ModulePage: Invalid recordData", { recordId: record.id })
    }

    processedData.sort((a, b) => a.order - b.order)
    console.log("ModulePage: Processed record data", {
      recordId: record.id,
      processedDataCount: processedData.length,
    })

    return {
      ...record,
      processedData,
    }
  }

  const saveAllPendingChanges = async (changesToSave?: Map<string, PendingChange>) => {
    const changesToProcess = changesToSave || pendingChanges

    console.log("[v0] saveAllPendingChanges called:", {
      changesToSaveProvided: !!changesToSave,
      pendingChangesSize: pendingChanges.size,
      changesToProcessSize: changesToProcess.size,
      allChanges: Array.from(changesToProcess.entries()).map(([key, change]) => ({
        key,
        recordId: change.recordId,
        fieldId: change.fieldId,
        originalFieldId: change.originalFieldId,
        value: change.value,
        originalValue: change.originalValue,
      })),
    })

    if (changesToProcess.size === 0) {
      console.log("[v0] No changes to save, returning early")
      toast({
        title: "No Changes",
        description: "There are no changes to save",
        variant: "default",
      })
      return
    }

    setSavingChanges(true)
    try {
      const changesByRecord = new Map<string, { changes: PendingChange[]; formId: string }>()
      changesToProcess.forEach((change) => {
        if (!changesByRecord.has(change.recordId)) {
          const formId =
            formRecords.flatMap((r) => r.processedData).find((pd) => pd.recordId === change.recordId)?.formId || ""

          changesByRecord.set(change.recordId, { changes: [], formId })
        }
        changesByRecord.get(change.recordId)!.changes.push(change)
      })

      console.log("[v0] Grouped changes by actual database record ID:", {
        recordCount: changesByRecord.size,
        recordIds: Array.from(changesByRecord.keys()),
      })

      let savedCount = 0

      for (const [actualRecordId, { changes, formId }] of changesByRecord) {
        console.log("[v0] Processing actual database record:", {
          actualRecordId,
          formId,
          changeCount: changes.length,
        })

        let updatedRecordData: Record<string, any> = {}

        const sourceRecord = formRecords.find((r) => r.id === actualRecordId)
        if (sourceRecord) {
          updatedRecordData = { ...sourceRecord.recordData }
        }

        changes.forEach((change) => {
          const dbFieldKey = change.originalFieldId || change.fieldId
          console.log("[v0] Applying change:", {
            actualRecordId,
            fieldId: change.fieldId,
            dbFieldKey,
            newValue: change.value,
          })

          updatedRecordData[dbFieldKey] = {
            value: change.value,
            type: change.fieldType,
            label: change.fieldLabel,
          }
        })

        console.log("[v0] Sending PUT request:", {
          url: `/api/forms/${formId}/records/${actualRecordId}`,
          recordData: updatedRecordData,
        })

        const response = await fetch(`/api/forms/${formId}/records/${actualRecordId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordData: updatedRecordData,
            submittedBy: "admin",
            status: sourceRecord?.status || "submitted",
          }),
        })

        console.log("[v0] PUT response status:", {
          actualRecordId,
          status: response.status,
          ok: response.ok,
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Save failed:", {
            actualRecordId,
            status: response.status,
            errorText,
          })
          throw new Error(`Failed to save record ${actualRecordId}: ${response.status} ${errorText}`)
        }

        const result = await response.json()
        console.log("[v0] Save response:", { actualRecordId, result })

        if (!result.success) {
          throw new Error(`Failed to save record ${actualRecordId}: ${result.error || "Unknown error"}`)
        }

        savedCount += changes.length
        console.log("[v0] Successfully saved record:", {
          actualRecordId,
          savedCount,
        })
      }

      console.log("[v0] All records saved, refreshing data:", { totalSaved: savedCount })

      await fetchAllModuleRecords()

      setPendingChanges(new Map())
      setEditingCell(null)

      toast({
        title: "Changes Saved",
        description: `Successfully saved ${savedCount} ${savedCount === 1 ? "change" : "changes"} to database`,
      })
    } catch (error: any) {
      console.error("[v0] Save error:", error)
      toast({
        title: "Error Saving Changes",
        description: error.message || "Failed to save changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSavingChanges(false)
    }
  }

  const discardAllPendingChanges = () => {
    setPendingChanges(new Map())
    setEditingCell(null)

    setFormRecords(
      formRecords.map((record) => {
        let needsUpdate = false
        const updatedRecordData = { ...record.recordData }
        const updatedProcessedData = [...record.processedData]

        pendingChanges.forEach((change) => {
          if (change.recordId === record.id) {
            needsUpdate = true
            updatedRecordData[change.fieldId] = {
              ...updatedRecordData[change.fieldId],
              value: change.originalValue,
            }
            const fieldIndex = updatedProcessedData.findIndex((pd) => pd.fieldId === change.fieldId)
            if (fieldIndex !== -1) {
              updatedProcessedData[fieldIndex] = {
                ...updatedProcessedData[fieldIndex],
                value: change.originalValue,
                displayValue: formatFieldValue(change.fieldType, change.originalValue),
              }
            }
          }
        })

        return needsUpdate
          ? {
            ...record,
            recordData: updatedRecordData,
            processedData: updatedProcessedData,
          }
          : record
      }),
    )

    toast({
      title: "Changes Discarded",
      description: "All unsaved changes have been discarded",
    })
  }

  const toggleEditMode = () => {
    console.log("ModulePage: toggleEditMode triggered", { currentEditMode: editMode })
    if (editMode !== "locked" && (pendingChanges.size > 0 || editingCell)) {
      console.log("ModulePage: Unsaved changes detected", {
        pendingChangesSize: pendingChanges.size,
        editingCell,
      })
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
    console.log("ModulePage: cycleEditMode triggered", { currentEditMode: editMode })
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
    console.log("ModulePage: New editMode set", { newEditMode: editMode })
  }

  const getEditModeInfo = () => {
    console.log("ModulePage: getEditModeInfo called", { editMode })
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

  const fetchModuleById = async (id: string) => {
    console.log("ModulePage: fetchModuleById started", { moduleId: id })
    try {
      setLoading(true)
      const response = await fetch(`/api/modules/${id}`)
      const data = await response.json()
      console.log("ModulePage: fetchModuleById response", { data })

      if (data.success) {
        setSelectedModule(data.data)
        console.log("ModulePage: selectedModule set", { module: data.data })
      } else {
        throw new Error(data.error || "Failed to fetch module")
      }
    } catch (error: any) {
      console.error("ModulePage: Error fetching module", error)
      toast({
        title: "Error",
        description: "Failed to load module. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      console.log("ModulePage: fetchModuleById completed", { loading: false })
    }
  }

  const fetchAllModuleRecords = async () => {
    if (!selectedModule) {
      console.warn("ModulePage: fetchAllModuleRecords skipped, no selectedModule")
      return
    }

    console.log("ModulePage: fetchAllModuleRecords started", {
      moduleId: selectedModule.id,
    })
    try {
      setRecordsLoading(true)
      const moduleForms = selectedModule.forms || []
      setAllModuleForms(moduleForms)
      console.log("ModulePage: allModuleForms set", { formCount: moduleForms.length })

      const allFieldsWithSections: FormFieldWithSection[] = []
      const allRecords: FormRecord[] = []

      for (const form of moduleForms) {
        console.log("ModulePage: Fetching form data", { formId: form.id })
        const formResponse = await fetch(`/api/forms/${form.id}`)
        const formData = await formResponse.json()
        console.log("ModulePage: Form data response", { formId: form.id, formData })

        if (formData.success && formData.data) {
          const formDetail = formData.data

          if (formDetail.sections) {
            let fieldOrder = 0
            formDetail.sections.forEach((section: any) => {
              if (section.fields) {
                section.fields.forEach((field: any) => {
                  const uniqueFieldId = `${form.id}_${field.id}`
                  allFieldsWithSections.push({
                    ...field,
                    id: uniqueFieldId,
                    originalId: field.id,
                    order: field.order || fieldOrder++,
                    sectionTitle: section.title,
                    sectionId: section.id,
                    formId: form.id,
                    formName: form.name,
                  })
                })
              }
            })
            console.log("ModulePage: Processed form fields", {
              formId: form.id,
              fieldCount: allFieldsWithSections.length,
            })
          }

          console.log("ModulePage: Fetching form records", { formId: form.id })
          const recordsResponse = await fetch(`/api/forms/${form.id}/records`)
          const recordsData = await recordsResponse.json()
          console.log("ModulePage: Form records response", { formId: form.id, recordsData })

          if (recordsData.success && recordsData.records) {
            const formRecords = (recordsData.records || []).map((record: FormRecord) => ({
              ...record,
              formName: form.name,
            }))
            allRecords.push(...formRecords)
            console.log("ModulePage: Added form records", {
              formId: form.id,
              recordCount: formRecords.length,
            })
          }
        }
      }

      const uniqueFieldsMap = new Map<string, FormFieldWithSection>()
      allFieldsWithSections.forEach((field) => {
        const key = `${field.label}_${field.type}`
        if (!uniqueFieldsMap.has(key)) {
          uniqueFieldsMap.set(key, field)
        }
      })

      const uniqueFields = Array.from(uniqueFieldsMap.values())
      setFormFieldsWithSections(uniqueFields)
      console.log("ModulePage: formFieldsWithSections set", {
        fieldCount: uniqueFields.length,
      })

      const processedRecords = allRecords.map((record: FormRecord) => processRecordData(record, uniqueFields))
      setFormRecords(processedRecords)
      console.log("ModulePage: formRecords set", {
        recordCount: processedRecords.length,
      })

      if (processedRecords.length === 0) {
        console.log("ModulePage: No records found")
        toast({
          title: "No Data",
          description: "No records found for the selected module.",
          variant: "default",
        })
      }
    } catch (error: any) {
      console.error("ModulePage: Error fetching module records", error)
      setFormRecords([])
      setFormFieldsWithSections([])
      toast({
        title: "Error",
        description: error.message || "Failed to load records. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRecordsLoading(false)
      console.log("ModulePage: fetchAllModuleRecords completed", { recordsLoading: false })
    }
  }

  const handlePublishForm = async (form: Form) => {
    console.log("ModulePage: handlePublishForm triggered", { formId: form.id, isPublished: form.isPublished })
    try {
      const response = await fetch(`/api/forms/${form.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !form.isPublished }),
      })
      const data = await response.json()
      console.log("ModulePage: handlePublishForm response", { formId: form.id, data })

      if (data.success) {
        if (moduleId) {
          await fetchModuleById(moduleId)
        }
        toast({
          title: "Success",
          description: `Form ${form.isPublished ? "unpublished" : "published"} successfully!`,
        })
      } else {
        throw new Error(data.error || "Failed to publish form")
      }
    } catch (error: any) {
      console.error("ModulePage: Error publishing form", error)
      toast({
        title: "Error",
        description: error.message || "Failed to publish form.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    console.log("ModulePage: useEffect for fetchModuleById", { moduleId })
    if (moduleId) {
      fetchModuleById(moduleId)
    }
  }, [moduleId])

  useEffect(() => {
    console.log("ModulePage: useEffect for fetchAllModuleRecords", { selectedModule })
    if (selectedModule) {
      fetchAllModuleRecords()
    }
  }, [selectedModule])

  useEffect(() => {
    console.log("ModulePage: useEffect for clickTimeout cleanup", { clickTimeout })
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout)
      }
    }
  }, [clickTimeout])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  if (!moduleId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">No Module Selected</h2>
          <p className="text-gray-600">Please provide a module ID in the URL.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col ">
      <div className="bg-white shadow-md border-b border-gray-200 flex-shrink-0">
        <div className="container mx-auto px-4 py-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{moduleName}</h1>
              <p className="text-sm text-gray-600">{selectedModule?.description || "Manage your forms and records"}</p>
            </div>
            <FormsContent
              forms={selectedModule.forms || []}
              selectedForm={selectedForm}
              setSelectedForm={setSelectedForm}
              openFormDialog={openFormDialog}
              handlePublishForm={handlePublishForm}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 flex-1 overflow-y-auto">
          {selectedModule ? (
            <div>

              <RecordsDisplay
                allModuleForms={allModuleForms}
                formRecords={formRecords}
                formFieldsWithSections={formFieldsWithSections}
                recordSearchQuery={recordSearchQuery}
                selectedFormFilter={selectedFormFilter}
                recordsPerPage={recordsPerPage}
                currentPage={currentPage}
                selectedRecords={selectedRecords}
                editMode={editMode}
                editingCell={editingCell}
                pendingChanges={pendingChanges}
                savingChanges={savingChanges}
                recordSortField={recordSortField}
                recordSortOrder={recordSortOrder}
                setRecordSearchQuery={setRecordSearchQuery}
                setSelectedFormFilter={setSelectedFormFilter}
                setRecordsPerPage={setRecordsPerPage}
                setCurrentPage={setCurrentPage}
                setSelectedRecords={setSelectedRecords}
                setRecordSortField={setRecordSortField}
                setRecordSortOrder={setRecordSortOrder}
                getFieldIcon={getFieldIcon}
                getEditModeInfo={getEditModeInfo}
                toggleEditMode={toggleEditMode}
                saveAllPendingChanges={saveAllPendingChanges}
                discardAllPendingChanges={discardAllPendingChanges}
                setEditingCell={setEditingCell}
                setPendingChanges={setPendingChanges}
                setFormRecords={setFormRecords}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Loading module data...</div>
          )}
        </div>
      </div>
      <PublicFormDialog formId={selectedFormForFilling} isOpen={isFormDialogOpen} onClose={closeFormDialog} />
    </div>
  )
}
