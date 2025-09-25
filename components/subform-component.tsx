"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  GripVertical,
  MoreHorizontal,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plus,
  Check,
  X,
  Edit3,
  Layers,
  AlertTriangle,
} from "lucide-react"
import FieldComponent from "./field-component"
import type { FormField, Subform } from "@/types/form-builder"
import { useToast } from "@/hooks/use-toast"

interface SubformComponentProps {
  subform: Subform
  onUpdateSubform: (updates: Partial<Subform>) => void
  onDeleteSubform: () => void
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => Promise<void>
  onDeleteField: (fieldId: string) => void
  isOverlay?: boolean
  maxNestingLevel?: number
}

// Enhanced color schemes for better nesting visualization
const NESTING_COLORS = [
  {
    bg: "bg-purple-50/80",
    border: "border-purple-300",
    accent: "text-purple-700",
    hover: "hover:bg-purple-100",
    headerBg: "bg-purple-100/50",
    shadow: "shadow-purple-100",
  },
  {
    bg: "bg-blue-50/80",
    border: "border-blue-300",
    accent: "text-blue-700",
    hover: "hover:bg-blue-100",
    headerBg: "bg-blue-100/50",
    shadow: "shadow-blue-100",
  },
  {
    bg: "bg-green-50/80",
    border: "border-green-300",
    accent: "text-green-700",
    hover: "hover:bg-green-100",
    headerBg: "bg-green-100/50",
    shadow: "shadow-green-100",
  },
  {
    bg: "bg-orange-50/80",
    border: "border-orange-300",
    accent: "text-orange-700",
    hover: "hover:bg-orange-100",
    headerBg: "bg-orange-100/50",
    shadow: "shadow-orange-100",
  },
  {
    bg: "bg-pink-50/80",
    border: "border-pink-300",
    accent: "text-pink-700",
    hover: "hover:bg-pink-100",
    headerBg: "bg-pink-100/50",
    shadow: "shadow-pink-100",
  },
]

export default function SubformComponent({
  subform,
  onUpdateSubform,
  onDeleteSubform,
  onUpdateField,
  onDeleteField,
  isOverlay = false,
  maxNestingLevel = 5,
}: SubformComponentProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(subform.name)
  const [isExpanded, setIsExpanded] = useState(!subform.collapsed)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const level = subform.level || 0
  const colorScheme = NESTING_COLORS[level % NESTING_COLORS.length]
  const canNestDeeper = level < maxNestingLevel

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subform.id,
    data: {
      type: "Subform",
      subform,
      level,
    },
    disabled: isOverlay || isEditingName,
  })

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `subform-${subform.id}`,
    data: {
      type: "Subform",
      isSubformDropzone: true,
      subform,
      level,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditingName])

  useEffect(() => {
    setEditName(subform.name)
  }, [subform.name])

  useEffect(() => {
    setIsExpanded(!subform.collapsed)
  }, [subform.collapsed])

  const handleNameSave = () => {
    const trimmedName = editName.trim()
    if (trimmedName && trimmedName !== subform.name) {
      onUpdateSubform({ name: trimmedName })
    } else {
      setEditName(subform.name)
    }
    setIsEditingName(false)
  }

  const handleNameCancel = () => {
    setEditName(subform.name)
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "Enter") {
      e.preventDefault()
      handleNameSave()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleNameCancel()
    }
  }

  const handleToggleExpanded = () => {
    const newCollapsed = !subform.collapsed
    setIsExpanded(!newCollapsed)
    onUpdateSubform({ collapsed: newCollapsed })
  }

  const handleDeleteSubform = () => {
    setShowDeleteDialog(false)
    onDeleteSubform()
    toast({
      title: "Subform deleted",
      description: `"${subform.name}" and all nested content have been removed`,
    })
  }

  const addField = async (fieldType: string) => {
    try {
      const newFieldData = {
        subformId: subform.id,
        type: fieldType,
        label: `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}`,
        placeholder: "",
        description: "",
        defaultValue: "",
        options: [],
        validation: {},
        visible: true,
        readonly: false,
        width: "full",
        order: subform.fields.length,
      }

      const response = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFieldData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create field: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      if (result.success) {
        const newField: FormField = {
          ...result.data,
          conditional: null,
          styling: null,
          properties: null,
          rollup: null,
          lookup: null,
          formula: null,
        }

        onUpdateSubform({
          fields: [...subform.fields, newField],
        })
        toast({ title: "Success", description: "Field added to subform successfully" })
      } else {
        throw new Error(result.error || "Failed to create field")
      }
    } catch (error: any) {
      console.error("Error adding field to subform:", error)
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const addNestedSubform = async () => {
    if (!canNestDeeper) {
      toast({
        title: "Maximum nesting reached",
        description: `Cannot nest deeper than ${maxNestingLevel} levels`,
        variant: "destructive",
      })
      return
    }

    try {
      const currentChildCount = subform.childSubforms?.length || 0

      const subformData = {
        parentSubformId: subform.id,
        name: `Nested Subform ${currentChildCount + 1}`,
        description: "",
        order: currentChildCount,
        columns: 1,
        visible: true,
        collapsible: true,
        collapsed: false,
      }

      const response = await fetch("/api/subforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subformData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create nested subform: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      if (result.success) {
        const newSubform: Subform = {
          ...result.data,
          fields: [],
          childSubforms: [],
        }

        const updatedChildSubforms = [...(subform.childSubforms || []), newSubform]
        onUpdateSubform({
          childSubforms: updatedChildSubforms,
        })

        toast({ title: "Success", description: "Nested subform added successfully" })
      } else {
        throw new Error(result.error || "Failed to create nested subform")
      }
    } catch (error: any) {
      console.error("Error adding nested subform:", error)
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  if (isOverlay) {
    return (
      <Card className={`border-2 shadow-2xl rotate-2 scale-105 ${colorScheme.border} ${colorScheme.bg}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Layers className={`w-4 h-4 ${colorScheme.accent}`} />
            <h3 className={`text-lg font-semibold ${colorScheme.accent}`}>{subform.name}</h3>
            <Badge variant="secondary" className={`text-xs ${colorScheme.bg} ${colorScheme.accent}`}>
              Level {level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-sm ${colorScheme.accent}`}>Moving nested subform...</div>
        </CardContent>
      </Card>
    )
  }

  // FIXED: Combine fields and child subforms for rendering with proper filtering to prevent duplicates
  const allItems = [
    ...subform.fields.map((field) => ({ type: "field" as const, item: field, id: field.id, order: field.order })),
    // Fixed duplicate rendering by filtering only direct children
    ...(subform.childSubforms || [])
      .filter((childSubform: Subform) => childSubform.parentSubformId === subform.id)
      .map((childSubform: Subform) => ({
        type: "subform" as const,
        item: childSubform,
        id: childSubform.id,
        order: childSubform.order,
      })),
  ].sort((a, b) => a.order - b.order)

  return (
    <>
      <Card
        ref={(node) => {
          setNodeRef(node)
          setDroppableRef(node)
        }}
        style={style}
        className={`group transition-all duration-300 border-2 ${colorScheme.shadow} ${
          isDragging
            ? `shadow-2xl scale-105 rotate-1 ${colorScheme.border} ${colorScheme.bg} z-50`
            : `hover:shadow-lg ${colorScheme.border} ${colorScheme.bg}`
        } ${isOver ? `ring-2 ring-opacity-50 ${colorScheme.border.replace("border-", "ring-")}` : ""}`}
      >
        {/* Subform Header */}
        <CardHeader className={`pb-2 ${colorScheme.headerBg} border-b ${colorScheme.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Nesting Level Indicator */}
              {level > 0 && (
                <div className="flex items-center flex-shrink-0">
                  {Array.from({ length: level }).map((_, i) => (
                    <div key={i} className={`w-1 h-4 ${colorScheme.border} bg-current opacity-30 mr-1`} />
                  ))}
                </div>
              )}

              {/* Drag Handle */}
              {!isEditingName && (
                <div
                  {...attributes}
                  {...listeners}
                  className={`cursor-grab hover:cursor-grabbing p-1 rounded transition-all duration-200 flex-shrink-0 ${
                    isDragging
                      ? `${colorScheme.accent} bg-white`
                      : `${colorScheme.hover} ${colorScheme.accent} opacity-0 group-hover:opacity-100`
                  }`}
                >
                  <GripVertical className="w-4 h-4" />
                </div>
              )}

              {/* Expand/Collapse Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpanded}
                className={`h-6 w-6 p-0 flex-shrink-0 ${colorScheme.hover}`}
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </Button>

              <Layers className={`w-4 h-4 ${colorScheme.accent} flex-shrink-0`} />

              {/* Editable Name */}
              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      ref={inputRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={handleNameKeyDown}
                      onBlur={handleNameSave}
                      className={`text-sm font-semibold h-6 px-2 py-1 border ${colorScheme.border} focus:${colorScheme.border.replace("border-", "border-")} flex-1`}
                      placeholder="Subform name"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNameSave()
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNameCancel()
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 min-w-0">
                    <h4
                      className={`text-sm font-semibold cursor-pointer ${colorScheme.hover} transition-colors duration-200 px-2 py-1 rounded flex items-center gap-1 truncate`}
                      onClick={() => setIsEditingName(true)}
                      title={`Click to edit: ${subform.name}`}
                    >
                      <span className="truncate">{subform.name}</span>
                      <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
                    </h4>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Badge variant="outline" className={`text-xs ${colorScheme.border} ${colorScheme.accent} px-1 py-0`}>
                  L{level}
                </Badge>
                <Badge variant="outline" className={`text-xs ${colorScheme.border} ${colorScheme.accent} px-1 py-0`}>
                  {subform.fields.length}F
                </Badge>
                {(subform.childSubforms?.length || 0) > 0 && (
                  <Badge variant="outline" className={`text-xs ${colorScheme.border} ${colorScheme.accent} px-1 py-0`}>
                    {subform.childSubforms?.length}S
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            {!isEditingName && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => addField("text")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Text Field
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addField("select")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Select Field
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={addNestedSubform} disabled={!canNestDeeper}>
                      <Layers className="w-4 h-4 mr-2" />
                      Add Nested Subform
                      {!canNestDeeper && <span className="text-xs text-gray-400 ml-1">(Max)</span>}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Description */}
          {subform.description && !isEditingName && isExpanded && (
            <p className={`text-xs ml-6 ${colorScheme.accent} opacity-75 mt-1`}>{subform.description}</p>
          )}
        </CardHeader>

        {/* Subform Content */}
        {isExpanded && (
          <CardContent className="p-3">
            <div className="space-y-2">
              {allItems.length > 0 ? (
                <ScrollArea className="max-h-96 w-full">
                  <SortableContext items={allItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 pr-2">
                      {allItems.map((item) =>
                        item.type === "field" ? (
                          <div key={item.id} className="relative">
                            <FieldComponent
                                      field={item.item as FormField}
                                      onUpdate={onUpdateField}
                                      onDelete={onDeleteField}
                                      isOverlay={false} onCopy={function(field: FormField): void {
                                          throw new Error("Function not implemented.")
                                      } }                            />
                          </div>
                        ) : (
                          // Added unique key prefix and improved nesting structure to prevent duplicates
                          <div
                            key={`nested-subform-${item.id}`}
                            className="ml-4 border-l-2 border-dashed border-gray-300 pl-4"
                          >
                            {/* <SubformComponent
                              subform={item.item as Subform}
                              onUpdateSubform={(updates) => {
                                // More precise update logic
                                const updatedChildSubforms = (subform.childSubforms || []).map((child: Subform) =>
                                  child.id === item.id ? { ...child, ...updates } : child,
                                )
                                onUpdateSubform({ childSubforms: updatedChildSubforms })
                              }}
                              onDeleteSubform={() => {
                                // More precise delete logic
                                const updatedChildSubforms = (subform.childSubforms || []).filter(
                                  (child: Subform) => child.id !== item.id,
                                )
                                onUpdateSubform({ childSubforms: updatedChildSubforms })
                              }}
                              onUpdateField={onUpdateField}
                              onDeleteField={onDeleteField}
                              maxNestingLevel={maxNestingLevel}
                            /> */}
                          </div>
                        ),
                      )}
                    </div>
                  </SortableContext>
                </ScrollArea>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
                    isOver ? `${colorScheme.border} ${colorScheme.bg}` : `border-gray-300 bg-gray-50`
                  }`}
                >
                  <Layers className={`w-5 h-5 mx-auto mb-2 ${colorScheme.accent}`} />
                  <p className={`text-xs mb-2 ${colorScheme.accent}`}>Empty subform</p>
                  <p className={`text-xs mb-3 ${colorScheme.accent} opacity-75`}>
                    Drop fields or create nested subforms here
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addField("text")}
                      className={`text-xs h-7 ${colorScheme.border} ${colorScheme.accent} ${colorScheme.hover}`}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Field
                    </Button>
                    {canNestDeeper && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addNestedSubform}
                        className={`text-xs h-7 ${colorScheme.border} ${colorScheme.accent} ${colorScheme.hover}`}
                      >
                        <Layers className="w-3 h-3 mr-1" />
                        Subform
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete Nested Subform
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete the subform <strong>"{subform.name}"</strong>?
              </p>
              {(subform.fields.length > 0 || (subform.childSubforms?.length || 0) > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 font-medium">This will permanently delete:</p>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                    <li>The subform and all its settings</li>
                    {subform.fields.length > 0 && (
                      <li>
                        All {subform.fields.length} field{subform.fields.length !== 1 ? "s" : ""} in this subform
                      </li>
                    )}
                    {(subform.childSubforms?.length || 0) > 0 && (
                      <li>
                        All {subform.childSubforms?.length} nested subform
                        {(subform.childSubforms?.length || 0) !== 1 ? "s" : ""} and their content
                      </li>
                    )}
                    <li>All form record data for these fields and nested subforms</li>
                  </ul>
                </div>
              )}
              <p className="text-sm font-medium text-red-800">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubform} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Delete Subform
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
