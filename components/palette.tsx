"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Type, Hash, Mail, Calendar, CheckSquare, List, Upload, AlignLeft, Phone, Link, Lock, Star, ToggleLeft, FileSlidersIcon as Slider, EyeOff, Database, Layers, Grid3X3, FileText, Clock, Radio, ChevronDown } from 'lucide-react'

export interface FieldType {
  id: string
  name: string
  label: string
  category: string
  icon: string
  description: string
  color?: string
}

export const fieldTypes: FieldType[] = [
  // Basic Fields
  {
    id: "text",
    name: "text",
    label: "Text Input",
    category: "basic",
    icon: "Type",
    description: "Single line text input",
  },
  {
    id: "textarea",
    name: "textarea",
    label: "Text Area",
    category: "basic",
    icon: "AlignLeft",
    description: "Multi-line text input",
  },
  {
    id: "number",
    name: "number",
    label: "Number",
    category: "basic",
    icon: "Hash",
    description: "Numeric input field",
  },
  {
    id: "email",
    name: "email",
    label: "Email",
    category: "basic",
    icon: "Mail",
    description: "Email address input",
  },
  {
    id: "tel",
    name: "tel",
    label: "Phone",
    category: "basic",
    icon: "Phone",
    description: "Phone number input",
  },
  {
    id: "url",
    name: "url",
    label: "URL",
    category: "basic",
    icon: "Link",
    description: "Website URL input",
  },
  {
    id: "password",
    name: "password",
    label: "Password",
    category: "basic",
    icon: "Lock",
    description: "Password input field",
  },
  {
    id: "date",
    name: "date",
    label: "Date",
    category: "basic",
    icon: "Calendar",
    description: "Date picker field",
  },
  {
    id: "datetime",
    name: "datetime",
    label: "Date & Time",
    category: "basic",
    icon: "Clock",
    description: "Date and time picker",
  },

  // Choice Fields
  {
    id: "select",
    name: "select",
    label: "Dropdown",
    category: "choice",
    icon: "ChevronDown",
    description: "Dropdown select list",
  },
  {
    id: "radio",
    name: "radio",
    label: "Radio Buttons",
    category: "choice",
    icon: "Radio",
    description: "Multiple choice (single select)",
  },
  {
    id: "checkbox",
    name: "checkbox",
    label: "Checkboxes",
    category: "choice",
    icon: "CheckSquare",
    description: "Multiple choice (multi-select)",
  },
  {
    id: "switch",
    name: "switch",
    label: "Toggle Switch",
    category: "choice",
    icon: "ToggleLeft",
    description: "On/off toggle switch",
  },

  // Advanced Fields
  {
    id: "file",
    name: "file",
    label: "File Upload",
    category: "advanced",
    icon: "Upload",
    description: "Upload files",
  },
  {
    id: "rating",
    name: "rating",
    label: "Rating",
    category: "advanced",
    icon: "Star",
    description: "Star rating field",
  },
  {
    id: "slider",
    name: "slider",
    label: "Slider",
    category: "advanced",
    icon: "Slider",
    description: "Range slider input",
  },
  {
    id: "lookup",
    name: "lookup",
    label: "Lookup",
    category: "advanced",
    icon: "Search",
    description: "Reference data from other sources",
  },
  {
    id: "hidden",
    name: "hidden",
    label: "Hidden Field",
    category: "advanced",
    icon: "EyeOff",
    description: "Hidden field for storing data",
  },

  // Layout Elements
  {
    id: "section",
    name: "section",
    label: "Section",
    category: "layout",
    icon: "Layers",
    description: "Group fields into sections",
    color: "blue",
  },
  {
    id: "subform",
    name: "subform",
    label: "Subform Section",
    category: "layout",
    icon: "Database",
    description: "Nested form with integration capabilities",
    color: "purple",
  },
]

const iconMap = {
  Type,
  AlignLeft,
  Hash,
  Mail,
  Phone,
  Link,
  Lock,
  Calendar,
  Clock,
  ChevronDown,
  Radio,
  CheckSquare,
  ToggleLeft,
  Upload,
  Star,
  Slider,
  Search,
  EyeOff,
  Layers,
  Database,
  Grid3X3,
  FileText,
  List,
}

interface PaletteProps {
  onFieldSelect?: (fieldType: FieldType) => void
}

export default function Palette({ onFieldSelect }: PaletteProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = [
    { id: "all", label: "All Fields", count: fieldTypes.length },
    { id: "basic", label: "Basic", count: fieldTypes.filter((f) => f.category === "basic").length },
    { id: "choice", label: "Choice", count: fieldTypes.filter((f) => f.category === "choice").length },
    { id: "advanced", label: "Advanced", count: fieldTypes.filter((f) => f.category === "advanced").length },
    { id: "layout", label: "Layout", count: fieldTypes.filter((f) => f.category === "layout").length },
  ]

  const filteredFields = fieldTypes.filter((field) => {
    const matchesSearch = field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || field.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Type
  }

  const getFieldColor = (field: FieldType) => {
    if (field.color === "purple") {
      return "border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300"
    }
    if (field.color === "blue") {
      return "border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300"
    }
    return "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
  }

  const getFieldTextColor = (field: FieldType) => {
    if (field.color === "purple") {
      return "text-purple-800"
    }
    if (field.color === "blue") {
      return "text-blue-800"
    }
    return "text-gray-800"
  }

  const getBadgeColor = (field: FieldType) => {
    if (field.color === "purple") {
      return "bg-purple-100 text-purple-700 border-purple-300"
    }
    if (field.color === "blue") {
      return "bg-blue-100 text-blue-700 border-blue-300"
    }
    return "bg-gray-100 text-gray-700 border-gray-300"
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Field Palette</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Category Filters */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs"
              >
                {category.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Field List */}
        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {filteredFields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No fields found</p>
                <p className="text-xs">Try adjusting your search or category filter</p>
              </div>
            ) : (
              filteredFields.map((field) => {
                const IconComponent = getIconComponent(field.icon)
                return (
                  <Card
                    key={field.id}
                    className={`cursor-grab hover:cursor-grabbing transition-all duration-200 ${getFieldColor(field)}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/json", JSON.stringify(field))
                      e.dataTransfer.effectAllowed = "copy"
                    }}
                    onClick={() => onFieldSelect?.(field)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${field.color === "purple" ? "bg-purple-200" : field.color === "blue" ? "bg-blue-200" : "bg-gray-200"}`}>
                          <IconComponent className={`h-4 w-4 ${field.color === "purple" ? "text-purple-600" : field.color === "blue" ? "text-blue-600" : "text-gray-600"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium text-sm ${getFieldTextColor(field)}`}>
                              {field.label}
                            </h4>
                            <Badge variant="outline" className={`text-xs ${getBadgeColor(field)}`}>
                              {field.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {field.description}
                          </p>
                          {field.category === "layout" && (
                            <div className="mt-2">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${field.color === "purple" ? "bg-purple-200 text-purple-800" : "bg-blue-200 text-blue-800"}`}
                              >
                                {field.color === "purple" ? "Integration Ready" : "Grouping Element"}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </ScrollArea>

        {/* Help Text */}
        <div className="pt-4 border-t">
          <div className="text-xs text-gray-500 space-y-1">
            <p className="flex items-center gap-1">
              <Database className="h-3 w-3 text-purple-500" />
              <span className="text-purple-600 font-medium">Subform Sections</span> support nested fields and integrations
            </p>
            <p className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-blue-500" />
              <span className="text-blue-600 font-medium">Sections</span> help organize and group related fields
            </p>
            <p>Drag fields onto the canvas or into sections to add them to your form</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PaletteItemDragOverlay({ fieldType }: { fieldType: FieldType }) {
  const IconComponent = getIconComponent(fieldType.icon)

  return (
    <Card className={`shadow-2xl rotate-2 scale-105 ${getFieldColor(fieldType)}`}>
      <CardContent className="p-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${fieldType.color === "purple" ? "bg-purple-200" : fieldType.color === "blue" ? "bg-blue-200" : "bg-gray-200"}`}>
            <IconComponent className={`h-4 w-4 ${fieldType.color === "purple" ? "text-purple-600" : fieldType.color === "blue" ? "text-blue-600" : "text-gray-600"}`} />
          </div>
          <div>
            <h4 className={`font-medium text-sm ${getFieldTextColor(fieldType)}`}>
              {fieldType.label}
            </h4>
            <Badge variant="outline" className={`text-xs ${getBadgeColor(fieldType)}`}>
              {fieldType.category}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getIconComponent(iconName: string) {
  return iconMap[iconName as keyof typeof iconMap] || Type
}

function getFieldColor(field: FieldType) {
  if (field.color === "purple") {
    return "border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300"
  }
  if (field.color === "blue") {
    return "border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300"
  }
  return "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
}

function getFieldTextColor(field: FieldType) {
  if (field.color === "purple") {
    return "text-purple-800"
  }
  if (field.color === "blue") {
    return "text-blue-800"
  }
  return "text-gray-800"
}

function getBadgeColor(field: FieldType) {
  if (field.color === "purple") {
    return "bg-purple-100 text-purple-700 border-purple-300"
  }
  if (field.color === "blue") {
    return "bg-blue-100 text-blue-700 border-blue-300"
  }
  return "bg-gray-100 text-gray-700 border-gray-300"
}
