import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Form {
  id: string;
  name: string;
  // Other fields as needed
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

interface EnhancedFormRecord {
  id: string;
  formId: string;
  formName?: string;
  recordData: Record<string, any>;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "submitted";
  processedData: ProcessedFieldData[];
}

interface FormFieldWithSection {
  id: string;
  originalId: string;
  label: string;
  type: string;
  order: number;
  sectionTitle: string;
  sectionId: string;
  formId: string;
  formName: string;
  placeholder?: string;
  description?: string;
  validation?: any;
  options?: any[];
  lookup?: any;
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

interface RecordsDisplayProps {
  allModuleForms: Form[];
  formRecords: EnhancedFormRecord[];
  formFieldsWithSections: FormFieldWithSection[];
  recordSearchQuery: string;
  selectedFormFilter: string;
  recordsPerPage: number;
  currentPage: number;
  selectedRecords: Set<string>;
  editMode: "locked" | "single-click" | "double-click";
  editingCell: EditingCell | null;
  pendingChanges: Map<string, PendingChange>;
  savingChanges: boolean;
  recordSortField: string;
  recordSortOrder: "asc" | "desc";
  setRecordSearchQuery: (query: string) => void;
  setSelectedFormFilter: (formId: string) => void;
  setRecordsPerPage: (count: number) => void;
  setCurrentPage: (page: number) => void;
  setSelectedRecords: (records: Set<string>) => void;
  setRecordSortField: (field: string) => void;
  setRecordSortOrder: (order: "asc" | "desc") => void;
  getFieldIcon: (fieldType: string) => any;
  renderEditableCell: (
    record: EnhancedFormRecord,
    field: FormFieldWithSection,
    originalValue: string
  ) => JSX.Element;
  getEditModeInfo: () => {
    icon: any;
    label: string;
    description: string;
    color: string;
  };
  toggleEditMode: () => void;
  saveAllPendingChanges: () => Promise<void>;
  discardAllPendingChanges: () => void;
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
  renderEditableCell,
  getEditModeInfo,
  toggleEditMode,
  saveAllPendingChanges,
  discardAllPendingChanges,
}) => {
  const { toast } = useToast();

  // Extract unique field definitions from the actual data
  const getUniqueFieldDefinitions = () => {
    const fieldMap = new Map();

    formRecords.forEach((record) => {
      record.processedData.forEach((fieldData) => {
        const key = fieldData.fieldId;
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
          });
        }
      });
    });

    return Array.from(fieldMap.values()).sort((a, b) => {
      // First sort by form ID, then by order
      if (a.formId !== b.formId) {
        return a.formId.localeCompare(b.formId);
      }
      return a.order - b.order;
    });
  };

  const computeMergedRecords = (): EnhancedFormRecord[] => {
    console.log("Original formRecords:", formRecords);

    const recordsByForm = new Map<string, EnhancedFormRecord[]>();
    for (const record of formRecords) {
      if (!recordsByForm.has(record.formId)) {
        recordsByForm.set(record.formId, []);
      }
      recordsByForm.get(record.formId)!.push(record);
    }

    for (const records of recordsByForm.values()) {
      records.sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      );
    }

    let maxRows = 0;
    for (const records of recordsByForm.values()) {
      maxRows = Math.max(maxRows, records.length);
    }

    const mergedRecordsList: EnhancedFormRecord[] = [];
    for (let i = 0; i < maxRows; i++) {
      const mergedRecord: EnhancedFormRecord = {
        id: `merged-${i}`,
        formId: "merged",
        formName: "Merged",
        recordData: {},
        submittedAt: "",
        status: "submitted",
        processedData: [],
      };

      let latestSubmittedAt = 0;
      let latestStatus: EnhancedFormRecord["status"] = "submitted";
      const combinedProcessedData: ProcessedFieldData[] = [];
      const combinedRecordData: Record<string, any> = {};

      for (const [formId, records] of recordsByForm.entries()) {
        if (i < records.length) {
          const rec = records[i];
          const updatedProcessedData = rec.processedData.map((pd) => ({
            ...pd,
            formId: rec.formId,
          }));
          combinedProcessedData.push(...updatedProcessedData);
          Object.assign(combinedRecordData, rec.recordData);
          const subTime = new Date(rec.submittedAt).getTime();
          if (subTime > latestSubmittedAt) {
            latestSubmittedAt = subTime;
            mergedRecord.submittedAt = rec.submittedAt;
            latestStatus = rec.status;
          }
        }
      }

      mergedRecord.processedData = combinedProcessedData;
      mergedRecord.recordData = combinedRecordData;
      mergedRecord.status = latestStatus;

      if (latestSubmittedAt > 0) {
        mergedRecordsList.push(mergedRecord);
      }
    }

    console.log("Merged records:", mergedRecordsList);
    return mergedRecordsList;
  };

  const sortRecords = (records: EnhancedFormRecord[]): EnhancedFormRecord[] => {
    return [...records].sort((a, b) => {
      let valA: any, valB: any;
      if (recordSortField === "submittedAt") {
        valA = new Date(a.submittedAt).getTime();
        valB = new Date(b.submittedAt).getTime();
      } else if (recordSortField === "status") {
        valA = a.status;
        valB = b.status;
      } else {
        // Look for field value in processedData
        const fieldDataA = a.processedData.find(
          (pd) => pd.fieldId === recordSortField
        );
        const fieldDataB = b.processedData.find(
          (pd) => pd.fieldId === recordSortField
        );
        valA = fieldDataA?.displayValue || fieldDataA?.value || "";
        valB = fieldDataB?.displayValue || fieldDataB?.value || "";
      }
      if (valA < valB) return recordSortOrder === "asc" ? -1 : 1;
      if (valA > valB) return recordSortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const mergedRecords = computeMergedRecords();
  const sortedRecords = sortRecords(mergedRecords);
  const uniqueFieldDefs = getUniqueFieldDefinitions();

  let filteredRecords = sortedRecords;
  if (selectedFormFilter !== "all") {
    filteredRecords = filteredRecords.filter((record) =>
      record.processedData.some((pd) => pd.formId === selectedFormFilter)
    );
  }
  if (recordSearchQuery) {
    const lowerQuery = recordSearchQuery.toLowerCase();
    filteredRecords = filteredRecords.filter((record) =>
      record.processedData.some((pd) =>
        (pd.displayValue ?? "").toString().toLowerCase().includes(lowerQuery)
      )
    );
  }

  const totalRecords = filteredRecords.length;
  const startIdx = (currentPage - 1) * recordsPerPage;
  const endIdx = currentPage * recordsPerPage;
  const paginatedRecords = filteredRecords.slice(startIdx, endIdx);

  const editModeInfo = getEditModeInfo();

  return (
    <Card className="border-gray-300 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Merged Records
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
                value={selectedFormFilter}
                onValueChange={setSelectedFormFilter}
              >
                <SelectTrigger className="w-[180px]">
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
            
          </div>

          {/* Pagination Controls */}
          {totalRecords > recordsPerPage && (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
              <div className="text-sm text-gray-600">
                Showing {startIdx + 1} to {Math.min(endIdx, totalRecords)} of{" "}
                {totalRecords} entries
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
                  Page {currentPage} of{" "}
                  {Math.ceil(totalRecords / recordsPerPage)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        Math.ceil(totalRecords / recordsPerPage),
                        currentPage + 1
                      )
                    )
                  }
                  disabled={
                    currentPage >= Math.ceil(totalRecords / recordsPerPage)
                  }
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
                        checked={
                          selectedRecords.size === paginatedRecords.length &&
                          paginatedRecords.length > 0
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRecords(
                              new Set(paginatedRecords.map((r) => r.id))
                            );
                          } else {
                            setSelectedRecords(new Set());
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
                          setRecordSortOrder(
                            recordSortOrder === "asc" ? "desc" : "asc"
                          );
                        } else {
                          setRecordSortField("submittedAt");
                          setRecordSortOrder("asc");
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
                          setRecordSortOrder(
                            recordSortOrder === "asc" ? "desc" : "asc"
                          );
                        } else {
                          setRecordSortField("status");
                          setRecordSortOrder("asc");
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
                            setRecordSortOrder(
                              recordSortOrder === "asc" ? "desc" : "asc"
                            );
                          } else {
                            setRecordSortField(field.id);
                            setRecordSortOrder("asc");
                          }
                        }}
                      >
                        <div className="flex flex-col items-center gap-0.5 truncate w-full">
                          <div className="text-[8px] sm:text-[9px] text-blue-600 font-normal truncate w-full text-center">
                            {field.formName}
                          </div>
                          <div className="flex items-center gap-1 truncate w-full justify-center">
                            {React.createElement(getFieldIcon(field.type), {
                              className:
                                "h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0",
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
                  {paginatedRecords.map((record, rowIndex) => (
                    <div
                      key={record.id}
                      className="flex hover:bg-blue-50 min-w-max"
                    >
                      <div className="w-10 h-7 border-r border-b border-gray-300 bg-white flex items-center justify-center">
                        <Checkbox
                          checked={selectedRecords.has(record.id)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedRecords);
                            if (checked) {
                              newSelected.add(record.id);
                            } else {
                              newSelected.delete(record.id);
                            }
                            setSelectedRecords(newSelected);
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
                            <Button
                              variant="ghost"
                              className="h-5 w-5 p-0 hover:bg-gray-100"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-xs">
                              Actions
                            </DropdownMenuLabel>
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
                        <span className="hidden sm:inline">
                          {new Date(record.submittedAt).toLocaleDateString()}
                        </span>
                        <span className="sm:hidden">
                          {new Date(record.submittedAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>
                      <div className="w-20 sm:w-24 h-7 border-r border-b border-gray-300 bg-white flex items-center justify-center px-1">
                        <Badge
                          variant="outline"
                          className="text-[9px] sm:text-xs px-1 py-0 h-4 border"
                        >
                          <span className="hidden sm:inline">
                            {record.status || "submitted"}
                          </span>
                          <span className="sm:hidden">
                            {(record.status || "submitted")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </Badge>
                      </div>
                      {uniqueFieldDefs.map((fieldDef) => {
                        // Find the matching field data in this record's processedData
                        const fieldData = record.processedData.find(
                          (pd) => pd.fieldId === fieldDef.id
                        );

                        const displayValue =
                          fieldData?.displayValue || fieldData?.value || "";

                        return (
                          <div
                            key={`${record.id}-${fieldDef.id}`}
                            className="w-32 sm:w-40 h-7 border-r border-b border-gray-300 bg-white flex items-center justify-start px-2 text-[10px] sm:text-xs"
                            title={`${fieldDef.label}: ${displayValue}`}
                          >
                            <span className="truncate">
                              {displayValue || "—"}
                            </span>
                          </div>
                        );
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
  );
};

export default RecordsDisplay;
