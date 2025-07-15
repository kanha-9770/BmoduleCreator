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
  type DragOverEvent,
  closestCorners,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import FormCanvas from "@/components/form-canvas"
import FieldPalette, { PaletteItemDragOverlay, fieldTypes } from "@/components/field-palette"
import PublishFormDialog from "@/components/publish-form-dialog"
import LookupConfigurationDialog from "@/components/lookup-configuration-dialog"
import type { Form, FormSection, FormField } from "@/types/form-builder"
import { Save, Eye, ArrowLeft, Loader2, Share2 } from "lucide-react"
import Link from "next/link"
import { v4 as uuidv4 } from "uuid"
import FieldComponent from "@/components/field-component"
import SectionComponent from "@/components/section-component"

export default function FormBuilderPage() {
  const params = useParams()
  const formId = params.formId as string
  const { toast } = useToast()

  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [isLookupDialogOpen, setIsLookupDialogOpen] = useState(false)
  const [pendingLookupSectionId, setPendingLookupSectionId] = useState<string | null>(null)

  const [activeItem, setActiveItem] = useState<FormField | FormSection | null>(null)
  const [activePaletteItem, setActivePaletteItem] = useState<string | null>(null)

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

  const fetchForm = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/forms/${formId}`)
      if (!response.ok) throw new Error("Failed to fetch form")
      const result = await response.json()
      if (result.success) {
        setForm(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch form")
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleFormUpdate = (updatedForm: Form) => {
    setForm(updatedForm)
  }

  const handleFormPublished = (updatedForm: Form) => {
    setForm(updatedForm)
  }

  const handleUpdateField = async (field: FormField) => {
    try {
      console.log("FormBuilder updating field:", field)
      const response = await fetch(`/api/fields/${field.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(field),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || "Failed to update field")
      }

      console.log("API response:", result)
      await fetchForm()
    } catch (error: any) {
      console.error("FormBuilder update error:", error)
      throw error
    }
  }

  const handleDeleteField = async (fieldId: string) => {
    try {
      const response = await fetch(`/api/fields/${fieldId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete field")
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || "Failed to delete field")
      }

      await fetchForm()
      toast({
        title: "Success",
        description: "Field deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting field:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.isPaletteItem) {
      setActivePaletteItem(String(event.active.id))
      setActiveItem(null)
    } else if (event.active.data.current?.type === "Section") {
      setActiveItem(event.active.data.current.section)
      setActivePaletteItem(null)
    } else if (event.active.data.current?.type === "Field") {
      setActiveItem(event.active.data.current.field)
      setActivePaletteItem(null)
    } else {
      setActiveItem(null)
      setActivePaletteItem(null)
    }
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const isActiveAField = active.data.current?.type === "Field"
    const isOverAField = over.data.current?.type === "Field"
    const isOverASection = over.data.current?.type === "Section"

    if (!isActiveAField) return

    // Dropping a Field over another Field
    if (isActiveAField && isOverAField) {
      setForm((prevForm) => {
        if (!prevForm) return null
        const activeSectionId = active.data.current?.field.sectionId
        const overSectionId = over.data.current?.field.sectionId
        const activeIndex = prevForm.sections
          .find((s) => s.id === activeSectionId)
          ?.fields.findIndex((f) => f.id === active.id)
        const overIndex = prevForm.sections
          .find((s) => s.id === overSectionId)
          ?.fields.findIndex((f) => f.id === over.id)

        if (activeIndex === undefined || overIndex === undefined) return prevForm

        if (activeSectionId !== overSectionId) {
          const newSections = [...prevForm.sections]
          const activeSection = newSections.find((s) => s.id === activeSectionId)!
          const overSection = newSections.find((s) => s.id === overSectionId)!
          const [movedField] = activeSection.fields.splice(activeIndex, 1)
          movedField.sectionId = overSectionId as string
          overSection.fields.splice(overIndex, 0, movedField)
          return { ...prevForm, sections: newSections }
        }
        return prevForm
      })
    }

    // Dropping a Field over a Section
    if (isActiveAField && isOverASection) {
      setForm((prevForm) => {
        if (!prevForm) return null
        const activeSectionId = active.data.current?.field.sectionId
        const overSectionId = String(over.id)
        const activeIndex = prevForm.sections
          .find((s) => s.id === activeSectionId)
          ?.fields.findIndex((f) => f.id === active.id)

        if (activeIndex === undefined) return prevForm

        if (activeSectionId !== overSectionId) {
          const newSections = [...prevForm.sections]
          const activeSection = newSections.find((s) => s.id === activeSectionId)!
          const overSection = newSections.find((s) => s.id === overSectionId)!
          const [movedField] = activeSection.fields.splice(activeIndex, 1)
          movedField.sectionId = overSectionId
          overSection.fields.push(movedField)
          return { ...prevForm, sections: newSections }
        }
        return prevForm
      })
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveItem(null)
    setActivePaletteItem(null)
    const { active, over } = event
    if (!over) return

    // Handle dropping a new field from the palette
    if (active.data.current?.isPaletteItem) {
      const overData = over.data.current
      const sectionId = overData?.isSectionDropzone ? String(over.id) : overData?.field?.sectionId

      if (!sectionId || !form) return

      const fieldType = String(active.id)

      // Special handling for lookup fields
      if (fieldType === "lookup") {
        setPendingLookupSectionId(sectionId)
        setIsLookupDialogOpen(true)
        return
      }

      // Handle other field types
      await createSingleField(fieldType, sectionId)
      return
    }

    if (active.id === over.id) return

    // Handle section reordering
    const isSectionDrag = active.data.current?.type === "Section" && over.data.current?.type === "Section"
    if (isSectionDrag) {
      setForm((prevForm) => {
        if (!prevForm) return null
        const oldIndex = prevForm.sections.findIndex((s) => s.id === active.id)
        const newIndex = prevForm.sections.findIndex((s) => s.id === over.id)

        if (oldIndex === newIndex) return prevForm

        const sortedSections = arrayMove(prevForm.sections, oldIndex, newIndex)

        // Update order values for all sections
        const sectionsWithOrder = sortedSections.map((section, index) => ({
          ...section,
          order: index,
        }))

        return { ...prevForm, sections: sectionsWithOrder }
      })

      // Persist section order changes to database
      setTimeout(() => updateSectionOrders(), 100)
    }

    // Handle field reordering within the same section
    const isFieldDrag = active.data.current?.type === "Field" && over.data.current?.type === "Field"
    if (isFieldDrag) {
      const activeSectionId = active.data.current?.field.sectionId
      const overSectionId = over.data.current?.field.sectionId

      if (activeSectionId === overSectionId) {
        setForm((prevForm) => {
          if (!prevForm) return null

          const sectionIndex = prevForm.sections.findIndex((s) => s.id === activeSectionId)
          if (sectionIndex === -1) return prevForm

          const section = prevForm.sections[sectionIndex]
          const oldIndex = section.fields.findIndex((f) => f.id === active.id)
          const newIndex = section.fields.findIndex((f) => f.id === over.id)

          if (oldIndex === newIndex) return prevForm

          const sortedFields = arrayMove(section.fields, oldIndex, newIndex)

          // Update order values for all fields in the section
          const fieldsWithOrder = sortedFields.map((field, index) => ({
            ...field,
            order: index,
          }))

          const newSections = [...prevForm.sections]
          newSections[sectionIndex] = { ...section, fields: fieldsWithOrder }

          return { ...prevForm, sections: newSections }
        })

        // Persist field order changes to database
        setTimeout(() => updateFieldOrders(activeSectionId), 100)
      }
    }
  }

  const updateSectionOrders = async () => {
    if (!form) return

    try {
      // Update all section orders in parallel
      const updatePromises = form.sections.map((section, index) =>
        fetch(`/api/sections/${section.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index }),
        }),
      )

      await Promise.all(updatePromises)
      console.log("Section orders updated successfully")
    } catch (error) {
      console.error("Error updating section orders:", error)
      toast({
        title: "Error",
        description: "Failed to save section order",
        variant: "destructive",
      })
    }
  }

  const updateFieldOrders = async (sectionId: string) => {
    if (!form) return

    try {
      const section = form.sections.find((s) => s.id === sectionId)
      if (!section) return

      // Update all field orders in the section in parallel
      const updatePromises = section.fields.map((field, index) =>
        fetch(`/api/fields/${field.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index }),
        }),
      )

      await Promise.all(updatePromises)
      console.log("Field orders updated successfully for section:", sectionId)
    } catch (error) {
      console.error("Error updating field orders:", error)
      toast({
        title: "Error",
        description: "Failed to save field order",
        variant: "destructive",
      })
    }
  }

  const createSingleField = async (fieldType: string, sectionId: string) => {
    if (!form) return

    const newField: FormField = {
      id: `temp_${uuidv4()}`,
      type: fieldType,
      label: `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}`,
      sectionId: sectionId,
      placeholder: "",
      description: "",
      defaultValue: "",
      options: [],
      validation: {},
      visible: true,
      readonly: false,
      width: "full",
      order: form.sections.find((s) => s.id === sectionId)?.fields.length || 0,
      conditional: null,
      styling: null,
      properties: null,
      rollup: null,
      lookup: null,
      formula: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    try {
      const response = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: sectionId,
          type: fieldType,
          label: newField.label,
          placeholder: newField.placeholder,
          description: newField.description,
          defaultValue: newField.defaultValue,
          options: newField.options,
          validation: newField.validation,
          visible: newField.visible,
          readonly: newField.readonly,
          width: newField.width,
          order: newField.order,
        }),
      })

      if (!response.ok) throw new Error("Failed to create field")

      const result = await response.json()
      if (result.success) {
        const savedField = { ...newField, id: result.data.id }

        setForm((prevForm) => {
          if (!prevForm) return null
          const newSections = prevForm.sections.map((section) => {
            if (section.id === sectionId) {
              return { ...section, fields: [...section.fields, savedField] }
            }
            return section
          })
          return { ...prevForm, sections: newSections }
        })

        toast({
          title: "Success",
          description: "Field added successfully",
        })
      } else {
        throw new Error(result.error || "Failed to create field")
      }
    } catch (error: any) {
      console.error("Error creating field:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleLookupFieldsConfirm = async (lookupFields: Partial<FormField>[]) => {
    if (!pendingLookupSectionId || !form) return

    try {
      const createdFields: FormField[] = []

      for (const fieldData of lookupFields) {
        const response = await fetch("/api/fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId: pendingLookupSectionId,
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
            sectionId: pendingLookupSectionId,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as FormField

          createdFields.push(savedField)
        }
      }

      setForm((prevForm) => {
        if (!prevForm) return null
        const newSections = prevForm.sections.map((section) => {
          if (section.id === pendingLookupSectionId) {
            return { ...section, fields: [...section.fields, ...createdFields] }
          }
          return section
        })
        return { ...prevForm, sections: newSections }
      })

      setPendingLookupSectionId(null)
    } catch (error: any) {
      console.error("Error creating lookup fields:", error)
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
      const sectionsToSave = form.sections.map((section, sectionIndex) => ({
        ...section,
        order: sectionIndex,
      }))

      for (const section of sectionsToSave) {
        if (!section.id.startsWith("section_")) {
          await fetch(`/api/sections/${section.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: section.title,
              description: section.description,
              order: section.order,
              columns: section.columns,
              visible: section.visible,
              collapsible: section.collapsible,
              collapsed: section.collapsed,
            }),
          })
        } else {
          const response = await fetch("/api/sections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              formId: form.id,
              title: section.title,
              description: section.description,
              order: section.order,
              columns: section.columns,
              visible: section.visible,
              collapsible: section.collapsible,
              collapsed: section.collapsed,
            }),
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              section.id = result.data.id
            }
          }
        }

        const fieldsToSave = section.fields.map((field, fieldIndex) => ({
          ...field,
          order: fieldIndex,
          sectionId: section.id,
        }))

        for (const field of fieldsToSave) {
          if (!field.id.startsWith("temp_") && !field.id.startsWith("field_")) {
            await fetch(`/api/fields/${field.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sectionId: field.sectionId,
                type: field.type,
                label: field.label,
                placeholder: field.placeholder,
                description: field.description,
                defaultValue: field.defaultValue,
                options: field.options,
                validation: field.validation,
                visible: field.visible,
                readonly: field.readonly,
                width: field.width,
                order: field.order,
                conditional: field.conditional,
                styling: field.styling,
                properties: field.properties,
                formula: field.formula,
                rollup: field.rollup,
                lookup: field.lookup,
              }),
            })
          }
        }
      }

      const formToSave = {
        name: form.name,
        description: form.description,
        settings: form.settings,
      }

      const response = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToSave),
      })

      if (!response.ok) throw new Error("Failed to save form")

      const result = await response.json()
      if (result.success) {
        await fetchForm()
        toast({ title: "Success", description: "Form saved successfully" })
      } else {
        throw new Error(result.error || "Failed to save form")
      }
    } catch (error: any) {
      console.error("Save error:", error)
      toast({ title: "Error", description: error.message, variant: "destructive" })
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

  // Get the active palette field type for drag overlay
  const activePaletteFieldType = activePaletteItem ? fieldTypes.find((ft) => ft.id === activePaletteItem) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      collisionDetection={closestCorners}
    >
      <div className="flex h-screen bg-gray-50 font-sans">
        <aside className="w-72 flex-shrink-0 border-r bg-white">
          <FieldPalette />
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-white px-6">
            <div className="flex items-center gap-4">
              <Link href={`/modules/${form.moduleId}`}>
                <Button variant="ghost" size="icon" aria-label="Back to module">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">{form.name}</h1>
                <p className="text-sm text-muted-foreground">Form Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/preview/${form.id}`} target="_blank">
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setIsPublishDialogOpen(true)}>
                <Share2 className="mr-2 h-4 w-4" /> Publish
              </Button>
              <Button onClick={saveForm} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <FormCanvas form={form} onFormUpdate={handleFormUpdate} />
          </main>
        </div>
      </div>

      {/* Enhanced Drag Overlay with proper z-index */}
      {typeof window !== "undefined" &&
        createPortal(
          <DragOverlay
            style={{
              zIndex: 10000,
            }}
          >
            {activePaletteFieldType && <PaletteItemDragOverlay fieldType={activePaletteFieldType} />}
            {activeItem?.hasOwnProperty("fields") && (
              <div style={{ zIndex: 10000 }}>
                <SectionComponent
                  section={activeItem as FormSection}
                  isOverlay
                  onUpdateSection={() => { }}
                  onDeleteSection={() => { }}
                  onUpdateField={handleUpdateField}
                  onDeleteField={handleDeleteField}
                />
              </div>
            )}
            {activeItem && !activeItem.hasOwnProperty("fields") && (
              <div style={{ zIndex: 10000 }}>
                <FieldComponent field={activeItem as FormField} isOverlay onUpdate={() => { }} onDelete={() => { }} />
              </div>
            )}
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
      />
    </DndContext>
  )
}
