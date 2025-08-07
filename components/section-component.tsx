"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GripVertical, MoreHorizontal, Settings, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Plus, Check, X, Edit3, Loader2, AlertTriangle, Layers } from 'lucide-react';
import FieldComponent from "./field-component";
import SubformComponent from "./subform-component";
import SectionSettings from "./section-settings";
import type { FormSection, FormField, Subform } from "@/types/form-builder";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

interface SectionComponentProps {
  section: FormSection;
  onUpdateSection: (updates: Partial<FormSection>) => void;
  onDeleteSection: () => Promise<void>;
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => Promise<void>;
  onDeleteField: (fieldId: string) => void;
  onAddSubform: (subformData: Partial<Subform>) => Promise<void>;
  onUpdateSubform: (subformId: string, updates: Partial<Subform>) => Promise<void>;
  onDeleteSubform: (subformId: string) => void;
  isOverlay?: boolean;
  isDeleting?: boolean;
}

export default function SectionComponent({
  section,
  onUpdateSection,
  onDeleteSection,
  onUpdateField,
  onDeleteField,
  onAddSubform,
  onUpdateSubform,
  onDeleteSubform,
  isOverlay = false,
  isDeleting = false,
}: SectionComponentProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    data: {
      type: "Section",
      section,
    },
    disabled: isOverlay || isEditingTitle || isDeleting,
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `section-dropzone-${section.id}`,
    data: {
      type: "Section",
      isSectionDropzone: true,
      sectionId: section.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : isDeleting ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1,
    pointerEvents: isDeleting ? ("none" as const) : ("auto" as const),
  };

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    setEditTitle(section.title);
  }, [section.title]);

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOverlay && !isDragging && !isDeleting) {
      setIsEditingTitle(true);
    }
  };

  const handleTitleSave = () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== section.title) {
      onUpdateSection({ title: trimmedTitle });
    } else {
      setEditTitle(section.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(section.title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleTitleCancel();
    }
  };

  const handleTitleBlur = () => {
    handleTitleSave();
  };

  const handleDeleteSection = async () => {
    if (isDeleting) return;
    try {
      setShowDeleteDialog(false);
      toast({
        title: "Deleting section...",
        description: `Removing "${section.title}" and cleaning up all associated data`,
      });
      await onDeleteSection();
      toast({
        title: "Section deleted",
        description: `"${section.title}" and all associated data have been successfully removed`,
      });
    } catch (error: any) {
      console.error("Error deleting section:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  const addField = async (fieldType: string) => {
    try {
      const newFieldData = {
        sectionId: section.id,
        type: fieldType,
        label: `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}`,
        placeholder: "",
        description: "",
        defaultValue: "",
        options: [],
        validation: {},
        visible: true,
        readonly: false,
        width: "full" as const,
        order: section.fields.length,
      };

      const response = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFieldData),
      });

      if (!response.ok) throw new Error("Failed to create field");

      const result = await response.json();
      if (result.success) {
        const newField: FormField = {
          ...result.data,
          conditional: null,
          styling: null,
          properties: null,
          rollup: null,
          lookup: null,
          formula: null,
          options: [],
          validation: {},
        };

        onUpdateSection({ fields: [...section.fields, newField] });
        toast({ title: "Success", description: "Field added successfully" });
      } else {
        throw new Error(result.error || "Failed to create field");
      }
    } catch (error: any) {
      console.error("Error adding field:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addSubform = async () => {
    try {
      const newSubformData = {
        sectionId: section.id,
        name: `New Subform ${section.subforms.length + 1}`,
        order: section.subforms.length,
        columns: 1,
        visible: true,
        collapsible: true,
        collapsed: false,
      };

      await onAddSubform(newSubformData);
    } catch (error: any) {
      console.error("Error adding subform:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addNestedSubform = async (parentSubformId: string) => {
    try {
      const response = await fetch("/api/subforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentSubformId,
          name: `New Nested Subform`,
          order: 0,
          columns: 1,
          visible: true,
          collapsible: true,
          collapsed: false,
        }),
      });

      if (!response.ok) throw new Error("Failed to create nested subform");

      const result = await response.json();
      if (result.success) {
        // Refresh the section to get updated nested structure
        window.location.reload(); // Temporary solution - in production, you'd want to update state properly
        toast({ title: "Success", description: "Nested subform added successfully" });
      } else {
        throw new Error(result.error || "Failed to create nested subform");
      }
    } catch (error: any) {
      console.error("Error adding nested subform:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const duplicateField = (field: FormField) => {
    const duplicatedField: FormField = {
      ...field,
      id: `field_${uuidv4()}`,
      label: `${field.label} (Copy)`,
      order: section.fields.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onUpdateSection({
      fields: [...section.fields, duplicatedField],
    });
  };

  const getColumnClass = () => {
    switch (section.columns) {
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      default:
        return "grid-cols-1";
    }
  };

  // Helper function to count total nested items
  const countNestedItems = (subforms: Subform[]): { fields: number, subforms: number } => {
    let totalFields = 0;
    let totalSubforms = subforms.length;

    subforms.forEach(subform => {
      totalFields += subform.fields.length;
      if (subform.childSubforms) {
        const nested = countNestedItems(subform.childSubforms);
        totalFields += nested.fields;
        totalSubforms += nested.subforms;
      }
    });

    return { fields: totalFields, subforms: totalSubforms };
  };

  const nestedCounts = countNestedItems(section.subforms);

  if (!section.visible) {
    return (
      <Card className="border-dashed border-gray-300 opacity-50">
        <CardContent className="p-4 text-center">
          <EyeOff className="w-4 h-4 mx-auto mb-1 text-gray-400" />
          <p className="text-xs text-gray-500">Hidden Section: {section.title}</p>
        </CardContent>
      </Card>
    );
  }

  if (isOverlay) {
    return (
      <Card className="border-2 border-blue-500 shadow-2xl bg-blue-50 rotate-3 scale-105">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">{section.title}</h3>
            <Badge variant="secondary" className="text-xs bg-blue-200 text-blue-800">
              {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="secondary" className="text-xs bg-blue-200 text-blue-800">
              {nestedCounts.subforms} subform{nestedCounts.subforms !== 1 ? "s" : ""}
            </Badge>
          </div>
          {section.description && <p className="text-sm text-blue-700">{section.description}</p>}
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-600">Moving section...</div>
        </CardContent>
      </Card>
    );
  }

  if (isDeleting) {
    return (
      <Card className="border-2 border-red-200 bg-red-50 opacity-50 pointer-events-none">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Deleting "{section.title}"...</span>
          </div>
          <p className="text-sm text-red-500 mt-2">
            Removing section, {section.fields.length + nestedCounts.fields} field{section.fields.length + nestedCounts.fields !== 1 ? "s" : ""}, 
            {nestedCounts.subforms} subform{nestedCounts.subforms !== 1 ? "s" : ""}, and cleaning up all record data
          </p>
        </CardContent>
      </Card>
    );
  }

  // Combine fields and subforms for rendering
  const allItems = [
    ...section.fields.map(field => ({ type: 'field' as const, item: field, id: field.id, order: field.order })),
    ...section.subforms.map(subform => ({ type: 'subform' as const, item: subform, id: subform.id, order: subform.order }))
  ].sort((a, b) => a.order - b.order);

  return (
    <>
      <Card
        ref={(node) => {
          setNodeRef(node);
          setDroppableRef(node);
        }}
        style={style}
        className={`group transition-all duration-300 ${
          isDragging
            ? "shadow-2xl scale-105 rotate-2 border-2 border-blue-400 bg-blue-50 z-50"
            : "hover:shadow-lg border-gray-200"
        } ${isOver ? "ring-2 ring-blue-300 ring-opacity-50" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {!isEditingTitle && (
                <div
                  {...attributes}
                  {...listeners}
                  className={`cursor-grab hover:cursor-grabbing p-1 rounded transition-all duration-200 ${
                    isDragging
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <GripVertical className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        ref={inputRef}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        onBlur={handleTitleBlur}
                        className="text-lg font-semibold h-8 px-2 py-1 border-2 border-blue-300 focus:border-blue-500"
                        placeholder="Section title"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTitleSave();
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTitleCancel();
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <h3
                        className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors duration-200 px-2 py-1 rounded hover:bg-blue-50 flex items-center gap-1"
                        onClick={handleTitleClick}
                        title="Click to edit title"
                      >
                        {section.title}
                        <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {nestedCounts.subforms} subform{nestedCounts.subforms !== 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {section.columns} col{section.columns !== 1 ? "s" : ""}
                      </Badge>
                      {nestedCounts.fields > 0 && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                          {nestedCounts.fields} nested field{nestedCounts.fields !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                {section.description && !isEditingTitle && (
                  <p className="text-sm text-gray-600 ml-2">{section.description}</p>
                )}
              </div>
            </div>
            {!isEditingTitle && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {section.collapsible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateSection({ collapsed: !section.collapsed })}
                    className="h-8 w-8 p-0"
                  >
                    {section.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setShowSettings(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Section Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onUpdateSection({ visible: !section.visible })}>
                      {section.visible ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {section.visible ? "Hide" : "Show"} Section
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateSection({ collapsible: !section.collapsible })}>
                      <Plus className="w-4 h-4 mr-2" />
                      {section.collapsible ? "Disable" : "Enable"} Collapsible
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => addField("text")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Text Field
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addSubform()}>
                      <Layers className="w-4 h-4 mr-2" />
                      Add Subform
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Section
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>

        {(!section.collapsible || !section.collapsed) && (
          <CardContent className="pt-0">
            {allItems.length > 0 ? (
              <>
                <SortableContext 
                  items={allItems.map(item => item.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className={`grid gap-4 ${getColumnClass()}`}>
                    {allItems.map((item) => (
                      item.type === 'field' ? (
                        <FieldComponent
                          key={item.id}
                          field={item.item as FormField}
                          onUpdate={(updates) => onUpdateField(item.id, updates)}
                          onDelete={() => onDeleteField(item.id)}
                          onCopy={() => duplicateField(item.item as FormField)}
                        />
                      ) : (
                        <div key={item.id} className="relative">
                          <SubformComponent
                            subform={item.item as Subform}
                            onUpdateSubform={(updates) => onUpdateSubform(item.id, updates)}
                            onDeleteSubform={() => onDeleteSubform(item.id)}
                            onUpdateField={onUpdateField}
                            onDeleteField={onDeleteField}
                            maxNestingLevel={5}
                          />
                        </div>
                      )
                    ))}
                  </div>
                </SortableContext>
              </>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  isOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"
                }`}
              >
                <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 mb-4">No fields or subforms in this section yet</p>
                <p className="text-xs text-gray-400">Drag fields or subforms from the palette or drop them here to get started</p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button variant="outline" size="sm" onClick={() => addField("text")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSubform()}>
                    <Layers className="w-4 h-4 mr-2" />
                    Add Subform
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete Section
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete the section <strong>"{section.title}"</strong>?
              </p>
              {(section.fields.length > 0 || nestedCounts.subforms > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 font-medium">This will permanently delete:</p>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                    <li>The section and all its settings</li>
                    {section.fields.length > 0 && (
                      <li>
                        All {section.fields.length} direct field{section.fields.length !== 1 ? "s" : ""} in this section
                      </li>
                    )}
                    {nestedCounts.subforms > 0 && (
                      <li>
                        All {nestedCounts.subforms} subform{nestedCounts.subforms !== 1 ? "s" : ""} (including nested ones)
                      </li>
                    )}
                    {nestedCounts.fields > 0 && (
                      <li>
                        All {nestedCounts.fields} field{nestedCounts.fields !== 1 ? "s" : ""} within subforms
                      </li>
                    )}
                    <li>All form record data for these fields and subforms</li>
                    <li>Any lookup relations involving these fields</li>
                  </ul>
                </div>
              )}
              <p className="text-sm font-medium text-red-800">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Section
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showSettings && (
        <SectionSettings
          section={section}
          open={showSettings}
          onOpenChange={setShowSettings}
          onUpdate={onUpdateSection}
        />
      )}
    </>
  );
}
