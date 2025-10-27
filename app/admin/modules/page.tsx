"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Plus,
  FileSpreadsheet,
  Table,
  Grid,
  List,
  Edit,
  Trash2,
  FolderPlus,
  Settings,
  Copy,
  Mail,
  Hash,
  Type,
  CalendarDays,
  Link,
  Upload,
  CheckSquare,
  Radio,
  ChevronDown,
  Save,
  X,
  Lock,
  Edit3,
  MousePointer2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  FileText,
} from "lucide-react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";
import { PublicFormDialog } from "@/components/public-form-dialog";
import ModuleSidebar from "@/components/modules/moduleSidebar";
import FormsContent from "@/components/modules/formsContent";
import RecordsDisplay from "@/components/modules/recordsDisplay";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interfaces

interface FormModule {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  children?: FormModule[];
  forms?: Form[];
}

interface Form {
  id: string;
  name: string;
  description?: string;
  moduleId: string;
  isPublished: boolean;
  updatedAt: string;
  sections: FormSection[];
}

interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

interface FormField {
  id: string;
  label: string;
  type: string;
  order: number;
  placeholder?: string;
  description?: string;
  validation?: any;
  options?: any[];
  lookup?: any;
}

interface FormRecord {
  id: string;
  formId: string;
  formName?: string;
  recordData: Record<string, any>;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "submitted";
}

interface ProcessedFieldData {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  value: any;
  displayValue: string;
  icon: string;
  order: number;
  sectionId?: string;
  sectionTitle?: string;
  formId?: string;
}

interface EnhancedFormRecord extends FormRecord {
  processedData: ProcessedFieldData[];
}

interface FormFieldWithSection extends FormField {
  originalId: string;
  sectionTitle: string;
  sectionId: string;
  formId: string;
  formName: string;
}

interface EditingCell {
  recordId: string;
  fieldId: string;
  value: any;
  originalValue: any;
  fieldType: string;
  options?: any[];
}

interface PendingChange {
  recordId: string;
  fieldId: string;
  value: any;
  originalValue: any;
  fieldType: string;
  fieldLabel: string;
}

interface ParentModuleOption {
  id: string;
  name: string;
  level: number;
}

export default function HomePage() {
  const { toast } = useToast();
  const [modules, setModules] = useState<FormModule[]>([]);
  const [filteredModules, setFilteredModules] = useState<FormModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<FormModule | null>(null);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formRecords, setFormRecords] = useState<EnhancedFormRecord[]>([]);
  const [allModuleForms, setAllModuleForms] = useState<Form[]>([]);
  const [formFieldsWithSections, setFormFieldsWithSections] = useState<
    FormFieldWithSection[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmoduleDialogOpen, setIsSubmoduleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<FormModule | null>(null);
  const [parentModuleForSubmodule, setParentModuleForSubmodule] =
    useState<FormModule | null>(null);
  const [moduleData, setModuleData] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableParents, setAvailableParents] = useState<
    ParentModuleOption[]
  >([]);
  const [viewMode, setViewMode] = useState<"excel" | "table" | "grid" | "list">(
    "excel"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [recordSearchQuery, setRecordSearchQuery] = useState("");
  const [filteredRecords, setFilteredRecords] = useState<EnhancedFormRecord[]>(
    []
  );
  const [recordSortField, setRecordSortField] = useState<string>("");
  const [recordSortOrder, setRecordSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(20);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );
  const [selectedFormFilter, setSelectedFormFilter] = useState<string>("all");
  const [selectedFormForFilling, setSelectedFormForFilling] = useState<
    string | null
  >(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<
    "locked" | "single-click" | "double-click"
  >("double-click");
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [pendingChanges, setPendingChanges] = useState<
    Map<string, PendingChange>
  >(new Map());
  const [savingChanges, setSavingChanges] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [clickCount, setClickCount] = useState<Map<string, number>>(new Map());
  const [mergeMode, setMergeMode] = useState<"vertical" | "horizontal">(
    "horizontal"
  );
  const [mergedRecords, setMergedRecords] = useState<EnhancedFormRecord[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const openFormDialog = (formId: string) => {
    setSelectedFormForFilling(formId);
    setIsFormDialogOpen(true);
  };

  // Fetch organization ID
  useEffect(() => {
    const fetchOrganizationId = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (data.success && data.user?.organization?.id) {
          setOrganizationId(data.user.organization.id);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch organization ID.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Error fetching organization ID:", error);
        toast({
          title: "Error",
          description: "An error occurred while fetching organization ID.",
          variant: "destructive",
        });
      }
    };

    fetchOrganizationId();
  }, []);

  console.log("organization id :", organizationId);

  const closeFormDialog = () => {
    setIsFormDialogOpen(false);
    setSelectedFormForFilling(null);
  };

  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case "text":
        return Type;
      case "email":
        return Mail;
      case "number":
        return Hash;
      case "date":
      case "datetime":
        return CalendarDays;
      case "checkbox":
        return CheckSquare;
      case "radio":
        return Radio;
      case "select":
        return ChevronDown;
      case "file":
        return Upload;
      case "lookup":
        return Link;
      case "textarea":
        return FileText;
      case "tel":
      case "phone":
        return Hash;
      case "url":
        return Link;
      default:
        return Type;
    }
  };

  const formatFieldValue = (fieldType: string, value: any): string => {
    if (value === null || value === undefined) return "";
    if (value === "") return "";
    switch (fieldType) {
      case "date":
      case "datetime":
        if (value) {
          try {
            const date = new Date(value);
            return date.toLocaleDateString();
          } catch {
            return String(value);
          }
        }
        return "";
      case "email":
      case "tel":
      case "phone":
      case "text":
      case "textarea":
      case "url":
        return String(value);
      case "number":
        if (typeof value === "number") {
          return value.toLocaleString();
        }
        if (typeof value === "string" && !isNaN(Number(value))) {
          return Number(value).toLocaleString();
        }
        return String(value);
      case "checkbox":
      case "switch":
        if (typeof value === "boolean") {
          return value ? "✓ Yes" : "✗ No";
        }
        if (typeof value === "string") {
          return value.toLowerCase() === "true" || value === "1"
            ? "✓ Yes"
            : "✗ No";
        }
        return value ? "✓ Yes" : "✗ No";
      case "lookup":
        return String(value);
      case "file":
        if (typeof value === "object" && value !== null) {
          if (value.name) return String(value.name);
          if (Array.isArray(value)) {
            return `${value.length} file(s)`;
          }
          if (value.files && Array.isArray(value.files)) {
            return `${value.files.length} file(s)`;
          }
        }
        return String(value);
      case "radio":
      case "select":
        return String(value);
      default:
        if (typeof value === "object" && value !== null) {
          return JSON.stringify(value).substring(0, 50) + "...";
        }
        return String(value);
    }
  };

  const processRecordData = (
    record: FormRecord,
    formFields: FormFieldWithSection[]
  ): EnhancedFormRecord => {
    console.log("Processing record:", record);
    const processedData: ProcessedFieldData[] = [];
    const fieldById = new Map<string, FormFieldWithSection>();
    formFields.forEach((field) => {
      fieldById.set(field.id, field);
      fieldById.set(field.originalId, field); // Also map by originalId for flexibility
    });

    if (record.recordData && typeof record.recordData === "object") {
      Object.entries(record.recordData).forEach(([fieldKey, fieldData]) => {
        console.log(`Processing field ${fieldKey}:`, fieldData);
        if (typeof fieldData === "object" && fieldData !== null) {
          const fieldInfo = fieldData as any;
          const formField =
            fieldById.get(fieldKey) ||
            formFields.find((f) => f.originalId === fieldKey.split("_").pop());
          if (formField) {
            const displayValue = formatFieldValue(
              fieldInfo.type || formField.type || "text",
              fieldInfo.value
            );
            processedData.push({
              fieldId: fieldKey,
              fieldLabel: fieldInfo.label || formField.label || fieldKey,
              fieldType: fieldInfo.type || formField.type || "text",
              value: fieldInfo.value,
              displayValue: displayValue,
              icon: fieldInfo.type || formField.type || "text",
              order: formField.order || 999,
              sectionId: formField.sectionId,
              sectionTitle: formField.sectionTitle,
              formId: record.formId,
            });
          } else {
            console.warn(`No matching field found for ${fieldKey}`);
          }
        } else {
          console.warn(
            `Unexpected field data format for ${fieldKey}:`,
            fieldData
          );
        }
      });
    } else {
      console.warn("recordData is not an object:", record.recordData);
    }

    processedData.sort((a, b) => a.order - b.order);

    return {
      ...record,
      processedData,
    };
  };

  const handleCellClick = (
    recordId: string,
    fieldId: string,
    currentValue: any,
    fieldType: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const cellKey = `${recordId}-${fieldId}`;
    if (fieldType === "file") {
      toast({
        title: "Cannot Edit",
        description: "File fields cannot be edited inline",
        variant: "destructive",
      });
      return;
    }

    if (editMode === "locked") {
      return;
    }

    if (editMode === "single-click") {
      startCellEdit(recordId, fieldId, currentValue, fieldType);
      return;
    }

    if (editMode === "double-click") {
      const currentCount = clickCount.get(cellKey) || 0;
      const newCount = currentCount + 1;
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }

      setClickCount((prev) => new Map(prev.set(cellKey, newCount)));
      if (newCount === 1) {
        const timeout = setTimeout(() => {
          setClickCount((prev) => {
            const newMap = new Map(prev);
            newMap.delete(cellKey);
            return newMap;
          });
        }, 300);
        setClickTimeout(timeout);
      } else if (newCount >= 2) {
        if (clickTimeout) {
          clearTimeout(clickTimeout);
        }
        setClickCount((prev) => {
          const newMap = new Map(prev);
          newMap.delete(cellKey);
          return newMap;
        });
        startCellEdit(recordId, fieldId, currentValue, fieldType);
      }
    }
  };

  const startCellEdit = (
    recordId: string,
    fieldId: string,
    currentValue: any,
    fieldType: string
  ) => {
    const field = formFieldsWithSections.find((f) => f.id === fieldId);
    if (!field) {
      return;
    }

    setEditingCell({
      recordId,
      fieldId,
      value: currentValue,
      originalValue: currentValue,
      fieldType,
      options: field.options,
    });

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        if (
          fieldType === "text" ||
          fieldType === "email" ||
          fieldType === "url"
        ) {
          inputRef.current.select();
        }
      } else if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 100);
  };

  const updateCellValue = (newValue: any) => {
    if (!editingCell) return;
    setEditingCell({
      ...editingCell,
      value: newValue,
    });
  };

  const saveCellEdit = async () => {
    if (!editingCell) return;
    const changeKey = `${editingCell.recordId}-${editingCell.fieldId}`;
    const field = formFieldsWithSections.find(
      (f) => f.id === editingCell.fieldId
    );

    setPendingChanges((prev) => {
      const newChanges = new Map(prev);
      newChanges.set(changeKey, {
        recordId: editingCell.recordId,
        fieldId: editingCell.fieldId,
        value: editingCell.value,
        originalValue: editingCell.originalValue,
        fieldType: editingCell.fieldType,
        fieldLabel: field?.label || editingCell.fieldId,
      });
      return newChanges;
    });

    setFormRecords((prevRecords) => {
      return prevRecords.map((record) => {
        if (record.id === editingCell.recordId) {
          const updatedProcessedData = record.processedData.map((field) => {
            if (field.fieldId === editingCell.fieldId) {
              return {
                ...field,
                value: editingCell.value,
                displayValue: formatFieldValue(
                  editingCell.fieldType,
                  editingCell.value
                ),
              };
            }
            return field;
          });
          return {
            ...record,
            processedData: updatedProcessedData,
          };
        }
        return record;
      });
    });

    setEditingCell(null);
    toast({
      title: "Change Staged",
      description: `Field "${field?.label}" has been modified. Click "Save All Changes" to persist.`,
    });
  };

  const cancelCellEdit = () => {
    setEditingCell(null);
  };

  const saveAllPendingChanges = async () => {
    if (pendingChanges.size === 0) return;
    setSavingChanges(true);
    try {
      const changesByRecord = new Map<string, PendingChange[]>();
      pendingChanges.forEach((change) => {
        if (!changesByRecord.has(change.recordId)) {
          changesByRecord.set(change.recordId, []);
        }
        changesByRecord.get(change.recordId)!.push(change);
      });

      let savedCount = 0;
      for (const [recordId, changes] of changesByRecord) {
        const record = formRecords.find((r) => r.id === recordId);
        if (!record) continue;

        const updatedRecordData = { ...record.recordData };
        changes.forEach((change) => {
          if (updatedRecordData[change.fieldId]) {
            updatedRecordData[change.fieldId] = {
              ...updatedRecordData[change.fieldId],
              value: change.value,
            };
          }
        });

        const response = await fetch(
          `/api/forms/${record.formId}/records/${recordId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recordData: updatedRecordData,
              submittedBy: "admin",
              status: record.status || "submitted",
            }),
          }
        );
        const result = await response.json();
        if (!result.success) {
          throw new Error(`Failed to save record ${recordId}: ${result.error}`);
        }
        savedCount += changes.length;
      }

      setPendingChanges(new Map());
      await fetchAllModuleRecords();
      toast({
        title: "Success",
        description: `Successfully saved ${savedCount} changes across ${changesByRecord.size} records`,
      });
    } catch (error: any) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingChanges(false);
    }
  };

  const discardAllPendingChanges = () => {
    setPendingChanges(new Map());
    setEditingCell(null);
    if (selectedModule) {
      fetchAllModuleRecords();
    }
    toast({
      title: "Changes Discarded",
      description: "All unsaved changes have been discarded",
    });
  };

  const toggleEditMode = () => {
    if (editMode !== "locked" && (pendingChanges.size > 0 || editingCell)) {
      const shouldSave = window.confirm(
        "You have unsaved changes. Do you want to save them before changing edit mode?"
      );
      if (shouldSave) {
        saveAllPendingChanges().then(() => {
          cycleEditMode();
        });
      } else {
        discardAllPendingChanges();
        cycleEditMode();
      }
    } else {
      cycleEditMode();
    }
  };

  const cycleEditMode = () => {
    setEditingCell(null);
    setPendingChanges(new Map());
    setClickCount(new Map());
    if (editMode === "locked") {
      setEditMode("double-click");
    } else if (editMode === "double-click") {
      setEditMode("single-click");
    } else {
      setEditMode("locked");
    }
  };

  const getCurrentFieldValue = (
    recordId: string,
    fieldId: string,
    originalValue: any
  ) => {
    const changeKey = `${recordId}-${fieldId}`;
    const pendingChange = pendingChanges.get(changeKey);
    return pendingChange ? pendingChange.value : originalValue;
  };

  const hasFieldChanged = (recordId: string, fieldId: string) => {
    const changeKey = `${recordId}-${fieldId}`;
    return pendingChanges.has(changeKey);
  };

  const renderEditableCell = (
    record: EnhancedFormRecord,
    field: FormFieldWithSection,
    originalValue: string
  ) => {
    const isCurrentlyEditing =
      editingCell?.recordId === record.id && editingCell?.fieldId === field.id;
    const processedField = record.processedData.find(
      (f) => f.fieldId === field.id
    );
    const currentValue = getCurrentFieldValue(
      record.id,
      field.id,
      processedField?.value
    );
    const hasChanged = hasFieldChanged(record.id, field.id);
    const cellKey = `${record.id}-${field.id}`;
    const isBeingClicked = (clickCount.get(cellKey) || 0) > 0;

    const hasFieldData = processedField !== undefined;

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
                  e.preventDefault();
                  saveCellEdit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelCellEdit();
                }
              }}
              onBlur={saveCellEdit}
              className="h-6 text-[10px] sm:text-xs border-2 border-blue-500 focus:border-blue-600 bg-white shadow-lg rounded-none"
              type={field.type === "phone" ? "tel" : field.type}
              placeholder={field.placeholder}
              autoFocus
            />
          );
        case "number":
          return (
            <Input
              ref={inputRef}
              value={editingCell.value || ""}
              onChange={(e) => updateCellValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveCellEdit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelCellEdit();
                }
              }}
              onBlur={saveCellEdit}
              className="h-6 text-[10px] sm:text-xs border-2 border-blue-500 focus:border-blue-600 bg-white shadow-lg rounded-none"
              type="number"
              placeholder={field.placeholder}
              autoFocus
            />
          );
        case "textarea":
          return (
            <Textarea
              ref={textareaRef}
              value={editingCell.value || ""}
              onChange={(e) => updateCellValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  saveCellEdit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelCellEdit();
                }
              }}
              onBlur={saveCellEdit}
              className="min-h-[60px] text-xs border-2 border-blue-500 focus:border-blue-600 resize-none bg-white shadow-lg rounded-none"
              rows={2}
              placeholder={field.placeholder}
              autoFocus
            />
          );
        case "date":
          return (
            <Input
              ref={inputRef}
              value={editingCell.value || ""}
              onChange={(e) => updateCellValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveCellEdit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelCellEdit();
                }
              }}
              onBlur={saveCellEdit}
              className="h-6 text-[10px] sm:text-xs border-2 border-blue-500 focus:border-blue-600 bg-white shadow-lg rounded-none"
              type="date"
              autoFocus
            />
          );
        case "checkbox":
        case "switch":
          return (
            <div className="flex items-center justify-center h-7">
              <Checkbox
                checked={Boolean(editingCell.value)}
                onCheckedChange={(checked) => {
                  updateCellValue(checked);
                  setTimeout(saveCellEdit, 100);
                }}
              />
            </div>
          );
        case "select":
          const options = Array.isArray(editingCell.options)
            ? editingCell.options
            : [];
          return (
            <Select
              value={editingCell.value || ""}
              onValueChange={(value) => {
                updateCellValue(value);
                setTimeout(saveCellEdit, 100);
              }}
            >
              <SelectTrigger className="h-7 text-xs border-2 border-blue-500 focus:border-blue-600 bg-white shadow-lg rounded-none">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {options.map((option: any) => (
                  <SelectItem
                    key={option.value || option.id}
                    value={option.value || option.id}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        default:
          return (
            <Input
              ref={inputRef}
              value={editingCell.value || ""}
              onChange={(e) => updateCellValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveCellEdit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelCellEdit();
                }
              }}
              onBlur={saveCellEdit}
              className="h-6 text-[10px] sm:text-xs border-2 border-blue-500 focus:border-blue-600 bg-white shadow-lg rounded-none"
              placeholder={field.placeholder}
              autoFocus
            />
          );
      }
    }

    return (
      <div
        className={cn(
          "h-7 px-1 sm:px-2 flex items-center text-[10px] sm:text-xs font-normal border-r border-b border-gray-300",
          hasFieldData
            ? "bg-white cursor-cell"
            : "bg-gray-50 cursor-not-allowed",
          "select-none overflow-hidden whitespace-nowrap",
          hasFieldData && editMode === "locked" && "cursor-default",
          hasFieldData && editMode === "single-click" && "hover:bg-blue-50",
          hasFieldData && editMode === "double-click" && "hover:bg-green-50",
          hasChanged && "bg-yellow-100 text-yellow-800 font-medium",
          isBeingClicked &&
          editMode === "double-click" &&
          hasFieldData &&
          "bg-green-100"
        )}
        onClick={
          hasFieldData
            ? (e) =>
              handleCellClick(
                record.id,
                field.id,
                currentValue,
                field.type,
                e
              )
            : undefined
        }
        title={
          hasFieldData
            ? formatFieldValue(field.type, currentValue)
            : `Field not available in ${record.formName}`
        }
      >
        <span className="truncate">
          {hasFieldData
            ? formatFieldValue(field.type, currentValue) || ""
            : "—"}
        </span>
        {hasChanged && (
          <span className="ml-1 text-yellow-600 font-bold">*</span>
        )}
      </div>
    );
  };

  const getEditModeInfo = () => {
    switch (editMode) {
      case "locked":
        return {
          icon: Lock,
          label: "🔒 LOCKED",
          description: "Read Only Mode",
          color: "text-red-600 bg-red-50 border-red-300 hover:bg-red-100",
        };
      case "single-click":
        return {
          icon: MousePointer2,
          label: "👆 SINGLE CLICK",
          description: "Click any cell to edit",
          color: "text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100",
        };
      case "double-click":
        return {
          icon: Edit3,
          label: "👆👆 DOUBLE CLICK",
          description: "Double-click any cell to edit",
          color:
            "text-green-600 bg-green-50 border-green-300 hover:bg-green-100",
        };
    }
  };

  const mergeRecordsHorizontally = (
    records: EnhancedFormRecord[]
  ): EnhancedFormRecord[] => {
    const recordsByForm = new Map<string, EnhancedFormRecord[]>();
    records.forEach((record) => {
      const formId = record.formId;
      if (!recordsByForm.has(formId)) {
        recordsByForm.set(formId, []);
      }
      recordsByForm.get(formId)!.push(record);
    });

    const formsWithOneRecord = Array.from(recordsByForm.entries()).filter(
      ([formId, formRecords]) => formRecords.length === 1
    );

    const formsWithMultipleRecords = Array.from(recordsByForm.entries()).filter(
      ([formId, formRecords]) => formRecords.length > 1
    );

    const mergedResults: EnhancedFormRecord[] = [];

    if (formsWithOneRecord.length > 1) {
      const baseRecord = formsWithOneRecord[0][1][0];
      const mergedProcessedData: ProcessedFieldData[] = [];
      const mergedFormNames: string[] = [];

      formsWithOneRecord.forEach(([formId, formRecords]) => {
        const record = formRecords[0];
        mergedFormNames.push(record.formName || formId);

        record.processedData.forEach((field) => {
          mergedProcessedData.push({
            ...field,
            fieldId: `${formId}_${field.fieldId}`,
            fieldLabel: `${record.formName || formId} - ${field.fieldLabel}`,
            sectionTitle: `${record.formName || formId} - ${field.sectionTitle
              }`,
          });
        });
      });

      mergedProcessedData.sort((a, b) => {
        const aFormName = a.sectionTitle?.split(" - ")[0] || "";
        const bFormName = b.sectionTitle?.split(" - ")[0] || "";
        if (aFormName !== bFormName) {
          return aFormName.localeCompare(bFormName);
        }
        return a.order - b.order;
      });

      const mergedRecord: EnhancedFormRecord = {
        ...baseRecord,
        id: `merged_${formsWithOneRecord.map(([formId]) => formId).join("_")}`,
        formId: "merged",
        formName: `Merged: ${mergedFormNames.join(" + ")}`,
        processedData: mergedProcessedData,
        recordData: {},
      };

      mergedResults.push(mergedRecord);
    } else if (formsWithOneRecord.length === 1) {
      mergedResults.push(...formsWithOneRecord[0][1]);
    }

    formsWithMultipleRecords.forEach(([formId, formRecords]) => {
      mergedResults.push(...formRecords);
    });

    return mergedResults;
  };

  const fetchModules = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/modules?organizationId=${organizationId}`
      );
      const data = await response.json();
      console.log("i am api modules data", data);

      if (data.success) {
        console.log("Fetched modules:", data.data);
        setModules(data.data);
        setFilteredModules(data.data);
        buildParentOptions(data.data);
        if (data.data.length > 0 && !selectedModule) {
          setSelectedModule(data.data[0]);
        }
      } else {
        throw new Error(data.error || "Failed to fetch modules");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load modules. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchModules();
    }
  }, [organizationId]);

  const buildParentOptions = (moduleList: FormModule[]) => {
    const flattenModules = (
      modules: FormModule[],
      level = 0
    ): ParentModuleOption[] => {
      const options: ParentModuleOption[] = [];
      modules.forEach((module) => {
        options.push({ id: module.id, name: module.name, level });
        if (module.children && module.children.length > 0) {
          options.push(...flattenModules(module.children, level + 1));
        }
      });
      return options;
    };
    setAvailableParents(flattenModules(moduleList));
  };

  const fetchAllModuleRecords = async () => {
    if (!selectedModule) return;

    try {
      setRecordsLoading(true);
      const moduleForms = selectedModule.forms || [];
      setAllModuleForms(moduleForms);

      const allFieldsWithSections: FormFieldWithSection[] = [];
      const allRecords: FormRecord[] = [];

      for (const form of moduleForms) {
        const formResponse = await fetch(`/api/forms/${form.id}`);
        const formData = await formResponse.json();

        if (formData.success && formData.data) {
          const formDetail = formData.data;

          if (formDetail.sections) {
            let fieldOrder = 0;
            formDetail.sections.forEach((section: any) => {
              if (section.fields) {
                section.fields.forEach((field: any) => {
                  const uniqueFieldId = `${form.id}_${field.id}`;
                  allFieldsWithSections.push({
                    ...field,
                    id: uniqueFieldId,
                    originalId: field.id,
                    order: field.order || fieldOrder++,
                    sectionTitle: section.title,
                    sectionId: section.id,
                    formId: form.id,
                    formName: form.name,
                  });
                });
              }
            });
          }

          const recordsResponse = await fetch(`/api/forms/${form.id}/records`);
          const recordsData = await recordsResponse.json();

          if (recordsData.success && recordsData.records) {
            const formRecords = (recordsData.records || []).map(
              (record: FormRecord) => ({
                ...record,
                formName: form.name,
              })
            );
            allRecords.push(...formRecords);
            console.log(
              `Fetched ${formRecords.length} records for form ${form.name}`
            );
          } else {
            console.warn(`No records found for form ${form.id}`);
          }
        } else {
          console.warn(`Failed to fetch form details for ${form.id}`);
        }
      }

      const uniqueFieldsMap = new Map<string, FormFieldWithSection>();
      allFieldsWithSections.forEach((field) => {
        const key = `${field.label}_${field.type}`;
        if (!uniqueFieldsMap.has(key)) {
          uniqueFieldsMap.set(key, field);
        }
      });

      const uniqueFields = Array.from(uniqueFieldsMap.values());
      setFormFieldsWithSections(uniqueFields);
      console.log("Processed fields:", uniqueFields);

      const processedRecords = allRecords.map((record: FormRecord) =>
        processRecordData(record, uniqueFields)
      );
      console.log("Processed records:", processedRecords);
      setFormRecords(processedRecords);

      if (processedRecords.length === 0) {
        toast({
          title: "No Data",
          description: "No records found for the selected module.",
          variant: "default", // Changed from "warning" to "default"
        });
      }
    } catch (error: any) {
      console.error("Error fetching module records:", error);
      setFormRecords([]);
      setFormFieldsWithSections([]);
      toast({
        title: "Error",
        description: "Failed to load records. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleCreateModule = async () => {
    if (!moduleData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Module name is required.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      const createData = {
        name: moduleData.name,
        description: moduleData.description,
        parentId: moduleData.parentId || undefined,
      };
      const response = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });
      const data = await response.json();
      if (data.success) {
        await fetchModules();
        setIsCreateDialogOpen(false);
        setIsSubmoduleDialogOpen(false);
        setModuleData({ name: "", description: "", parentId: "" });
        setParentModuleForSubmodule(null);
        toast({
          title: "Success",
          description: "Module created successfully!",
        });
      } else {
        throw new Error(data.error || "Failed to create module");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create module.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditModule = async () => {
    if (!editingModule || !moduleData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Module name is required.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      const updateData = {
        name: moduleData.name,
        description: moduleData.description,
        parentId: moduleData.parentId || undefined,
      };
      const response = await fetch(`/api/modules/${editingModule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      if (data.success) {
        await fetchModules();
        setIsEditDialogOpen(false);
        setEditingModule(null);
        setModuleData({ name: "", description: "", parentId: "" });
        toast({
          title: "Success",
          description: "Module updated successfully!",
        });
      } else {
        throw new Error(data.error || "Failed to update module");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update module.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) {
      return;
    }
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        await fetchModules();
        if (selectedModule?.id === moduleId) {
          setSelectedModule(null);
          setSelectedForm(null);
        }
        toast({
          title: "Success",
          description: "Module deleted successfully!",
        });
      } else {
        throw new Error(data.error || "Failed to delete module");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete module.",
        variant: "destructive",
      });
    }
  };

  const handlePublishForm = async (form: Form) => {
    try {
      const response = await fetch(`/api/forms/${form.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !form.isPublished }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchModules();
        toast({
          title: "Success",
          description: `Form ${form.isPublished ? "unpublished" : "published"
            } successfully!`,
        });
      } else {
        throw new Error(data.error || "Failed to publish form");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to publish form.",
        variant: "destructive",
      });
    }
  };

  const copyFormLink = (formId: string) => {
    const link = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Success",
      description: "Form link copied to clipboard!",
    });
  };

  const openEditDialog = (module: FormModule) => {
    setEditingModule(module);
    setModuleData({
      name: module.name,
      description: module.description || "",
      parentId: module.parentId || "",
    });
    setIsEditDialogOpen(true);
  };

  const openSubmoduleDialog = (module: FormModule) => {
    setParentModuleForSubmodule(module);
    setModuleData({
      name: "",
      description: "",
      parentId: module.id,
    });
    setIsSubmoduleDialogOpen(true);
  };

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedModule) {
      fetchAllModuleRecords();
    }
  }, [selectedModule]);

  useEffect(() => {
    if (mergeMode === "horizontal") {
      const merged = mergeRecordsHorizontally(formRecords);
      setMergedRecords(merged);
    } else {
      setMergedRecords(formRecords);
    }
  }, [formRecords, mergeMode]);

  useEffect(() => {
    let updatedModules = [...modules];

    if (searchQuery) {
      const filterModules = (modules: FormModule[]): FormModule[] => {
        return modules
          .filter((module) =>
            module.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((module) => ({
            ...module,
            children: module.children ? filterModules(module.children) : [],
          }))
          .filter(
            (module) =>
              module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              module.children?.length > 0
          );
      };
      updatedModules = filterModules(modules);
    }

    const sortModules = (modules: FormModule[]): FormModule[] => {
      const sorted = [...modules].sort((a, b) => {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
      return sorted.map((module) => ({
        ...module,
        children: module.children ? sortModules(module.children) : [],
      }));
    };
    setFilteredModules(sortModules(updatedModules));
  }, [modules, searchQuery, sortOrder]);

  useEffect(() => {
    let filtered = [...mergedRecords];

    if (selectedFormFilter !== "all") {
      filtered = filtered.filter(
        (record) => record.formId === selectedFormFilter
      );
    }

    if (recordSearchQuery) {
      filtered = filtered.filter((record) => {
        return (
          record.processedData.some((field) =>
            field.displayValue
              .toLowerCase()
              .includes(recordSearchQuery.toLowerCase())
          ) ||
          record.id.toLowerCase().includes(recordSearchQuery.toLowerCase()) ||
          (record.formName &&
            record.formName
              .toLowerCase()
              .includes(recordSearchQuery.toLowerCase()))
        );
      });
    }

    if (recordSortField) {
      filtered.sort((a, b) => {
        let aValue = "";
        let bValue = "";
        if (recordSortField === "submittedAt") {
          aValue = a.submittedAt;
          bValue = b.submittedAt;
        } else if (recordSortField === "status") {
          aValue = a.status || "";
          bValue = b.status || "";
        } else if (recordSortField === "formName") {
          aValue = a.formName || "";
          bValue = b.formName || "";
        } else {
          const aField = a.processedData.find(
            (f) => f.fieldId === recordSortField
          );
          const bField = b.processedData.find(
            (f) => f.fieldId === recordSortField
          );
          aValue = aField?.displayValue || "";
          bValue = bField?.displayValue || "";
        }
        const comparison = aValue.localeCompare(bValue);
        return recordSortOrder === "asc" ? comparison : -comparison;
      });
    }
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [
    mergedRecords,
    recordSearchQuery,
    recordSortField,
    recordSortOrder,
    selectedFormFilter,
  ]);

  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-md border-b border-gray-200 flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">ERP System</h1>
              <p className="text-sm text-gray-600">
                Manage your forms and modules
              </p>
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
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> New Module
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <ModuleSidebar
          filteredModules={filteredModules}
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          selectedModule={selectedModule}
          setSearchQuery={setSearchQuery}
          setSortOrder={setSortOrder}
          setSelectedModule={setSelectedModule}
          setSelectedForm={setSelectedForm}
          openSubmoduleDialog={openSubmoduleDialog}
          openEditDialog={openEditDialog}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 flex-1 overflow-y-auto">
            {selectedModule ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedModule.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedModule.description || "No description"}
                    </p>
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
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </NextLink>
                  </div>
                </div>
                <FormsContent
                  forms={selectedModule.forms || []}
                  selectedForm={selectedForm}
                  viewMode={viewMode}
                  setSelectedForm={setSelectedForm}
                  openFormDialog={openFormDialog}
                  handlePublishForm={handlePublishForm}
                />
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
                  renderEditableCell={renderEditableCell}
                  getEditModeInfo={getEditModeInfo}
                  toggleEditMode={toggleEditMode}
                  saveAllPendingChanges={saveAllPendingChanges}
                  discardAllPendingChanges={discardAllPendingChanges}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a module to view its forms and unified records data
              </div>
            )}
          </div>
        </div>
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Create Module</DialogTitle>
            <DialogDescription>Create a new module</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700">
                Name
              </Label>
              <Input
                id="name"
                value={moduleData.name}
                onChange={(e) =>
                  setModuleData({ ...moduleData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setModuleData({ ...moduleData, description: e.target.value })
                }
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
                onChange={(e) =>
                  setModuleData({ ...moduleData, parentId: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No Parent (Top-level)</option>
                {availableParents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {"  ".repeat(parent.level)} {parent.name}
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
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                onChange={(e) =>
                  setModuleData({ ...moduleData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setModuleData({ ...moduleData, description: e.target.value })
                }
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
                onChange={(e) =>
                  setModuleData({ ...moduleData, parentId: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No Parent (Top-level)</option>
                {availableParents
                  .filter((parent) => parent.id !== editingModule?.id)
                  .map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {"  ".repeat(parent.level)} {parent.name}
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
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isSubmoduleDialogOpen}
        onOpenChange={setIsSubmoduleDialogOpen}
      >
        <DialogContent className="bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Create Submodule</DialogTitle>
            <DialogDescription>
              Add a new submodule under {parentModuleForSubmodule?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="submodule-name" className="text-gray-700">
                Name
              </Label>
              <Input
                id="submodule-name"
                value={moduleData.name}
                onChange={(e) =>
                  setModuleData({ ...moduleData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setModuleData({ ...moduleData, description: e.target.value })
                }
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
                setIsSubmoduleDialogOpen(false);
                setParentModuleForSubmodule(null);
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
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create Submodule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PublicFormDialog
        formId={selectedFormForFilling}
        isOpen={isFormDialogOpen}
        onClose={closeFormDialog}
      />
    </div>
  );
}
