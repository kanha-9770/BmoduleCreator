"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GripVertical, MoreHorizontal, Settings, Trash2, Copy, Eye, EyeOff, Camera, X, ImageIcon } from "lucide-react"
import type { FormField } from "@/types/form-builder"

interface FieldComponentProps {
  field: FormField
  onUpdate: (fieldId: string, updates: Partial<FormField>) => Promise<void>
  onDelete: () => void
  onCopy: () => void
}

export default function FieldComponent({ field, onUpdate, onDelete, onCopy }: FieldComponentProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: {
      type: "Field",
      field,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const clearImage = () => {
    setCapturedImage(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const renderFieldInput = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "url":
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder || `Enter ${field.label}`}
            disabled
            className="bg-gray-50"
          />
        )
      case "number":
        return <Input type="number" placeholder={field.placeholder || "Enter number"} disabled className="bg-gray-50" />
      case "textarea":
        return <Textarea placeholder={field.placeholder || "Enter text"} disabled className="bg-gray-50" />
      case "date":
        return <Input type="date" disabled className="bg-gray-50" />
      case "time":
        return <Input type="time" disabled className="bg-gray-50" />
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" disabled className="rounded" />
            <span className="text-sm text-gray-600">Checkbox option</span>
          </div>
        )
      case "radio":
        return (
          <div className="space-y-2">
            {field.options && field.options.length > 0 ? (
              field.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input type="radio" disabled name={field.id} />
                  <span className="text-sm text-gray-600">{option}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center space-x-2">
                <input type="radio" disabled />
                <span className="text-sm text-gray-400">Add options in settings</span>
              </div>
            )}
          </div>
        )
      case "select":
        return (
          <select disabled className="w-full p-2 border rounded bg-gray-50">
            <option>Select an option</option>
            {field.options?.map((option, idx) => (
              <option key={idx}>{option}</option>
            ))}
          </select>
        )
      case "file":
      case "image":
        return (
          <div className="border-2 border-dashed rounded-lg p-4 text-center bg-gray-50">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
          </div>
        )
      case "camera":
        return (
          <div className="space-y-3">
            {!capturedImage ? (
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full h-24 text-lg"
                  size="lg"
                >
                  <Camera className="w-6 h-6 mr-2" />
                  Take Photo
                </Button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  variant="outline"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Choose from Gallery
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                  <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-auto" />
                  <Button
                    type="button"
                    onClick={clearImage}
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full"
                  variant="outline"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Retake Photo
                </Button>
              </div>
            )}
          </div>
        )
      default:
        return (
          <div className="p-4 bg-gray-50 rounded border border-dashed">
            <p className="text-sm text-gray-500">{field.type} field preview</p>
          </div>
        )
    }
  }

  if (!field.visible) {
    return (
      <Card className="border-dashed opacity-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Hidden: {field.label}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group transition-all ${isDragging ? "shadow-lg scale-105 border-blue-400" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium">
                {field.label}
                {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.description && <p className="text-xs text-gray-500 mt-1">{field.description}</p>}
            </div>
            <Badge variant="secondary" className="text-xs">
              {field.type}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>
                <Settings className="w-4 h-4 mr-2" />
                Field Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate Field
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate(field.id, { visible: !field.visible })}>
                {field.visible ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {field.visible ? "Hide" : "Show"} Field
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Field
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-2">{renderFieldInput()}</div>
      </CardContent>
    </Card>
  )
}
