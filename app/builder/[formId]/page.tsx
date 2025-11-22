"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  closestCorners,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import FormCanvas from "@/components/form-canvas"
import ResizableSidebar from "@/components/resizable-sidebar";
import FieldPalette, { PaletteItemDragOverlay, type fieldTypes } from "@/components/field-palette"
import PublishFormDialog from "@/components/publish-form-dialog"
import LookupConfigurationDialog from "@/components/lookup-configuration-dialog"
import UserFormSettingsDialog from "@/components/user-form-settings-dialog"
import type { Form, FormField, Subform } from "@/types/form-builder"
import { Save, ArrowLeft, Loader2, Share2, Users, Settings, UserCheck } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { v4 as uuidv4 } from "uuid"

// Enhanced interface for subform hierarchy tracking
interface SubformHierarchy {
  id: string
  name: string
  path: string
  level: number
  parentPath?: string
  sectionId: string
  parentSubformId?: string
  children: SubformHierarchy[]
}

export default function FormBuilderPage() {
  const params = useParams()
  const formId = params.formId as string
  const { toast } = useToast()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [isLookupDialogOpen, setIsLookupDialogOpen] = useState(false)
  const [isUserFormSettingsOpen, setIsUserFormSettingsOpen] = useState(false)
  const [pendingLookupSectionId, setPendingLookupSectionId] = useState<string | null>(null)
  const [pendingLookupSubformId, setPendingLookupSubformId] = useState<string | null>(null)
  const [activePaletteItem, setActivePaletteItem] = useState<(typeof fieldTypes)[0] | null>(null)
  const [subformHierarchyMap, setSubformHierarchyMap] = useState<Map<string, SubformHierarchy>>(new Map())

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  useEffect(() => {
    if (formId) {
      fetchForm()
    }
  }, [formId])

  // Build hierarchical path map for all subforms
  const buildSubformHierarchyMap = (form: Form): Map<string, SubformHierarchy> => {
    const hierarchyMap = new Map<string, SubformHierarchy>()

    const processSubforms = (
      subforms: Subform[],
      sectionId: string,
      parentPath = "",
      level = 0,
    ): SubformHierarchy[] => {
      return subforms.map((subform, index) => {
        const currentPath = parentPath ? `${parentPath}.${index + 1}` : `${index + 1}`
        const hierarchy: SubformHierarchy = {
          id: subform.id,
          name: subform.name,
          path: currentPath,
          level,
          parentPath: parentPath || undefined,
          sectionId,
          parentSubformId: subform.parentSubformId,
          children: [],
        }

        if (subform.childSubforms && subform.childSubforms.length > 0) {
          hierarchy.children = processSubforms(subform.childSubforms, sectionId, currentPath, level + 1)
        }

        hierarchyMap.set(subform.id, hierarchy)
        return hierarchy
      })
    }

    form.sections.forEach((section) => {
      if (section.subforms && section.subforms.length > 0) {
        processSubforms(section.subforms, section.id)
      }
    })

    return hierarchyMap
  }

  const getSubformPath = (subformId: string): string => {
    const hierarchy = subformHierarchyMap.get(subformId)
    return hierarchy?.path || ""
  }

  const getFullSubformPath = (subformId: string): string => {
    if (!form) return ""

    const hierarchy = subformHierarchyMap.get(subformId)
    if (!hierarchy) return ""

    const section = form.sections.find((s) => s.id === hierarchy.sectionId)
    const sectionName = section?.title || "Unknown Section"

    return `${sectionName} → ${hierarchy.path}`
  }

  const getParentChildDisplay = (subformId: string): string => {
    const hierarchy = subformHierarchyMap.get(subformId)
    if (!hierarchy) return ""

    if (hierarchy.parentPath) {
      return `Parent: ${hierarchy.parentPath} → Current: ${hierarchy.path}`
    }

    return `Root Level: ${hierarchy.path}`
  }

  const getAncestorPaths = (subformId: string): string[] => {
    const hierarchy = subformHierarchyMap.get(subformId)
    if (!hierarchy) return []

    const ancestors: string[] = []
    let currentPath = hierarchy.parentPath

    while (currentPath) {
      ancestors.unshift(currentPath)
      const parentHierarchy = Array.from(subformHierarchyMap.values()).find((h) => h.path === currentPath)
      currentPath = parentHierarchy?.parentPath
    }

    return ancestors
  }

  const fetchForm = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/forms/${formId}`)
      if (!response.ok) throw new Error("Failed to fetch form")
      const result = await response.json()
      if (result.success) {
        setForm(result.data)
        const hierarchyMap = buildSubformHierarchyMap(result.data)
        setSubformHierarchyMap(hierarchyMap)
      } else {
        throw new Error(result.error || "Failed to fetch form")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const optimisticFormUpdate = (updatedForm: Form) => {
    setForm(updatedForm)
    const hierarchyMap = buildSubformHierarchyMap(updatedForm)
    setSubformHierarchyMap(hierarchyMap)
  }

  const handleFormUpdate = (updatedForm: Form) => {
    optimisticFormUpdate(updatedForm)
  }

  const handleFormPublished = (updatedForm: Form) => {
    optimisticFormUpdate(updatedForm)
  }

  const handleUserFormSettingsUpdate = async (isUserForm: boolean, isEmployeeForm: boolean) => {
    if (!form) return

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          isUserForm,
          isEmployeeForm,
        }),
      })

      if (!response.ok) throw new Error("Failed to update form settings")
      const result = await response.json()
      if (result.success) {
        optimisticFormUpdate(result.data)
        toast({
          title: "Success",
          description: isUserForm
            ? "Form marked as user form"
            : isEmployeeForm
              ? "Form marked as employee form"
              : "Form marked as regular form",
        })
      } else {
        throw new Error(result.error || "Failed to update form settings")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "PaletteField") {
      setActivePaletteItem(event.active.data.current.fieldData)
    } else {
      setActivePaletteItem(null)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActivePaletteItem(null)

    if (!over) return

    if (active.data.current?.type === "PaletteField") {
      const fieldType = active.data.current.fieldType as string
      let sectionId: string | null = null
      let subformId: string | null = null
      let insertIndex = 0

      if (over.data.current?.isSectionDropzone) {
        sectionId = over.data.current.sectionId
        const section = form?.sections.find((s) => s.id === sectionId)
        if (section) {
          insertIndex = section.fields.length + section.subforms.length
        }
      } else if (over.data.current?.type === "Field" || over.data.current?.type === "Subform") {
        sectionId = over.data.current?.field?.sectionId || over.data.current?.subform?.sectionId
        subformId = over.data.current?.field?.subformId || over.data.current?.subform?.id
        const itemId = over.data.current?.field?.id || over.data.current?.subform?.id
        const section = form?.sections.find((s) => s.id === sectionId)
        if (section) {
          const allItems: (FormField | Subform)[] = [...section.fields, ...section.subforms].sort(
            (a, b) => a.order - b.order,
          )
          insertIndex = allItems.findIndex((i) => i.id === itemId)
          const activeCenter = active.rect.current.translated
            ? active.rect.current.translated.top + active.rect.current.translated.height / 2
            : 0
          const overCenter = over.rect.top + over.rect.height / 2
          const isAfter = activeCenter > overCenter
          insertIndex += isAfter ? 1 : 0
        }
      } else {
        return
      }

      if (!sectionId) return

      if (fieldType === "subform") {
        await createSubform(sectionId, subformId)
      } else if (fieldType === "lookup") {
        setPendingLookupSectionId(sectionId)
        setPendingLookupSubformId(subformId)
        setIsLookupDialogOpen(true)
      } else {
        await createSingleField(fieldType, sectionId, subformId, insertIndex)
      }
    } else if (active.data.current?.type === "Field" || active.data.current?.type === "Subform") {
      handleReorderItem(event)
    } else if (active.data.current?.type === "Section") {
      handleReorderSection(event)
    }
  }

  const createSingleField = async (
    fieldType: string,
    sectionId: string,
    subformId: string | null,
    insertionIndex: number,
  ) => {
    if (!form) return

    try {
      const tempId = `temp_${uuidv4()}`
      const newField: FormField = {
        id: tempId,
        sectionId: subformId ? undefined : sectionId,
        subformId,
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
        order: insertionIndex,
        conditional: null,
        styling: null,
        properties: null,
        rollup: null,
        lookup: null,
        formula: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedForm = { ...form }
      if (subformId) {
        const addToSubform = (subforms: Subform[]): boolean => {
          for (const subform of subforms) {
            if (subform.id === subformId) {
              subform.fields.splice(insertionIndex, 0, newField)
              subform.fields.forEach((f, idx) => (f.order = idx))
              return true
            }
            if (subform.childSubforms && addToSubform(subform.childSubforms)) {
              return true
            }
          }
          return false
        }

        for (const section of updatedForm.sections) {
          if (addToSubform(section.subforms)) break
        }
      } else {
        const section = updatedForm.sections.find((s) => s.id === sectionId)
        if (section) {
          section.fields.splice(insertionIndex, 0, newField)
          section.fields.forEach((f, idx) => (f.order = idx))
        }
      }

      optimisticFormUpdate(updatedForm)

      const fieldData = { ...newField, id: undefined }
      const response = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fieldData),
      })

      if (!response.ok) throw new Error("Failed to create field")

      const result = await response.json()
      if (result.success) {
        const updatedSections = updatedForm.sections.map((s) => {
          if (s.id === sectionId) {
            if (subformId) {
              const updateSubforms = (subforms: Subform[]): Subform[] =>
                subforms.map((sub) => {
                  if (sub.id === subformId) {
                    return {
                      ...sub,
                      fields: sub.fields.map((f) => (f.id === tempId ? { ...f, id: result.data.id } : f)),
                    }
                  }
                  if (sub.childSubforms) {
                    return {
                      ...sub,
                      childSubforms: updateSubforms(sub.childSubforms),
                    }
                  }
                  return sub
                })
              return { ...s, subforms: updateSubforms(s.subforms) }
            } else {
              return {
                ...s,
                fields: s.fields.map((f) => (f.id === tempId ? { ...f, id: result.data.id } : f)),
              }
            }
          }
          return s
        })

        optimisticFormUpdate({ ...updatedForm, sections: updatedSections })

        toast({
          title: "Success",
          description: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} field added to ${subformId ? `subform ${getSubformPath(subformId)}` : "section"
            } successfully`,
        })
      } else {
        throw new Error(result.error || "Failed to create field")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const createSubform = async (sectionId: string, parentSubformId: string | null) => {
    if (!form) return

    try {
      const tempId = `temp_${uuidv4()}`
      let nextPath = "1"
      if (parentSubformId) {
        const parentHierarchy = subformHierarchyMap.get(parentSubformId)
        if (parentHierarchy) {
          nextPath = `${parentHierarchy.path}.${parentHierarchy.children.length + 1}`
        }
      } else {
        const section = form.sections.find((s) => s.id === sectionId)
        if (section) {
          nextPath = `${section.subforms.filter((sub) => !sub.parentSubformId).length + 1}`
        }
      }

      const newSubform: Subform = {
        id: tempId,
        sectionId: parentSubformId ? undefined : sectionId,
        parentSubformId,
        name: `Subform ${nextPath}`,
        order: parentSubformId ? 0 : form.sections.find((s) => s.id === sectionId)?.subforms.length || 0,
        columns: 1,
        visible: true,
        collapsible: true,
        collapsed: false,
        fields: [],
        childSubforms: [],
      }

      const updatedForm = { ...form }
      if (parentSubformId) {
        const addToSubform = (subforms: Subform[]): boolean => {
          for (const subform of subforms) {
            if (subform.id === parentSubformId) {
              if (!subform.childSubforms) subform.childSubforms = []
              subform.childSubforms.push(newSubform)
              return true
            }
            if (subform.childSubforms && addToSubform(subform.childSubforms)) {
              return true
            }
          }
          return false
        }

        for (const section of updatedForm.sections) {
          if (addToSubform(section.subforms)) break
        }
      } else {
        const section = updatedForm.sections.find((s) => s.id === sectionId)
        if (section) {
          section.subforms.push(newSubform)
        }
      }

      optimisticFormUpdate(updatedForm)

      const subformData = { ...newSubform, id: undefined }
      const response = await fetch("/api/subforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subformData),
      })

      if (!response.ok) throw new Error("Failed to create subform")

      const result = await response.json()
      if (result.success) {
        const updatedSections = updatedForm.sections.map((s) => {
          if (s.id === sectionId) {
            if (parentSubformId) {
              const updateSubforms = (subforms: Subform[]): Subform[] =>
                subforms.map((sub) => {
                  if (sub.id === parentSubformId) {
                    return {
                      ...sub,
                      childSubforms: sub.childSubforms?.map((child) =>
                        child.id === tempId ? { ...child, id: result.data.id } : child,
                      ),
                    }
                  }
                  if (sub.childSubforms) {
                    return {
                      ...sub,
                      childSubforms: updateSubforms(sub.childSubforms),
                    }
                  }
                  return sub
                })
              return { ...s, subforms: updateSubforms(s.subforms) }
            } else {
              return {
                ...s,
                subforms: s.subforms.map((sub) => (sub.id === tempId ? { ...sub, id: result.data.id } : sub)),
              }
            }
          }
          return s
        })

        optimisticFormUpdate({ ...updatedForm, sections: updatedSections })

        toast({
          title: "Success",
          description: `Subform ${nextPath} created successfully${parentSubformId ? ` under ${getSubformPath(parentSubformId)}` : ""
            }`,
        })
      } else {
        throw new Error(result.error || "Failed to create subform")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleReorderItem = (event: DragEndEvent) => {
    if (!form) return

    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeContainer = active.data.current?.sortable?.containerId
    const overContainer = over.data.current?.sortable?.containerId

    if (activeContainer !== overContainer) return

    const sectionId = activeContainer
    const section = form.sections.find((s) => s.id === sectionId)
    if (!section) return

    const allItems: (FormField | Subform)[] = [...section.fields, ...section.subforms].sort((a, b) => a.order - b.order)
    const oldIndex = allItems.findIndex((i) => i.id === active.id)
    let newIndex = allItems.findIndex((i) => i.id === over.id)

    const activeCenter = active.rect.current.translated
      ? active.rect.current.translated.top + active.rect.current.translated.height / 2
      : 0
    const overCenter = over.rect.top + over.rect.height / 2
    const isAfter = activeCenter > overCenter
    newIndex += isAfter ? 1 : 0

    const newAllItems = arrayMove(allItems, oldIndex, newIndex)
    newAllItems.forEach((item, index) => (item.order = index))

    const newFields = newAllItems.filter((i): i is FormField => "type" in i)
    const newSubforms = newAllItems.filter((i): i is Subform => (!type) in i)

    const updatedSections = form.sections.map((s) =>
      s.id === sectionId ? { ...s, fields: newFields, subforms: newSubforms } : s,
    )

    optimisticFormUpdate({ ...form, sections: updatedSections })

    newFields.forEach((f) =>
      fetch(`/api/fields/${f.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: f.order }),
      }),
    )
    newSubforms.forEach((s) =>
      fetch(`/api/subforms/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: s.order }),
      }),
    )
  }

  const handleReorderSection = (event: DragEndEvent) => {
    if (!form) return

    const { active, over } = event
    if (!over) return

    const oldIndex = form.sections.findIndex((s) => s.id === active.id)
    const newIndex = form.sections.findIndex((s) => s.id === over.id)

    const newSections = arrayMove(form.sections, oldIndex, newIndex)
    newSections.forEach((s, index) => (s.order = index))

    optimisticFormUpdate({ ...form, sections: newSections })

    newSections.forEach((s) =>
      fetch(`/api/sections/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: s.order }),
      }),
    )
  }

  const handleLookupFieldsConfirm = async (lookupFields: Partial<FormField>[]) => {
    if (!form || (!pendingLookupSectionId && !pendingLookupSubformId)) return

    try {
      const updatedForm = { ...form }
      const createdFields: FormField[] = []

      for (const fieldData of lookupFields) {
        const response = await fetch("/api/fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId: pendingLookupSubformId ? undefined : pendingLookupSectionId,
            subformId: pendingLookupSubformId,
            type: fieldData.type,
            label: fieldData.label,
            placeholder: fieldData.placeholder,
            description: fieldData.description,
            defaultValue: fieldData.defaultValue,
            options: fieldData.options,
            validation: fieldData.validation,
            visible: fieldData.visible,
            readonly: fieldData.readonly,
            width: fieldData.width,
            order: fieldData.order,
            lookup: fieldData.lookup,
          }),
        })

        if (!response.ok) throw new Error("Failed to create lookup field")
        const result = await response.json()

        if (result.success) {
          const savedField: FormField = {
            ...fieldData,
            id: result.data.id,
            sectionId: pendingLookupSubformId ? undefined : pendingLookupSectionId,
            subformId: pendingLookupSubformId,
            createdAt: new Date(),
            updatedAt: new Date(),
            conditional: null,
            styling: null,
            properties: null,
            rollup: null,
            lookup: fieldData.lookup,
            formula: null,
            options: fieldData.options || [],
            validation: fieldData.validation || {},
          } as FormField

          createdFields.push(savedField)

          if (pendingLookupSubformId) {
            const addToSubform = (subforms: Subform[]): boolean => {
              for (const subform of subforms) {
                if (subform.id === pendingLookupSubformId) {
                  subform.fields.push(savedField)
                  subform.fields.forEach((f, idx) => (f.order = idx))
                  return true
                }
                if (subform.childSubforms && addToSubform(subform.childSubforms)) {
                  return true
                }
              }
              return false
            }

            for (const section of updatedForm.sections) {
              if (addToSubform(section.subforms)) break
            }
          } else if (pendingLookupSectionId) {
            const section = updatedForm.sections.find((s) => s.id === pendingLookupSectionId)
            if (section) {
              section.fields.push(savedField)
              section.fields.forEach((f, idx) => (f.order = idx))
            }
          }
        }
      }

      optimisticFormUpdate(updatedForm)

      toast({
        title: "Success",
        description: `${createdFields.length} lookup field${createdFields.length !== 1 ? "s" : ""} created in ${pendingLookupSubformId ? `subform ${getSubformPath(pendingLookupSubformId)}` : "section"
          } successfully`,
      })

      setPendingLookupSectionId(null)
      setPendingLookupSubformId(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const saveForm = async () => {
    if (!form) return
    setSaving(true)
    try {
      const formToSave = {
        name: form.name,
        description: form.description,
        settings: form.settings,
        isUserForm: form.isUserForm,
        isEmployeeForm: form.isEmployeeForm,
      }
      const response = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToSave),
      })

      if (!response.ok) throw new Error("Failed to save form")

      const result = await response.json()
      if (result.success) {
        toast({ title: "Success", description: "Form saved successfully" })
      } else {
        throw new Error(result.error || "Failed to save form")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!form) {
    return (
      <div className="flex h-screen items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold">Form Not Found</h2>
          <p className="text-muted-foreground">The requested form could not be loaded.</p>
          <Link href="/">
            <Button variant="outline" className="mt-4 bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-gray-50 font-sans">
        <aside className="w-max flex-shrink-0 border-r bg-white">
          <ResizableSidebar defaultWidth={288} collapsedWidth={100} >
            <FieldPalette />
          </ResizableSidebar>
        </aside>
        <div className="flex flex-1 flex-col">
          <header className="flex h-10.5 flex-shrink-0 items-center justify-between border-b bg-white px-4">
            <div className="flex items-center gap-4">
              <Link href={`/modules/${form.moduleId}`}>
                <Button variant="ghost" size="icon" aria-label="Back to module">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">{form.name}</h1>
                    {form.isUserForm && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 w-max h-6 px-4">
                        <Users className="w-3 h-3 mr-1" />
                        User Form
                      </Badge>
                    )}
                    {form.isEmployeeForm && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 w-max h-6 px-4">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Employee Form
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsUserFormSettingsOpen(true)} className="text-xs h-8">
                <Settings className="mr-2 h-3 w-3" />
                Form Settings
              </Button>
              <Button variant="outline" onClick={() => setIsPublishDialogOpen(true)} className="text-xs h-8">
                <Share2 className="mr-2 h-3 w-3" /> Publish
              </Button>
              <Button onClick={saveForm} disabled={saving} className="text-xs h-8">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <FormCanvas
              form={form}
              onFormUpdate={handleFormUpdate}
              subformHierarchyMap={subformHierarchyMap}
              getSubformPath={getSubformPath}
              getFullSubformPath={getFullSubformPath}
              getParentChildDisplay={getParentChildDisplay}
              getAncestorPaths={getAncestorPaths}
            />
          </main>
        </div>
      </div>
      {typeof window !== "undefined" &&
        createPortal(
          <DragOverlay style={{ zIndex: 10000 }}>
            {activePaletteItem && <PaletteItemDragOverlay fieldType={activePaletteItem} />}
          </DragOverlay>,
          document.body,
        )}
      <PublishFormDialog
        form={form}
        open={isPublishDialogOpen}
        onOpenChange={setIsPublishDialogOpen}
        onFormPublished={handleFormPublished}
      />
      <LookupConfigurationDialog
        open={isLookupDialogOpen}
        onOpenChange={setIsLookupDialogOpen}
        onConfirm={handleLookupFieldsConfirm}
        sectionId={pendingLookupSectionId || ""}
        subformId={pendingLookupSubformId || undefined}
      />
      <UserFormSettingsDialog
        form={form}
        open={isUserFormSettingsOpen}
        onOpenChange={setIsUserFormSettingsOpen}
        onUpdate={handleUserFormSettingsUpdate}
      />
    </DndContext>
  )
}
