"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  FileSpreadsheet,
  Table,
  Grid,
  List,
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
} from "lucide-react";
import { PublicFormDialog } from "@/components/public-form-dialog";
import RecordsDisplay from "@/components/modules/recordsDisplay";
import FormsContent from "@/components/formcontent";

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

export default function ModulePage({
  params,
}: {
  params: { moduleName: string; moduleId: string; slug?: string[] };
}) {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const isUUID = (str: string) => {
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(str);
  };

  const moduleId = isUUID(params.moduleId)
    ? params.moduleId
    : searchParams.get("id") || params.moduleId;
  const moduleName =
    searchParams.get("name") || decodeURIComponent(params.moduleName);

  const [selectedModule, setSelectedModule] = useState<FormModule | null>(null);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formRecords, setFormRecords] = useState<EnhancedFormRecord[]>([]);
  const [allModuleForms, setAllModuleForms] = useState<Form[]>([]);
  const [formFieldsWithSections, setFormFieldsWithSections] = useState<
    FormFieldWithSection[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const [viewMode, setViewMode] = useState<"excel" | "table" | "grid" | "list">(
    "excel"
  );
  const [recordSearchQuery, setRecordSearchQuery] = useState("");
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
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const openFormDialog = (formId: string) => {
    setSelectedFormForFilling(formId);
    setIsFormDialogOpen(true);
  };

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
    const processedData: ProcessedFieldData[] = [];
    const fieldById = new Map<string, FormFieldWithSection>();
    formFields.forEach((field) => {
      fieldById.set(field.id, field);
      fieldById.set(field.originalId, field);
    });

    if (record.recordData && typeof record.recordData === "object") {
      Object.entries(record.recordData).forEach(([fieldKey, fieldData]) => {
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
          }
        }
      });
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
    return <div>Cell content</div>;
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

  const fetchModuleById = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/modules/${id}`);
      const data = await response.json();

      if (data.success) {
        setSelectedModule(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch module");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load module. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching module:", error);
    } finally {
      setLoading(false);
    }
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
          }
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

      const processedRecords = allRecords.map((record: FormRecord) =>
        processRecordData(record, uniqueFields)
      );
      setFormRecords(processedRecords);

      if (processedRecords.length === 0) {
        toast({
          title: "No Data",
          description: "No records found for the selected module.",
          variant: "default",
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

  const handlePublishForm = async (form: Form) => {
    try {
      const response = await fetch(`/api/forms/${form.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !form.isPublished }),
      });
      const data = await response.json();
      if (data.success) {
        if (moduleId) {
          await fetchModuleById(moduleId);
        }
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

  useEffect(() => {
    if (moduleId) {
      fetchModuleById(moduleId);
    }
  }, [moduleId]);

  useEffect(() => {
    if (selectedModule) {
      fetchAllModuleRecords();
    }
  }, [selectedModule]);

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

  if (!moduleId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Module Selected
          </h2>
          <p className="text-gray-600">
            Please provide a module ID in the URL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-md border-b border-gray-200 flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{moduleName}</h1>
              <p className="text-sm text-gray-600">
                {selectedModule?.description || "Manage your forms and records"}
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
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 flex-1 overflow-y-auto">
          {selectedModule ? (
            <div className="space-y-6">
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
              Loading module data...
            </div>
          )}
        </div>
      </div>

      <PublicFormDialog
        formId={selectedFormForFilling}
        isOpen={isFormDialogOpen}
        onClose={closeFormDialog}
      />
    </div>
  );
}
