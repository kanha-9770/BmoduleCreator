"use client"
import React from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  User,
  Building,
  Badge,
} from "lucide-react"
import { cn } from "@/lib/utils"

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
  onEditRecord: (record: EnhancedFormRecord) => void
  onDeleteRecord: (record: EnhancedFormRecord) => Promise<void>
  onViewDetails: (record: EnhancedFormRecord) => void
}

interface ViewDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  record: EnhancedFormRecord | null
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({ isOpen, onClose, record }) => {
  const [userInfo, setUserInfo] = React.useState<any>(null)
  const [recordDataByForm, setRecordDataByForm] = React.useState<Map<string, Map<string, ProcessedFieldData[]>>>(
    new Map(),
  )
  const [loading, setLoading] = React.useState(false)
  const [activeFormTab, setActiveFormTab] = React.useState<string>("")

  React.useEffect(() => {
    if (isOpen && record) {
      setLoading(true)
      const fetchData = async () => {
        try {
          const userRes = await fetch("/api/attendance-user")
          if (userRes.ok) {
            const userData = await userRes.json()
            setUserInfo(userData.user)
          }

          const dataByForm = new Map<string, Map<string, ProcessedFieldData[]>>()
          const seenFields = new Set<string>()

          if (record.processedData && record.processedData.length > 0) {
            record.processedData.forEach((field) => {
              const formName = field.formName || record.formName || "Form Submission"
              const sectionKey = field.sectionTitle || "General Information"
              const fieldKey = `${formName}_${sectionKey}_${field.fieldLabel}`

              if (seenFields.has(fieldKey)) {
                return
              }
              seenFields.add(fieldKey)

              if (!dataByForm.has(formName)) {
                dataByForm.set(formName, new Map())
              }

              const formSections = dataByForm.get(formName)!
              if (!formSections.has(sectionKey)) {
                formSections.set(sectionKey, [])
              }

              formSections.get(sectionKey)!.push(field)
            })

            dataByForm.forEach((sections) => {
              sections.forEach((fields) => {
                fields.sort((a, b) => (a.order || 999) - (b.order || 999))
              })
            })
          } else if (record.recordData && Object.keys(record.recordData).length > 0) {
            const formName = record.formName || "Form Submission"
            const sectionMap = new Map<string, ProcessedFieldData[]>()

            Object.entries(record.recordData).forEach(([key, fieldValue]: [string, any]) => {
              const sectionKey = fieldValue.sectionTitle || "General Information"
              const fieldKey = `${formName}_${sectionKey}_${fieldValue.label || key}`

              if (seenFields.has(fieldKey)) {
                return
              }
              seenFields.add(fieldKey)

              if (!sectionMap.has(sectionKey)) {
                sectionMap.set(sectionKey, [])
              }

              sectionMap.get(sectionKey)!.push({
                recordId: record.id,
                lookup: fieldValue.lookup,
                options: fieldValue.options,
                fieldId: fieldValue.fieldId || key,
                fieldLabel: fieldValue.label || key,
                fieldType: fieldValue.type || "text",
                value: fieldValue.value,
                displayValue: fieldValue.value != null ? String(fieldValue.value) : "",
                icon: "",
                order: fieldValue.order || 999,
                sectionId: fieldValue.sectionId,
                sectionTitle: sectionKey,
                formId: record.formId,
                formName: record.formName,
              })
            })

            sectionMap.forEach((fields) => {
              fields.sort((a, b) => (a.order || 999) - (b.order || 999))
            })

            dataByForm.set(formName, sectionMap)
          }

          setRecordDataByForm(dataByForm)

          if (dataByForm.size > 0) {
            setActiveFormTab(Array.from(dataByForm.keys())[0])
          }
        } catch (error) {
          console.error("[ViewDetailsModal] Error fetching data:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [isOpen, record])

  if (!record) return null

  const renderFieldValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return "—"

    if (typeof value === "boolean") {
      return (
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold inline-block",
            value ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700",
          )}
        >
          {value ? "✓ Yes" : "✗ No"}
        </span>
      )
    }

    if (typeof value === "object") {
      return JSON.stringify(value)
    }

    return String(value)
  }

  const renderFieldContent = (field: ProcessedFieldData) => {
    if (field.fieldLabel === "New Camera" && field.value) {
      return (
        <div className="flex items-center justify-center w-full">
          <Image
            src={field.value || "/placeholder.svg"}
            alt={field.fieldLabel}
            width={150}
            height={150}
            className="rounded-lg object-cover shadow-lg border-2 border-gray-200"
            onError={(e) => {
              e.currentTarget.style.display = "none"
              const sibling = e.currentTarget.nextElementSibling as HTMLElement
              if (sibling) sibling.style.display = "block"
            }}
          />
          <span className="hidden text-gray-500 text-sm">No Image Available</span>
        </div>
      )
    }
    return renderFieldValue(field.value || field.displayValue)
  }

  const isMergedRecord = record.formId === "merged"
  const formNames = Array.from(recordDataByForm.keys())

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-white to-gray-50">
        <DialogHeader className="border-b pb-4 bg-white -mx-6 px-6 -mt-6 pt-6 mb-6">
          <DialogTitle className="text-3xl font-bold text-gray-900">Record Details</DialogTitle>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="text-sm text-gray-600">
              Submitted:{" "}
              <span className="font-semibold text-gray-900">{new Date(record.submittedAt).toLocaleString()}</span>
            </div>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                record.status === "submitted" && "bg-blue-100 text-blue-800",
                record.status === "approved" && "bg-green-100 text-green-800",
                record.status === "rejected" && "bg-red-100 text-red-800",
                record.status === "pending" && "bg-yellow-100 text-yellow-800",
              )}
            >
              {record.status}
            </span>
            {isMergedRecord && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 flex items-center gap-1">
                <Badge className="h-3 w-3" />
                Merged Record
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">User Information</h2>
                </div>
                {userInfo ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg overflow-hidden border-4 border-white">
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.username || userInfo.email || "user"}`}
                                alt={`${userInfo.first_name} ${userInfo.last_name}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-blue-600 border-4 border-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer group">
                              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Update Photo
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {userInfo.first_name} {userInfo.last_name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{userInfo.username || "N/A"}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold",
                                userInfo.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800",
                              )}
                            >
                              {userInfo.status || "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Badge className="h-4 w-4 text-blue-600" />
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            First Name
                          </label>
                          <p className="text-gray-900 font-medium mt-1">{userInfo.first_name || "—"}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Last Name
                          </label>
                          <p className="text-gray-900 font-medium mt-1">{userInfo.last_name || "—"}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                            <Mail className="h-4 w-4" /> Email
                          </label>
                          <p className="text-gray-900 font-medium mt-1">{userInfo.email || "—"}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                            <Phone className="h-4 w-4" /> Mobile
                          </label>
                          <p className="text-gray-900 font-medium mt-1">{userInfo.mobile || "—"}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Username
                          </label>
                          <p className="text-gray-900 font-medium mt-1">{userInfo.username || "—"}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Account Status
                          </label>
                          <p className="text-gray-900 font-medium mt-1 capitalize">{userInfo.status || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {(userInfo.organization || userInfo.department) && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Building className="h-4 w-4 text-purple-600" />
                          Organization
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {userInfo.organization && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Organization Name
                              </label>
                              <p className="text-gray-900 font-medium mt-1">
                                {typeof userInfo.organization === "object"
                                  ? userInfo.organization.name
                                  : userInfo.organization}
                              </p>
                            </div>
                          )}
                          {userInfo.department && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Department
                              </label>
                              <p className="text-gray-900 font-medium mt-1">{userInfo.department || "—"}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {userInfo.employee && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-green-600" />
                          Employee Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Designation
                            </label>
                            <p className="text-gray-900 font-medium mt-1">{userInfo.employee.designation || "—"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Department
                            </label>
                            <p className="text-gray-900 font-medium mt-1">{userInfo.employee.department || "—"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                              <Calendar className="h-4 w-4" /> Date of Joining
                            </label>
                            <p className="text-gray-900 font-medium mt-1">
                              {userInfo.employee.dateOfJoining
                                ? new Date(userInfo.employee.dateOfJoining).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Shift Type
                            </label>
                            <p className="text-gray-900 font-medium mt-1">{userInfo.employee.shiftType || "—"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                              <Clock className="h-4 w-4" /> In Time
                            </label>
                            <p className="text-gray-900 font-medium mt-1">{userInfo.employee.inTime || "—"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                              <Clock className="h-4 w-4" /> Out Time
                            </label>
                            <p className="text-gray-900 font-medium mt-1">{userInfo.employee.outTime || "—"}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {(userInfo.phone || userInfo.location) && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-orange-600" />
                          Contact Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {userInfo.phone && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Phone
                              </label>
                              <p className="text-gray-900 font-medium mt-1">{userInfo.phone || "—"}</p>
                            </div>
                          )}
                          {userInfo.location && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Location
                              </label>
                              <p className="text-gray-900 font-medium mt-1">{userInfo.location || "—"}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <User className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-base font-semibold text-gray-600">No User Information Available</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isMergedRecord ? "Merged Record Data" : "Form Submission Data"}
                  </h2>
                  {isMergedRecord && (
                    <span className="text-sm text-gray-600 font-medium">
                      ({formNames.length} {formNames.length === 1 ? "form" : "forms"})
                    </span>
                  )}
                </div>
                {recordDataByForm.size > 0 ? (
                  <>
                    {isMergedRecord && formNames.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
                        {formNames.map((formName) => (
                          <button
                            key={formName}
                            onClick={() => setActiveFormTab(formName)}
                            className={cn(
                              "px-4 py-2 rounded-t-lg text-sm font-semibold transition-all",
                              activeFormTab === formName
                                ? "bg-blue-600 text-white border-b-2 border-blue-600"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-b-2 border-transparent",
                            )}
                          >
                            {formName}
                          </button>
                        ))}
                      </div>
                    )}
                    {activeFormTab && recordDataByForm.has(activeFormTab) && (
                      <div className="space-y-6">
                        {Array.from(recordDataByForm.get(activeFormTab)!.entries()).map(([sectionName, fields]) => (
                          <div
                            key={sectionName}
                            className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                          >
                            <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b-2 border-blue-100">
                              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-md"></div>
                              {sectionName}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {fields.map((field) => (
                                <div
                                  key={`${field.fieldId}-${field.recordId}`}
                                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
                                >
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                                    {field.fieldType && (
                                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs font-bold shadow-sm">
                                        {field.fieldType.charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                    {field.fieldLabel}
                                  </label>
                                  <div className="text-gray-900 font-semibold text-base">
                                    {renderFieldContent(field)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <Calendar className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-lg font-semibold text-gray-600 mb-2">No Form Data Available</p>
                    <p className="text-sm text-gray-500">This record does not contain any form submission data.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
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
  onEditRecord,
  onDeleteRecord,
  onViewDetails,
}) => {
  const [viewDetailsOpen, setViewDetailsOpen] = React.useState(false)
  const [selectedRecord, setSelectedRecord] = React.useState<EnhancedFormRecord | null>(null)
  const [selectedUserId, setSelectedUserId] = React.useState<string>("")

  const buildProcessedDataFromRecordData = (rec: EnhancedFormRecord): ProcessedFieldData[] => {
    return Object.entries(rec.recordData).map(([key, field]: [string, any]) => ({
      recordId: rec.id,
      lookup: field.lookup,
      options: field.options,
      fieldId: field.fieldId || key,
      fieldLabel: field.label,
      fieldType: field.type,
      value: field.value,
      displayValue: field.value != null ? field.value.toString() : "",
      icon: "",
      order: field.order || 999,
      sectionId: field.sectionId,
      sectionTitle: field.sectionTitle || "Default Section",
      formId: rec.formId,
      formName: rec.formName || "Unknown Form",
    }))
  }

  const getFieldData = (record: EnhancedFormRecord, fieldDef: FormFieldWithSection): ProcessedFieldData | undefined => {
    if (fieldDef.formId === "merged-field") {
      // For merged fields, find any data matching the label from any form
      return record.processedData.find((pd) => pd.fieldLabel === fieldDef.label)
    } else if (record.formId === "merged") {
      return record.processedData.find((pd) => pd.formId === fieldDef.formId && pd.fieldId === fieldDef.originalId)
    } else {
      // Find all fields with the same label (for duplicate field merging)
      const matchingFields = record.processedData.filter((pd) => pd.fieldLabel === fieldDef.label)

      if (matchingFields.length === 0) {
        return record.processedData.find((pd) => pd.fieldId === fieldDef.id)
      }

      if (matchingFields.length === 1) {
        return matchingFields[0]
      }

      // If multiple fields with same label, merge and return the one with the newest/most recent value
      // For dates, return the latest date; for other fields, return the first non-empty value
      const fieldsWithValue = matchingFields.filter((f) => f.value && f.value !== "")

      if (fieldsWithValue.length === 0) {
        return matchingFields[0]
      }

      // Check if it's a date field
      const isDateField = matchingFields[0].fieldType === "date" || matchingFields[0].fieldType === "datetime"

      if (isDateField) {
        // Return the field with the most recent date
        return fieldsWithValue.reduce((latest, current) => {
          const latestDate = new Date(latest.value)
          const currentDate = new Date(current.value)
          return currentDate > latestDate ? current : latest
        })
      } else {
        // For non-date fields, return the first field with a value
        return fieldsWithValue[0]
      }
    }
  }

  const getUniqueFieldDefinitions = (records: EnhancedFormRecord[], isMerged: boolean) => {
    const fieldMap = new Map<string, FormFieldWithSection>()

    records.forEach((record) => {
      record.processedData.forEach((fieldData) => {
        const formId = fieldData.formId || record.formId
        const fieldId = fieldData.fieldId
        const fieldLabel = fieldData.fieldLabel

        // Create unique key based on formId and fieldLabel to merge duplicates within same form
        const uniqueKey = isMerged
          ? `${formId}::${fieldLabel}` // For merged view: form + label (merge duplicates in same form)
          : fieldId // For single form: just fieldId

        if (!fieldMap.has(uniqueKey)) {
          fieldMap.set(uniqueKey, {
            id: uniqueKey,
            originalId: fieldId,
            label: fieldLabel,
            type: fieldData.fieldType,
            order: fieldData.order || 999,
            sectionTitle: fieldData.sectionTitle || "Default Section",
            sectionId: fieldData.sectionId || "",
            formId,
            formName: fieldData.formName || record.formName || "Unknown Form",
            options: fieldData.options,
            lookup: fieldData.lookup,
          })
        }
      })
    })

    const fieldsArray = Array.from(fieldMap.values())

    return fieldsArray.sort((a, b) => a.order - b.order)
  }

  const renderFieldEditor = (record: EnhancedFormRecord, fieldDef: FormFieldWithSection) => {
    const fieldData = getFieldData(record, fieldDef)
    const actualRecordId = fieldData?.recordId || record.id
    const actualFormId = fieldData?.formId || record.formId
    const pendingChange = pendingChanges.get(`${record.id}-${fieldDef.id}`)
    const currentValue = pendingChange ? pendingChange.value : (fieldData?.value ?? "")
    const originalValue = fieldData?.value ?? ""
    const originalFieldId = fieldData?.fieldId || fieldDef.originalId

    if (fieldDef.label === "New Camera") {
      return <Input value={currentValue} disabled className="h-7 text-[10px] sm:text-xs p-1 bg-gray-100" />
    }

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

  const computeMergedRecords = (): EnhancedFormRecord[] => {
    const recordsByForm = new Map<string, EnhancedFormRecord[]>()
    for (const record of formRecords) {
      if (!recordsByForm.has(record.formId)) {
        recordsByForm.set(record.formId, [])
      }
      recordsByForm.get(record.formId)!.push(record)
    }

    Array.from(recordsByForm.values()).forEach((records) => {
      records.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    })

    let maxRows = 0
    Array.from(recordsByForm.values()).forEach((records) => {
      maxRows = Math.max(maxRows, records.length)
    })

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
      const combinedRecordData: Record<string, Record<string, any>> = {}

      Array.from(recordsByForm.entries()).forEach(([formId, records]) => {
        if (i < records.length) {
          const rec = records[i]
          mergedRecord.originalRecordIds!.set(formId, rec.id)

          const builtProcessedData = buildProcessedDataFromRecordData(rec)
          const updatedProcessedData = builtProcessedData.map((pd) => ({
            ...pd,
            formId,
            formName: rec.formName,
          }))
          combinedProcessedData.push(...updatedProcessedData)

          combinedRecordData[formId] = rec.recordData

          const subTime = new Date(rec.submittedAt).getTime()
          if (subTime > latestSubmittedAt) {
            latestSubmittedAt = subTime
            mergedRecord.submittedAt = rec.submittedAt
            latestStatus = rec.status
          }
        }
      })

      mergedRecord.processedData = combinedProcessedData
      mergedRecord.recordData = combinedRecordData
      mergedRecord.status = latestStatus

      if (latestSubmittedAt > 0) {
        mergedRecordsList.push(mergedRecord)
      }
    }

    return mergedRecordsList
  }

  const sortRecords = (records: EnhancedFormRecord[]): EnhancedFormRecord[] => {
    const sorted = [...records].sort((a, b) => {
      let valA: any, valB: any

      if (recordSortField === "submittedAt") {
        valA = new Date(a.submittedAt).getTime()
        valB = new Date(b.submittedAt).getTime()
      } else if (recordSortField === "status") {
        valA = a.status
        valB = b.status
      } else {
        let targetFieldId: string
        let targetFormId: string | undefined

        if (recordSortField.includes("_")) {
          const parts = recordSortField.split("_", 2)
          targetFormId = parts[0]
          targetFieldId = parts[1]
        } else {
          targetFieldId = recordSortField
        }

        const fieldDataA = targetFormId
          ? a.processedData.find((pd) => (pd.formId || a.formId) === targetFormId && pd.fieldId === targetFieldId)
          : a.processedData.find((pd) => pd.fieldId === targetFieldId)

        const fieldDataB = targetFormId
          ? b.processedData.find((pd) => (pd.formId || b.formId) === targetFormId && pd.fieldId === targetFieldId)
          : b.processedData.find((pd) => pd.fieldId === targetFieldId)

        valA = fieldDataA?.displayValue || fieldDataA?.value || ""
        valB = fieldDataB?.displayValue || fieldDataB?.value || ""
      }

      if (valA < valB) return recordSortOrder === "asc" ? -1 : 1
      if (valA > valB) return recordSortOrder === "asc" ? 1 : -1
      return 0
    })

    return sorted
  }

  const handleDoubleClick = (record: EnhancedFormRecord, fieldDef: FormFieldWithSection) => {
    if (editMode !== "double-click" || savingChanges || fieldDef.label === "New Camera") return

    const fieldData = getFieldData(record, fieldDef)
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
    if (e.key === "Enter" && !savingChanges && editMode !== "locked" && fieldDef.label !== "New Camera") {
      const fieldData = getFieldData(record, fieldDef)
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

  const handleViewDetails = (record: EnhancedFormRecord) => {
    setSelectedRecord(record)
    const userIdFromRecord = record.recordData?.userId?.value || record.recordData?.userId || ""
    setSelectedUserId(userIdFromRecord)
    setViewDetailsOpen(true)
    onViewDetails(record)
  }

  const mergedRecords = computeMergedRecords()
  const populatedOriginalRecords = formRecords.map((r) => ({
    ...r,
    processedData: r.processedData.length > 0 ? [...r.processedData] : buildProcessedDataFromRecordData(r),
  }))

  let baseRecords: EnhancedFormRecord[] = mergedRecords
  const isMergedMode = selectedFormFilter === "all"

  if (!isMergedMode) {
    baseRecords = populatedOriginalRecords.filter((r) => r.formId === selectedFormFilter)
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

  const uniqueFieldDefs = getUniqueFieldDefinitions(baseRecords, isMergedMode)

  const editModeInfo = getEditModeInfo()

  const selectedFormName =
    selectedFormFilter === "all"
      ? "All Forms"
      : (allModuleForms.find((f) => f.id === selectedFormFilter)?.name ?? "Unknown")

  return (
    <>
      <Card className="border border-gray-300 rounded-lg shadow-md bg-white">
        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-blue-600"></div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {selectedFormFilter === "all" ? "All Records" : `${selectedFormName} Records`}
              </CardTitle>
              <span className="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                {totalRecords} {totalRecords === 1 ? "record" : "records"}
              </span>
            </div>
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
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {savingChanges ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
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
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search all records..."
                  value={recordSearchQuery}
                  onChange={(e) => setRecordSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:ring-blue-500 h-9 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                Filter by Form
              </label>
              <Select value={selectedFormFilter} onValueChange={setSelectedFormFilter}>
                <SelectTrigger className="h-9">
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
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                Records Per Page
              </label>
              <Select value={recordsPerPage.toString()} onValueChange={(value) => setRecordsPerPage(Number(value))}>
                <SelectTrigger className="h-9">
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
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700">
                Showing <span className="font-bold text-blue-600">{startIdx + 1}</span> to{" "}
                <span className="font-bold text-blue-600">{Math.min(endIdx, totalRecords)}</span> of{" "}
                <span className="font-bold text-blue-600">{totalRecords}</span> records
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
                <div className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                  Page <span className="font-bold text-blue-600">{currentPage}</span> of{" "}
                  <span className="font-bold text-blue-600">{Math.ceil(totalRecords / recordsPerPage)}</span>
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

          <div className="border border-gray-300 bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="overflow-auto max-h-[65vh]">
              <div className="inline-block min-w-full">
                <div style={{ fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif" }}>
                  <div className="flex bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300 sticky top-0 z-20 min-w-max">
                    <div className="w-10 h-10 border-r border-gray-300 bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Checkbox
                        checked={selectedRecords.size === paginatedRecords.length && paginatedRecords.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRecords(new Set(paginatedRecords.map((r) => r.id)))
                          } else {
                            setSelectedRecords(new Set())
                          }
                        }}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="w-12 h-10 border-r border-gray-300 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">
                      #
                    </div>
                    <div className="w-20 sm:w-24 h-10 border-r border-gray-300 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">
                      Actions
                    </div>
                    <div
                      className="w-32 sm:w-40 h-10 border-r border-gray-300 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-800 cursor-pointer hover:bg-gray-200 transition-colors flex-shrink-0"
                      onClick={() => {
                        if (recordSortField === "submittedAt") {
                          setRecordSortOrder(recordSortOrder === "asc" ? "desc" : "asc")
                        } else {
                          setRecordSortField("submittedAt")
                          setRecordSortOrder("asc")
                        }
                      }}
                      title="Click to sort by submitted date"
                    >
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="hidden sm:inline">Submitted Date</span>
                        <span className="sm:hidden">Date</span>
                        {recordSortField === "submittedAt" &&
                          (recordSortOrder === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-blue-600" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-blue-600" />
                          ))}
                      </div>
                    </div>
                    <div
                      className="w-24 sm:w-28 h-10 border-r border-gray-300 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-800 cursor-pointer hover:bg-gray-200 transition-colors flex-shrink-0"
                      onClick={() => {
                        if (recordSortField === "status") {
                          setRecordSortOrder(recordSortOrder === "asc" ? "desc" : "asc")
                        } else {
                          setRecordSortField("status")
                          setRecordSortOrder("asc")
                        }
                      }}
                      title="Click to sort by status"
                    >
                      <div className="flex items-center gap-1.5">
                        <Badge className="h-4 w-4 text-blue-600" />
                        <span>Status</span>
                        {recordSortField === "status" &&
                          (recordSortOrder === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-blue-600" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-blue-600" />
                          ))}
                      </div>
                    </div>
                    {uniqueFieldDefs.map((field) => (
                      <div
                        key={field.id}
                        className="w-40 sm:w-48 h-10 border-r border-gray-300 bg-gray-100 flex flex-col items-center justify-center text-xs font-bold text-gray-800 px-2 cursor-pointer hover:bg-gray-200 transition-colors flex-shrink-0"
                        title={`${field.formName} - ${field.sectionTitle}\n${field.label}`}
                        onClick={() => {
                          if (recordSortField === field.id) {
                            setRecordSortOrder(recordSortOrder === "asc" ? "desc" : "asc")
                          } else {
                            setRecordSortField(field.id)
                            setRecordSortOrder("asc")
                          }
                        }}
                      >
                        <div className="flex flex-col items-center gap-0.5 truncate w-full text-center">
                          <div className="text-[10px] sm:text-[11px] text-blue-600 font-semibold uppercase tracking-wide truncate w-full">
                            {field.formName}
                          </div>
                          <div className="flex items-center gap-1 truncate w-full justify-center">
                            {React.createElement(getFieldIcon(field.type), {
                              className: "h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 text-gray-600",
                            })}
                            <span className="truncate text-[11px] sm:text-xs font-bold text-gray-900">
                              {field.label}
                            </span>
                            {recordSortField === field.id &&
                              (recordSortOrder === "asc" ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {paginatedRecords.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-gray-500">
                      <p className="text-sm font-medium">No records found</p>
                    </div>
                  ) : (
                    paginatedRecords.map((record, rowIndex) => (
                      <div
                        key={record.id}
                        className="flex hover:bg-blue-50 transition-colors min-w-max border-b border-gray-200 last:border-b-0"
                      >
                        <div className="w-10 h-9 border-r border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
                          <Checkbox
                            checked={selectedRecords.has(record.id)}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedRecords)
                              if (checked) newSelected.add(record.id)
                              else newSelected.delete(record.id)
                              setSelectedRecords(newSelected)
                            }}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="w-12 h-9 border-r border-gray-200 bg-gray-50 flex items-center justify-center text-xs font-semibold text-gray-700 flex-shrink-0">
                          {startIdx + rowIndex + 1}
                        </div>
                        <div className="w-20 sm:w-24 h-9 border-r border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-200 rounded">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel className="text-xs font-bold">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-xs cursor-pointer"
                                onClick={() => handleViewDetails(record)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => onEditRecord(record)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Record
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-xs text-red-600 cursor-pointer"
                                onClick={async () => {
                                  if (window.confirm("Are you sure you want to delete this record?")) {
                                    await onDeleteRecord(record)
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="w-32 sm:w-40 h-9 border-r border-gray-200 bg-white flex items-center px-3 text-sm font-medium text-gray-800 flex-shrink-0">
                          <span className="hidden sm:inline">
                            {new Date(record.submittedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="sm:hidden">
                            {new Date(record.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="w-24 sm:w-28 h-9 border-r border-gray-200 bg-white flex items-center justify-center px-2 flex-shrink-0">
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-full text-xs font-semibold inline-block",
                              record.status === "submitted" && "bg-blue-100 text-blue-800",
                              record.status === "approved" && "bg-green-100 text-green-800",
                              record.status === "rejected" && "bg-red-100 text-red-800",
                              record.status === "pending" && "bg-yellow-100 text-yellow-800",
                            )}
                          >
                            <span className="hidden sm:inline">{record.status || "submitted"}</span>
                            <span className="sm:hidden">{(record.status || "submitted").charAt(0).toUpperCase()}</span>
                          </span>
                        </div>
                        {uniqueFieldDefs.map((fieldDef) => {
                          const fieldData = getFieldData(record, fieldDef)
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
                                "w-40 sm:w-48 h-9 border-r border-gray-200 bg-white flex items-center justify-start px-3 text-sm font-medium text-gray-700 flex-shrink-0",
                                isEditing && "ring-2 ring-inset ring-blue-500 bg-blue-50",
                                pendingChange && !isEditing && "bg-yellow-50 font-semibold",
                                editMode === "double-click" &&
                                  !isEditing &&
                                  fieldDef.label !== "New Camera" &&
                                  "cursor-pointer hover:bg-gray-100",
                              )}
                              title={`${fieldDef.label}: ${displayValue}`}
                              onDoubleClick={() => handleDoubleClick(record, fieldDef)}
                              onKeyDown={(e) => handleKeyDown(e, record, fieldDef)}
                              tabIndex={fieldDef.label !== "New Camera" ? 0 : undefined}
                              role={fieldDef.label !== "New Camera" ? "button" : undefined}
                              aria-label={
                                fieldDef.label !== "New Camera" ? `${fieldDef.label}: ${displayValue}` : undefined
                              }
                            >
                              {isEditing ? (
                                renderFieldEditor(record, fieldDef)
                              ) : fieldDef.label === "New Camera" && displayValue ? (
                                <div className="flex items-center justify-center w-full h-full">
                                  <Image
                                    src={displayValue || "/placeholder.svg"}
                                    alt="New Camera"
                                    width={40}
                                    height={40}
                                    className="rounded object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none"
                                      const sibling = e.currentTarget.nextElementSibling as HTMLElement
                                      if (sibling) sibling.style.display = "block"
                                    }}
                                  />
                                  <span className="hidden text-gray-500 text-xs">No Image</span>
                                </div>
                              ) : (
                                <span className="truncate">{displayValue || "—"}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <ViewDetailsModal isOpen={viewDetailsOpen} onClose={() => setViewDetailsOpen(false)} record={selectedRecord} />
    </>
  )
}
export default RecordsDisplay
