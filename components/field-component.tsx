"use client"
import { useState, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Settings, Trash2, GripVertical, EyeOff, Lock, Star, Copy, Database, Plus } from "lucide-react"
import type { FormField, FieldOption } from "@/types/form-builder"
import { LookupField } from "@/components/lookup-field"
import FieldSettings from "@/components/field-settings"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/hooks/use-toast"

interface FieldComponentProps {
  field: FormField
  isOverlay?: boolean
  isInSubform?: boolean
  onUpdate: (fieldId: string, updates: Partial<FormField>) => Promise<void>
  onDelete: (fieldId: string) => void
  onCopy: (field: FormField) => void
  subformFields?: FormField[]
  onAddField?: (fieldType: string, subformId?: string) => Promise<void>
  onUpdateField?: (fieldId: string, updates: Partial<FormField>) => Promise<void>
  onDeleteField?: (fieldId: string) => void
}
export default function FieldComponent({
  field,
  isOverlay = false,
  isInSubform = false,
  onUpdate,
  onDelete,
  onCopy,
  subformFields = [],
  onAddField,
  onUpdateField,
  onDeleteField,
}: FieldComponentProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [previewValue, setPreviewValue] = useState<any>(field?.defaultValue || "")
  const { toast } = useToast()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field?.id || "unknown",
    data: {
      type: "Field",
      field,
    },
    disabled: isOverlay || !field,
  })

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `subform-container-${field.id}`,
    data: {
      type: "SubformContainer",
      subformId: field.subformId,
      fieldId: field.id,
    },
    disabled: field.type !== "subform" || isOverlay || isDragging,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  // Debug subformFields
  useEffect(() => {
    if (field.type === "subform") {
      console.log(`Subform container ${field.id}:`, {
        subformFields,
        subformId: field.subformId,
      })
    }
  }, [field, subformFields])

  // Safety check for field
  if (!field) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4 text-center">
          <p className="text-red-600 text-sm">Error: Field data is missing</p>
        </CardContent>
      </Card>
    )
  }

  const handleDeleteField = () => {
    if (window.confirm("Are you sure you want to delete this field?")) {
      onDelete(field.id)
      toast({
        title: "Success",
        description: `Field "${field.label}" deleted successfully`,
      })
    }
  }

  const handleCopyField = () => {
    const newField: FormField = {
      ...field,
      id: `field_${uuidv4()}`,
      label: `${field.label} (Copy)`,
      order: field.order + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    onCopy(newField)
    toast({
      title: "Success",
      description: `Field "${field.label}" duplicated successfully`,
    })
  }

  const handleUpdateField = async (updates: Partial<FormField>) => {
    try {
      const context = isInSubform ? "subform" : "section"
      console.log(`FieldComponent.handleUpdateField called (${context}):`, {
        fieldId: field.id,
        fieldIdType: typeof field.id,
        fieldIdValue: field.id,
        updates,
        updatesType: typeof updates,
        context,
        sectionId: field.sectionId,
        subformId: field.subformId,
      })

      // Ensure required fields are included in the updates
      const completeUpdates = {
        ...updates,
        // Include required fields if not already present
        sectionId: updates.sectionId ?? field.sectionId,
        subformId: updates.subformId ?? field.subformId,
        type: updates.type ?? field.type,
        label: updates.label ?? field.label,
      }

      console.log(`Calling onUpdate (${context}) with:`, {
        fieldId: field.id,
        completeUpdates,
        onUpdateType: typeof onUpdate,
      })

      console.log(`About to call API for ${context} field:`, {
        method: "PUT",
        url: `/api/fields/${field.id}`,
        fieldId: field.id,
        fieldIdIsString: typeof field.id === "string",
        body: JSON.stringify(completeUpdates),
        bodySize: JSON.stringify(completeUpdates).length,
      })

      // Call onUpdate with fieldId and updates separately
      await onUpdate(field.id, completeUpdates)

      console.log(`✅ Successfully updated ${context} field:`, field.id)

      setShowSettings(false)
      toast({
        title: "Success",
        description: `Field "${field.label}" updated successfully`,
      })
    } catch (error: any) {
      console.error(`❌ Error in handleUpdateField (${isInSubform ? "subform" : "section"}):`, {
        fieldId: field.id,
        fieldIdType: typeof field.id,
        error: error.message,
        stack: error.stack,
        context: isInSubform ? "subform" : "section",
        apiUrl: `/api/fields/${field.id}`,
      })
      toast({
        title: "Error",
        description: error.message || "Failed to update field",
        variant: "destructive",
      })
    }
  }

  const renderFieldPreview = () => {
    const options = Array.isArray(field.options) ? field.options : []

    const lookupFieldData = {
      id: field.id,
      label: field.label,
      type: field.type,
      placeholder: field.placeholder || undefined,
      description: field.description || undefined,
      validation: field.validation || { required: false },
      lookup: field.lookup || undefined,
    }

    if (field.type === "subform") {
      return (
        <div
          ref={setDroppableRef}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${isOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"
            }`}
        >
          {subformFields.length > 0 ? (
            <SortableContext items={subformFields.map((f: FormField) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-4 grid-cols-1">
                {subformFields
                  .sort((a: FormField, b: FormField) => a.order - b.order)
                  .map((subField: FormField) => (
                    <FieldComponent
                      key={subField.id}
                      field={subField}
                      isInSubform={true}
                      onUpdate={async (fieldId, updates) => {
                        console.log("🔄 Subfield onUpdate called:", {
                          fieldId,
                          fieldIdType: typeof fieldId,
                          updates,
                          subFieldId: subField.id,
                          parentSubformId: field.subformId,
                        })
                        if (onUpdateField) {
                          console.log("📡 Calling parent onUpdateField:", {
                            fieldId,
                            updates,
                            expectedApiUrl: `/api/fields/${fieldId}`,
                          })
                          await onUpdateField(fieldId, updates)
                        } else {
                          console.warn(`❌ onUpdateField is undefined for subField ${fieldId}`)
                        }
                      }}
                      onDelete={() => {
                        if (onDeleteField) {
                          onDeleteField(subField.id)
                        } else {
                          console.warn(`❌ onDeleteField is undefined for subField ${subField.id}`)
                        }
                      }}
                      onCopy={() => {
                        const newField: FormField = {
                          ...subField,
                          id: `field_${uuidv4()}`,
                          label: `${subField.label} (Copy)`,
                          order: subformFields.length,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                          subformId: field.subformId,
                        }
                        onCopy(newField)
                      }}
                    />
                  ))}
              </div>
            </SortableContext>
          ) : (
            <>
              <Plus className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-xs text-gray-500">No fields in this subform yet</p>
              <p className="text-xs text-gray-400 mt-1">Drag fields from the palette to add them</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onAddField && field.subformId) {
                    onAddField("text", field.subformId)
                  } else {
                    console.warn(
                      `onAddField or subformId is undefined: onAddField=${!!onAddField}, subformId=${field.subformId}`,
                    )
                  }
                }}
                className="mt-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </>
          )}
        </div>
      )
    }

    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "tel":
      case "url":
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder || ""}
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        )
      case "password":
        return (
          <Input
            type="password"
            placeholder={field.placeholder || ""}
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        )
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || ""}
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            rows={field.properties?.rows || 3}
            disabled
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        )
      case "date":
        return (
          <Input
            type="date"
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        )
      case "datetime":
        return (
          <Input
            type="datetime-local"
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        )
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox checked={previewValue} onCheckedChange={setPreviewValue} disabled />
            <Label className={`text-sm ${isInSubform ? "text-purple-800" : ""}`}>{field.label}</Label>
          </div>
        )
      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch checked={previewValue} onCheckedChange={setPreviewValue} disabled />
            <Label className={`text-sm ${isInSubform ? "text-purple-800" : ""}`}>{field.label}</Label>
          </div>
        )
      case "radio":
        return (
          <RadioGroup value={previewValue} onValueChange={setPreviewValue} disabled>
            {options.map((option: FieldOption) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} />
                <Label className={`text-sm ${isInSubform ? "text-purple-800" : ""}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      case "select":
        return (
          <Select value={previewValue} onValueChange={setPreviewValue} disabled>
            <SelectTrigger className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: FieldOption) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "slider":
        return (
          <div className="space-y-2">
            <Slider
              value={[previewValue || field.validation?.min || 0]}
              onValueChange={(vals) => setPreviewValue(vals[0])}
              max={field.validation?.max || 100}
              min={field.validation?.min || 0}
              step={field.properties?.step || 1}
              disabled
              className="w-full"
            />
            <div className={`text-center text-sm ${isInSubform ? "text-purple-600" : "text-muted-foreground"}`}>
              Value: {previewValue || field.validation?.min || 0}
            </div>
          </div>
        )
      case "rating":
        return (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Star
                key={rating}
                className={`h-6 w-6 ${rating <= (previewValue || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
              />
            ))}
            <span className={`ml-2 text-sm ${isInSubform ? "text-purple-600" : "text-muted-foreground"}`}>
              {previewValue ? `${previewValue}/5` : "Not rated"}
            </span>
          </div>
        )
      case "lookup":
        return <LookupField field={lookupFieldData} value={previewValue} onChange={setPreviewValue} disabled={true} />
      case "file":
        return (
          <Input
            type="file"
            disabled
            multiple={field.properties?.multiple || false}
            accept={field.properties?.accept || undefined}
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        )
      case "hidden":
        return (
          <div
            className={`flex items-center space-x-2 p-2 rounded border-dashed border-2 ${isInSubform ? "bg-purple-50 border-purple-200" : "bg-gray-100 border-gray-300"
              }`}
          >
            <EyeOff className={`h-4 w-4 ${isInSubform ? "text-purple-500" : "text-gray-500"}`} />
            <span className={`text-sm ${isInSubform ? "text-purple-600" : "text-gray-500"}`}>Hidden Field</span>
            <Badge variant="outline" className={`text-xs ${isInSubform ? "border-purple-300 text-purple-700" : ""}`}>
              {field.defaultValue || "No value"}
            </Badge>
          </div>
        )
      default:
        return (
          <Input
            placeholder={field.placeholder || ""}
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
            className={isInSubform ? "border-purple-200 focus:border-purple-400" : ""}
          />
        )
    }
  }

  // Dynamic styling based on context
  const getCardStyles = () => {
    if (isInSubform) {
      return `group relative transition-all duration-200 border-l-4 border-l-purple-400 ${isDragging ? "shadow-2xl scale-105 rotate-1 border-purple-500 bg-purple-100" : "hover:shadow-md bg-purple-50/50"
        } ${!field.visible ? "opacity-50" : ""} ${field.readonly ? "bg-purple-100/50" : ""}`
    }
    return `group relative transition-all duration-200 ${isDragging ? "shadow-2xl scale-105 rotate-1 border-blue-400 bg-blue-50" : "hover:shadow-md"
      } ${!field.visible ? "opacity-50" : ""} ${field.readonly ? "bg-gray-50" : ""
      } ${field.type === "subform" ? "border-2 border-dashed" : ""}`
  }

  const getGripStyles = () => {
    if (isInSubform) {
      return "cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-purple-200 text-purple-600"
    }
    return "cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-gray-100 text-gray-400"
  }

  const getBadgeStyles = () => {
    if (isInSubform) {
      return "text-xs border-purple-300 text-purple-700 bg-purple-100"
    }
    return "text-xs"
  }

  const getActionButtonStyles = () => {
    if (isInSubform) {
      return "hover:bg-purple-200 text-purple-600"
    }
    return ""
  }

  return (
    <>
      <Card ref={setNodeRef} style={style} className={getCardStyles()}>
        <CardContent className="p-4 border rounded-lg">
          {/* Field Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div {...listeners} {...attributes} className={getGripStyles()}>
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Label className={`font-medium text-sm ${isInSubform ? "text-purple-800" : ""}`}>
                    {field.label}
                    {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <div className="flex items-center space-x-1">
                    {!field.visible && <EyeOff className="h-3 w-3 text-gray-400" />}
                    {field.readonly && <Lock className="h-3 w-3 text-gray-400" />}
                    <Badge variant="outline" className={getBadgeStyles()}>
                      {field.type}
                    </Badge>
                    {isInSubform && (
                      <Badge variant="secondary" className="text-xs bg-purple-200 text-purple-800">
                        Subform Field
                      </Badge>
                    )}
                    {field.type === "subform" && (
                      <Badge variant="secondary" className="text-xs bg-blue-200 text-blue-800">
                        <Database className="w-3 h-3 mr-1" />
                        Container
                      </Badge>
                    )}
                  </div>
                </div>
                {field.description && (
                  <p className={`text-xs mt-1 ${isInSubform ? "text-purple-600" : "text-muted-foreground"}`}>
                    {field.description}
                  </p>
                )}
              </div>
            </div>
            {/* Field Actions */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${getActionButtonStyles()}`}
                onClick={handleCopyField}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${getActionButtonStyles()}`}
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDeleteField}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Field Preview */}
          <div className="space-y-2">
            {field.type !== "checkbox" &&
              field.type !== "switch" &&
              field.type !== "hidden" &&
              field.type !== "subform" && (
                <Label className={`text-sm font-medium ${isInSubform ? "text-purple-800" : ""}`}>
                  {field.label}
                  {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              )}
            {renderFieldPreview()}
          </div>
          {/* Field Info */}
          <div
            className={`mt-3 flex items-center justify-between text-xs ${isInSubform ? "text-purple-600" : "text-muted-foreground"
              }`}
          >
            <span>ID: {field.id}</span>
            <span>Order: {field.order}</span>
          </div>
        </CardContent>
      </Card>
      {/* Field Settings Dialog */}
      {showSettings && (
        <FieldSettings field={field} open={showSettings} onOpenChange={setShowSettings} onUpdate={handleUpdateField} />
      )}
    </>
  )
}
