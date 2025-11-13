"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronsUpDown,
  Database,
  FileText,
  Zap,
  Loader2,
  Settings,
  CheckSquare,
  Key,
  Layers,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FormField } from "@/types/form-builder";

interface LookupSource {
  id: string;
  name: string;
  type: "form" | "module" | "static";
  description?: string;
  recordCount?: number;
  hasIdField?: boolean;
  idFieldName?: string;
}

interface SourceField {
  name: string;
  label: string;
  type: string;
  description?: string;
}

interface SelectedField {
  fieldName: string;
  label: string;
  displayField: string;
  valueField: string;
  storeField: string;
  multiple: boolean;
  searchable: boolean;
  useIdField: boolean;
}

interface LookupConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lookupFields: Partial<FormField>[]) => void;
  sectionId: string;
  subformId?: string;
}

export default function LookupConfigurationDialog({
  open,
  onOpenChange,
  onConfirm,
  sectionId,
  subformId,
}: LookupConfigurationDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"source" | "fields" | "configure">("source");
  const [sources, setSources] = useState<LookupSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<LookupSource | null>(
    null
  );
  const [sourceFields, setSourceFields] = useState<SourceField[]>([]);
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);

  const resetDialog = useCallback(() => {
    setStep("source");
    setSelectedSource(null);
    setSourceFields([]);
    setSelectedFields([]);
  }, []);

  const loadSources = useCallback(async () => {
    setLoadingSources(true);
    try {
      const response = await fetch("/api/lookup/sources?quick=true");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSources(result.data || []);
        } else {
          throw new Error(result.message || "Failed to load sources");
        }
      } else {
        throw new Error("Failed to fetch sources");
      }
    } catch (error) {
      console.error("Error loading sources:", error);
      toast({
        title: "Error",
        description: "Failed to load lookup sources",
        variant: "destructive",
      });
    } finally {
      setLoadingSources(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) {
      loadSources();
      resetDialog();
    }
  }, [open, loadSources, resetDialog]);

  const loadSourceFields = useCallback(async () => {
    if (!selectedSource) return;

    setLoadingFields(true);
    try {
      const response = await fetch(
        `/api/lookup/fields?sourceId=${selectedSource.id}`
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const fields = result.data || [];
          const formattedFields: SourceField[] = fields.map(
            (label: string) => ({
              name: label,
              label: label,
              type: "text",
              description: `Field from ${selectedSource.name}`,
            })
          );

          setSourceFields(formattedFields);
          setStep("fields");
        } else {
          throw new Error(result.message || "Failed to load fields");
        }
      } else {
        throw new Error("Failed to fetch fields");
      }
    } catch (error) {
      console.error("Error loading fields:", error);
      toast({
        title: "Error",
        description: "Failed to load source fields",
        variant: "destructive",
      });
    } finally {
      setLoadingFields(false);
    }
  }, [selectedSource, toast]);

  useEffect(() => {
    if (selectedSource) {
      loadSourceFields();
    }
  }, [selectedSource, loadSourceFields]);

  const handleSourceSelect = (source: LookupSource) => {
    setSelectedSource(source);
    setSourceOpen(false);
  };

  const handleFieldToggle = (field: SourceField, checked: boolean) => {
    if (checked) {
      const newField: SelectedField = {
        fieldName: field.name,
        label: field.label,
        displayField: field.name,
        valueField: "id",
        storeField: field.name,
        multiple: false,
        searchable: true,
        useIdField: selectedSource?.hasIdField || false,
      };

      setSelectedFields((prev) => [...prev, newField]);
    } else {
      setSelectedFields((prev) =>
        prev.filter((f) => f.fieldName !== field.name)
      );
    }
  };

  const updateSelectedField = (
    fieldName: string,
    updates: Partial<SelectedField>
  ) => {
    setSelectedFields((prev) =>
      prev.map((field) =>
        field.fieldName === fieldName ? { ...field, ...updates } : field
      )
    );
  };

  const handleConfirm = () => {
    if (!selectedSource || selectedFields.length === 0) {
      toast({
        title: "Invalid Selection",
        description: "Please select a source and at least one field",
        variant: "destructive",
      });
      return;
    }

    let sourceModule: string | undefined;
    let sourceForm: string | undefined;

    if (
      selectedSource.type === "module" &&
      selectedSource.id.startsWith("module_")
    ) {
      sourceModule = selectedSource.id.replace("module_", "");
    } else if (
      selectedSource.type === "form" &&
      selectedSource.id.startsWith("form_")
    ) {
      sourceForm = selectedSource.id.replace("form_", "");
    }

    const lookupFields: Partial<FormField>[] = selectedFields.map(
      (field, index) => ({
        sectionId: subformId ? undefined : sectionId,
        subformId: subformId,
        type: "lookup",
        label: field.label,
        placeholder: `Select ${field.label.toLowerCase()}...`,
        description: `Lookup field for ${field.label} from ${
          selectedSource.name
        }${field.useIdField ? " (with ID field for updates)" : ""}${
          subformId ? " in subform" : ""
        }`,
        defaultValue: "",
        options: [],
        validation: { required: false },
        visible: true,
        readonly: false,
        width: "full" as const,
        order: index,
        sourceModule,
        sourceForm,
        displayField: field.displayField,
        valueField: field.valueField,
        multiple: field.multiple,
        searchable: field.searchable,
        lookup: {
          sourceId: selectedSource.id,
          sourceType: selectedSource.type,
          multiple: field.multiple,
          searchable: field.searchable,
          searchPlaceholder: `Search ${field.label.toLowerCase()}...`,
          useIdField: field.useIdField,
          idFieldName: selectedSource.idFieldName,
          fieldMapping: {
            display: field.displayField,
            value: field.valueField,
            store: field.storeField,
            description: "description",
          },
        },
      })
    );

    onConfirm(lookupFields);
    onOpenChange(false);
    resetDialog();

    const locationText = subformId ? "subform" : "section";
    toast({
      title: "Success",
      description: `Created ${
        lookupFields.length
      } lookup field(s) in ${locationText}${
        selectedFields.some((f) => f.useIdField) ? " with ID field support" : ""
      }`,
    });
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "form":
        return <FileText className="h-4 w-4" />;
      case "module":
        return <Database className="h-4 w-4" />;
      case "static":
        return <Zap className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case "form":
        return "Form";
      case "module":
        return "Module";
      case "static":
        return "Built-in";
      default:
        return "Unknown";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure Lookup Fields
            {subformId && (
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-300"
              >
                <Layers className="h-3 w-3 mr-1" />
                For Subform
              </Badge>
            )}
            <Badge variant="secondary" className="h-5 w-24">
              Step {step === "source" ? "1" : step === "fields" ? "2" : "3"} of
              3
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === "source" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-semibold">Select Data Source</h3>
                <p className="text-xs text-muted-foreground">
                  Choose the form, module, or built-in source for your lookup
                  fields
                  {subformId && (
                    <span className="text-purple-600 font-medium">
                      {" "}
                      (will be added to subform)
                    </span>
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Data Source</Label>
                <Popover open={sourceOpen} onOpenChange={setSourceOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={sourceOpen}
                      className="w-full justify-between h-auto py-3 px-4 bg-transparent"
                      disabled={loadingSources}
                    >
                      {selectedSource ? (
                        <div className="flex items-center gap-3 flex-1">
                          {getSourceIcon(selectedSource.type)}
                          <div className="text-left">
                            <div className="font-medium flex items-center gap-2">
                              {selectedSource.name}
                              {selectedSource.hasIdField && (
                                <Badge variant="outline" className="text-xs">
                                  <Key className="h-3 w-3 mr-1" />
                                  ID Field
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedSource.description}
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-auto">
                            {getSourceTypeLabel(selectedSource.type)}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Select data source...
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 h-60" align="start">
                    <Command>
                      <CommandInput
                        className="p-0 h-8"
                        placeholder="Search data sources..."
                      />
                      <CommandList>
                        {loadingSources ? (
                          <CommandEmpty>
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            Loading sources...
                          </CommandEmpty>
                        ) : sources.length === 0 ? (
                          <CommandEmpty>No data sources found.</CommandEmpty>
                        ) : (
                          <>
                            <CommandGroup heading="Forms">
                              {sources
                                .filter((source) => source.type === "form")
                                .map((source) => (
                                  <CommandItem
                                    key={source.id}
                                    value={source.id}
                                    onSelect={() => handleSourceSelect(source)}
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      <FileText className="h-4 w-4" />
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm">
                                            {source.name}
                                          </span>
                                          {source.hasIdField && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              <Key className="h-3 w-3 mr-1" />
                                              {source.idFieldName}
                                            </Badge>
                                          )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                          {source.description}
                                        </span>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                            <CommandGroup heading="Modules">
                              {sources
                                .filter((source) => source.type === "module")
                                .map((source) => (
                                  <CommandItem
                                    key={source.id}
                                    value={source.id}
                                    onSelect={() => handleSourceSelect(source)}
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      <Database className="h-4 w-4" />
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <span>{source.name}</span>
                                          {source.hasIdField && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              <Key className="h-3 w-3 mr-1" />
                                              {source.idFieldName}
                                            </Badge>
                                          )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                          {source.description}
                                        </span>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                            <CommandGroup heading="Built-in Sources">
                              {sources
                                .filter((source) => source.type === "static")
                                .map((source) => (
                                  <CommandItem
                                    key={source.id}
                                    value={source.id}
                                    onSelect={() => handleSourceSelect(source)}
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      <Zap className="h-4 w-4" />
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <span>{source.name}</span>
                                          {source.hasIdField && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              <Key className="h-3 w-3 mr-1" />
                                              ID
                                            </Badge>
                                          )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                          {source.description}
                                        </span>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedSource && (
                <div>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm font-normal">
                      {getSourceIcon(selectedSource.type)}
                      {selectedSource.name}
                      <Badge
                        variant="secondary"
                        className="w-max h-4 px-2 font-normal"
                      >
                        {getSourceTypeLabel(selectedSource.type)}
                      </Badge>
                      {selectedSource.hasIdField && (
                        <Badge variant="outline">
                          <Key className="h-3 w-max px-2 mr-1" />
                          Update Support
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs pt-1 text-muted-foreground">
                      {selectedSource.description}
                      {selectedSource.hasIdField && (
                        <div className="mt-2 text-sm text-blue-600">
                          This source supports record updates using the "
                          {selectedSource.idFieldName}" field
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-end">
                      <Button
                        onClick={() => setStep("fields")}
                        disabled={loadingFields}
                        className="h-8"
                      >
                        {loadingFields ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading Fields...
                          </>
                        ) : (
                          "Continue to Field Selection"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "fields" && selectedSource && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-semibold">Select Fields</h3>
                  <p className="text-xs text-muted-foreground">
                    Choose which fields from {selectedSource.name} to create
                    lookup fields for
                    {subformId && (
                      <span className="text-purple-600 font-medium">
                        {" "}
                        (will be added to subform)
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setStep("source")}
                  className="h-8"
                >
                  Back to Source
                </Button>
              </div>

              <ScrollArea className="h-full max-h-48 border rounded-lg p-3">
                {sourceFields.length === 0 && loadingFields ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading fields...</span>
                  </div>
                ) : sourceFields.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No fields available for this source
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sourceFields.map((field) => {
                      const isSelected = selectedFields.some(
                        (f) => f.fieldName === field.name
                      );
                      return (
                        <div
                          key={field.name}
                          className="flex items-center space-x-3 p-2 border rounded-lg"
                        >
                          <Checkbox
                            id={field.name}
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleFieldToggle(field, checked as boolean)
                            }
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={field.name}
                              className="font-medium cursor-pointer"
                            >
                              {field.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {field.description}
                            </p>
                          </div>
                          <p className="border rounded-md px-4 text-sm">
                            {field.type}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {selectedFields.length > 0 && (
                <div>
                  <div>
                    <div className="flex items-center gap-2 text-sm p-4">
                      <CheckSquare className="h-4 w-4 text-sm" />
                      Selected Fields ({selectedFields.length})
                      {subformId && (
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-300 h-4 w-40"
                        >
                          <Layers className="h-3 w-3 mr-1" />
                          For Subform
                        </Badge>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {selectedFields.map((field) => (
                          <Badge
                            key={field.fieldName}
                            variant="secondary"
                            className="h-4 w-max px-4"
                          >
                            {field.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end w-full">
                    <Button
                      onClick={() => setStep("configure")}
                      className="w-max h-8"
                    >
                      Configure Selected Fields
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "configure" && (
            <div className="space-y-4">
              <ScrollArea className="h-60">
                <div className="space-y-2">
                  {selectedFields.map((field) => (
                    <div key={field.fieldName}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-md flex items-center gap-2">
                            {field.label}
                            {field.useIdField && (
                              <Badge
                                variant="outline"
                                className="text-xs h-4 w-max px-2"
                              >
                                <Key className="h-3 w-3 mr-1" />
                                Update Mode
                              </Badge>
                            )}
                            {subformId && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-purple-50 text-purple-700 border-purple-300"
                              >
                                <Layers className="h-3 w-3 mr-1" />
                                Subform
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Configure lookup behavior for this field
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setStep("fields")}
                          className="h-8 text-sm"
                        >
                          Back to Fields
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label>Display Field</Label>
                            <select
                              className="w-full p-2 border rounded text-sm text-muted-foreground"
                              value={field.displayField}
                              onChange={(e) =>
                                updateSelectedField(field.fieldName, {
                                  displayField: e.target.value,
                                })
                              }
                            >
                              {sourceFields.map((f) => (
                                <option key={f.name} value={f.name}>
                                  {f.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label>Value Field</Label>
                            <select
                              className="w-full p-2 border rounded text-sm text-muted-foreground"
                              value={field.valueField}
                              onChange={(e) =>
                                updateSelectedField(field.fieldName, {
                                  valueField: e.target.value,
                                })
                              }
                            >
                              {sourceFields.map((f) => (
                                <option key={f.name} value={f.name}>
                                  {f.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <Label className="font-normal">
                            Allow Multiple Selection
                          </Label>
                          <Checkbox
                            checked={field.multiple}
                            onCheckedChange={(checked) =>
                              updateSelectedField(field.fieldName, {
                                multiple: checked as boolean,
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="font-normal">Enable Search</Label>
                          <Checkbox
                            checked={field.searchable}
                            onCheckedChange={(checked) =>
                              updateSelectedField(field.fieldName, {
                                searchable: checked as boolean,
                              })
                            }
                          />
                        </div>

                        {selectedSource?.hasIdField && (
                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Use ID Field for Updates</Label>
                                <p className="text-xs text-muted-foreground">
                                  When enabled, records will be updated instead
                                  of creating new ones if the{" "}
                                  {selectedSource.idFieldName} field matches
                                </p>
                              </div>
                              <Checkbox
                                checked={field.useIdField}
                                onCheckedChange={(checked) =>
                                  updateSelectedField(field.fieldName, {
                                    useIdField: checked as boolean,
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-8"
          >
            Cancel
          </Button>
          {step === "configure" && (
            <Button
              onClick={handleConfirm}
              disabled={selectedFields.length === 0}
              className="h-8"
            >
              Create {selectedFields.length} Lookup Field
              {selectedFields.length !== 1 ? "s" : ""}
              {subformId ? " in Subform" : ""}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
