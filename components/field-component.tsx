"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
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
import { Settings, Trash2, GripVertical, EyeOff, Lock, Star, Copy, Database } from "lucide-react"
import type { FormField, Subform } from "@/types/form-builder"
import { LookupField } from "@/components/lookup-field"
import FieldSettings from "@/components/field-settings"
import SubformComponent from "@/components/subform-component"
import { v4 as uuidv4 } from "uuid"

interface FieldComponentProps {
  field: FormField
  isOverlay?: boolean
  isInSubform?: boolean
  onUpdate?: (field: FormField) => void
  onDelete?: (fieldId: string) => void
  onCopy?: (field: FormField) => void
  // Subform-specific props
  subform?: Subform
  onUpdateSubform?: (subform: Subform) => void
  onDeleteSubform?: (subformId: string) => void
  onCopySubform?: (subform: Subform) => void
  onAddFieldToSubform?: (subformId: string, fieldType: string) => void
}

export default function FieldComponent({
  field,
  isOverlay = false,
  isInSubform = false,
  onUpdate,
  onDelete,
  onCopy,
  subform,
  onUpdateSubform,
  onDeleteSubform,
  onCopySubform,
  onAddFieldToSubform,
}: FieldComponentProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [previewValue, setPreviewValue] = useState<any>(field?.defaultValue || "")

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field?.id || "unknown",
    data: {
      type: "Field",
      field,
    },
    disabled: isOverlay || !field,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

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
    if (confirm("Are you sure you want to delete this field?")) {
      onDelete?.(field.id)
    }
  }

  const handleCopyField = () => {
    const newField = {
      ...field,
      id: uuidv4(),
      label: `${field.label} (Copy)`,
      order: field.order + 1,
    }
    onCopy?.(newField)
  }

  const handleUpdateField = (updatedField: FormField) => {
    onUpdate?.(updatedField)
    setShowSettings(false)
  }

  // Handle subform field type
  if (field.type === "subform" && subform) {
    return (
      <SubformComponent
        subform={subform}
        isOverlay={isOverlay}
        onUpdate={onUpdateSubform}
        onDelete={onDeleteSubform}
        onCopy={onCopySubform}
        onAddField={onAddFieldToSubform}
        onUpdateField={onUpdate}
        onDeleteField={onDelete}
        onCopyField={onCopy}
      />
    )
  }

  const renderFieldPreview = () => {
    const options = Array.isArray(field.options) ? field.options : []

    const lookupFieldData = {
      id: field.id,
      label: field.label,
      placeholder: field.placeholder || undefined,
      description: field.description || undefined,
      validation: field.validation || { required: false },
      lookup: field.lookup || undefined,
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
            rows={3}
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
            {options.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
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
              {options.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
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
              value={[previewValue || 0]}
              onValueChange={(vals) => setPreviewValue(vals[0])}
              max={field.validation?.max || 100}
              min={field.validation?.min || 0}
              step={1}
              disabled
              className="w-full"
            />
            <div className={`text-center text-sm ${isInSubform ? "text-purple-600" : "text-muted-foreground"}`}>
              Value: {previewValue || 0}
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
      case "subform":
        return (
          <div
            className={`flex items-center space-x-2 p-4 rounded border-2 border-dashed ${isInSubform ? "bg-purple-100 border-purple-300" : "bg-blue-50 border-blue-300"
              }`}
          >
            <Database className={`h-6 w-6 ${isInSubform ? "text-purple-600" : "text-blue-600"}`} />
            <div className="flex-1">
              <span className={`text-sm font-medium ${isInSubform ? "text-purple-800" : "text-blue-800"}`}>
                Subform Container
              </span>
              <p className={`text-xs ${isInSubform ? "text-purple-600" : "text-blue-600"} mt-1`}>
                Nested form with integration capabilities
              </p>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${isInSubform ? "border-purple-300 text-purple-700" : "border-blue-300 text-blue-700"}`}
            >
              Subform
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
      } ${!field.visible ? "opacity-50" : ""} ${field.readonly ? "bg-gray-50" : ""}`
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
            className={`mt-3 flex items-center justify-between text-xs ${isInSubform ? "text-purple-600" : "text-muted-foreground"}`}
          >
            <span>ID: {field.id}</span>
            <span>Order: {field.order}</span>
          </div>
        </CardContent>
      </Card>
      {/* Field Settings Dialog */}
      {showSettings && onUpdate && (
        <FieldSettings field={field} open={showSettings} onOpenChange={setShowSettings} onUpdate={handleUpdateField} />
      )}
    </>
  )
}
