"use client"

import type React from "react"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  ChevronUp,
  Plus,
  Check,
  X,
  Edit3,
  Layers,
  AlertTriangle,
} from "lucide-react"
import FieldComponent from "./field-component"
import type { FormField } from "@/types/form-builder"
import { useToast } from "@/hooks/use-toast"

interface Subform {
  id: string
  sectionId: string
  name: string
  order: number
  fields: FormField[]
  collapsed?: boolean
  createdAt: Date
  updatedAt: Date
}

interface SubformComponentProps {
  subform: Subform
  onUpdateSubform: (updates: Partial<Subform>) => void
  onDeleteSubform: () => void
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => Promise<void>
  onDeleteField: (fieldId: string) => void
  isOverlay?: boolean
}

export default function SubformComponent({
  subform,
  onUpdateSubform,
  onDeleteSubform,
  onUpdateField,
  onDeleteField,
  isOverlay = false,
}: SubformComponentProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(subform.name)
  const { toast } = useToast()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subform.id,
    data: {
      type: "Subform",
      subform,
    },
    disabled: isOverlay || isEditingName,
  })

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `subform-${subform.id}`,
    data: {
      type: "Subform",
      isSubformDropzone: true,
      subform,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

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

  const handleDeleteSubform = () => {
    setShowDeleteDialog(false)
    onDeleteSubform()
    toast({
      title: "Subform deleted",
      description: `"${subform.name}" and all its fields have been removed`,
    })
  }

  const addField = async (fieldType: string) => {
    try {
      const newFieldData = {
        sectionId: subform.sectionId,
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

      if (!response.ok) throw new Error("Failed to create field")

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

  if (isOverlay) {
    return (
      <Card className="border-2 border-purple-500 shadow-2xl bg-purple-50 rotate-2 scale-105">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">{subform.name}</h3>
            <Badge variant="secondary" className="text-xs bg-purple-200 text-purple-800">
              {subform.fields.length} field{subform.fields.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-purple-600">Moving subform...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card
        ref={(node) => {
          setNodeRef(node)
          setDroppableRef(node)
        }}
        style={style}
        className={`group transition-all duration-300 border-2 ${
          isDragging
            ? "shadow-2xl scale-105 rotate-1 border-purple-400 bg-purple-50 z-50"
            : "hover:shadow-lg border-purple-200 bg-purple-50/30"
        } ${isOver ? "ring-2 ring-purple-300 ring-opacity-50" : ""}`}
      >
        <CardHeader className="pb-3 bg-purple-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Drag Handle */}
              {!isEditingName && (
                <div
                  {...attributes}
                  {...listeners}
                  className={`cursor-grab hover:cursor-grabbing p-1 rounded transition-all duration-200 ${
                    isDragging
                      ? "bg-purple-500 text-white"
                      : "hover:bg-purple-200 text-purple-400 hover:text-purple-600 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <GripVertical className="w-4 h-4" />
                </div>
              )}

              <Layers className="w-4 h-4 text-purple-600" />

              <div className="flex-1">
                {/* Editable Name */}
                <div className="flex items-center gap-2 mb-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={handleNameKeyDown}
                        onBlur={handleNameSave}
                        className="text-lg font-semibold h-8 px-2 py-1 border-2 border-purple-300 focus:border-purple-500"
                        placeholder="Subform name"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
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
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
                    <div className="flex items-center gap-2 flex-1">
                      <h3
                        className="text-lg font-semibold cursor-pointer hover:text-purple-600 transition-colors duration-200 px-2 py-1 rounded hover:bg-purple-100 flex items-center gap-1"
                        onClick={() => setIsEditingName(true)}
                        title="Click to edit subform name"
                      >
                        {subform.name}
                        <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                      </h3>
                      <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                        {subform.fields.length} field{subform.fields.length !== 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-purple-200 text-purple-800">
                        Subform
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subform Actions */}
            {!isEditingName && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateSubform({ collapsed: !subform.collapsed })}
                  className="h-8 w-8 p-0"
                >
                  {subform.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
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
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Subform
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>

        {!subform.collapsed && (
          <CardContent className="pt-0">
            {subform.fields.length > 0 ? (
              <SortableContext items={subform.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {subform.fields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <div key={field.id} className="border-l-4 border-purple-300 pl-4">
                        <FieldComponent
                          field={field}
                          onUpdate={async (updates: Partial<FormField>) => {
                            await onUpdateField(field.id, updates)
                          }}
                          onDelete={() => onDeleteField(field.id)}
                        />
                      </div>
                    ))}
                </div>
              </SortableContext>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                  isOver ? "border-purple-400 bg-purple-100" : "border-purple-300 bg-purple-50"
                }`}
              >
                <Layers className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <p className="text-sm text-purple-600 mb-3">No fields in this subform yet</p>
                <p className="text-xs text-purple-500 mb-4">Drag fields here to add them to this subform</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addField("text")}
                  className="border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete Subform
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete the subform <strong>"{subform.name}"</strong>?
              </p>
              {subform.fields.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 font-medium">This will permanently delete:</p>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                    <li>The subform and all its settings</li>
                    <li>
                      All {subform.fields.length} field{subform.fields.length !== 1 ? "s" : ""} in this subform
                    </li>
                    <li>All form record data for these fields</li>
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
