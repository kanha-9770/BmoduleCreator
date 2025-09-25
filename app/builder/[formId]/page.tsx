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
import UserFormSettingsDialog from "@/components/user-form-settings-dialog"
import type { Form, FormSection, FormField, Subform } from "@/types/form-builder"
import { Save, Eye, ArrowLeft, Loader2, Share2, Users, Settings, UserCheck } from "lucide-react"
import Link from "next/link"
import FieldComponent from "@/components/field-component"
import SectionComponent from "@/components/section-component"
import SubformComponent from "@/components/subform-component"
import { Badge } from "@/components/ui/badge"

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
  const [activeItem, setActiveItem] = useState<FormField | FormSection | Subform | null>(null)
  const [activePaletteItem, setActivePaletteItem] = useState<string | null>(null)
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

        // Process child subforms recursively
        if (subform.childSubforms && subform.childSubforms.length > 0) {
          hierarchy.children = processSubforms(subform.childSubforms, sectionId, currentPath, level + 1)
        }

        hierarchyMap.set(subform.id, hierarchy)
        return hierarchy
      })
    }

    // Process all sections
    form.sections.forEach((section) => {
      if (section.subforms && section.subforms.length > 0) {
        processSubforms(section.subforms, section.id)
      }
    })

    return hierarchyMap
  }

  // Get subform path by ID
  const getSubformPath = (subformId: string): string => {
    const hierarchy = subformHierarchyMap.get(subformId)
    return hierarchy?.path || ""
  }

  // Get full hierarchical path with section name
  const getFullSubformPath = (subformId: string): string => {
    if (!form) return ""

    const hierarchy = subformHierarchyMap.get(subformId)
    if (!hierarchy) return ""

    const section = form.sections.find((s) => s.id === hierarchy.sectionId)
    const sectionName = section?.name || "Unknown Section"

    return `${sectionName} → ${hierarchy.path}`
  }

  // Get parent-child relationship display
  const getParentChildDisplay = (subformId: string): string => {
    const hierarchy = subformHierarchyMap.get(subformId)
    if (!hierarchy) return ""

    if (hierarchy.parentPath) {
      return `Parent: ${hierarchy.parentPath} → Current: ${hierarchy.path}`
    }

    return `Root Level: ${hierarchy.path}`
  }

  // Get all ancestor paths
  const getAncestorPaths = (subformId: string): string[] => {
    const hierarchy = subformHierarchyMap.get(subformId)
    if (!hierarchy) return []

    const ancestors: string[] = []
    let currentPath = hierarchy.parentPath

    while (currentPath) {
      ancestors.unshift(currentPath)
      // Find parent hierarchy to get its parent
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
        // Build hierarchy map after form is loaded
        const hierarchyMap = buildSubformHierarchyMap(result.data)
        setSubformHierarchyMap(hierarchyMap)
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
    // Rebuild hierarchy map when form updates
    const hierarchyMap = buildSubformHierarchyMap(updatedForm)
    setSubformHierarchyMap(hierarchyMap)
  }

  const handleFormPublished = (updatedForm: Form) => {
    setForm(updatedForm)
    const hierarchyMap = buildSubformHierarchyMap(updatedForm)
    setSubformHierarchyMap(hierarchyMap)
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
        setForm(result.data)

        let message = "Form settings updated successfully"
        if (isUserForm) {
          message = "Form marked as user form"
        } else if (isEmployeeForm) {
          message = "Form marked as employee form"
        } else {
          message = "Form marked as regular form"
        }

        toast({
          title: "Success",
          description: message,
        })
      } else {
        throw new Error(result.error || "Failed to update form settings")
      }
    } catch (error: any) {
      console.error("Error updating form settings:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleUpdateField = async (fieldId: string, updates: Partial<FormField>) => {
    try {
      console.log("FormBuilder updating field:", fieldId, updates)
      const response = await fetch(`/api/fields/${fieldId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
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

  // Helper function to find subform by ID recursively
  const findSubformById = (subforms: Subform[], targetId: string): Subform | null => {
    for (const subform of subforms) {
      if (subform.id === targetId) return subform
      if (subform.childSubforms && subform.childSubforms.length > 0) {
        const found = findSubformById(subform.childSubforms, targetId)
        if (found) return found
      }
    }
    return null
  }

  // Helper function to find parent container (section or subform) for a subform
  const findParentContainer = (targetSubformId: string): { type: "section" | "subform"; id: string } | null => {
    if (!form) return null

    for (const section of form.sections) {
      // Check if it's a direct child of section
      if (section.subforms.some((sub) => sub.id === targetSubformId)) {
        return { type: "section", id: section.id }
      }

      // Check nested subforms recursively
      const checkNested = (subforms: Subform[]): { type: "section" | "subform"; id: string } | null => {
        for (const subform of subforms) {
          if (subform.childSubforms && subform.childSubforms.some((child: Subform) => child.id === targetSubformId)) {
            return { type: "subform", id: subform.id }
          }
          if (subform.childSubforms && subform.childSubforms.length > 0) {
            const found = checkNested(subform.childSubforms)
            if (found) return found
          }
        }
        return null
      }

      const found = checkNested(section.subforms)
      if (found) return found
    }

    return null
  }

  // FIXED: Enhanced function to extract subform ID from various drop zone patterns
  const extractSubformIdFromDropZone = (dropZoneId: string): string | null => {
    console.log("🔍 Extracting subform ID from:", dropZoneId)

    // Pattern 1: subform-dropzone-{id}
    if (dropZoneId.startsWith("subform-dropzone-")) {
      const id = dropZoneId.replace("subform-dropzone-", "")
      console.log("✅ Pattern 1 match:", id)
      return id
    }

    // Pattern 2: subform-empty-dropzone-{id}
    if (dropZoneId.startsWith("subform-empty-dropzone-")) {
      const id = dropZoneId.replace("subform-empty-dropzone-", "")
      console.log("✅ Pattern 2 match:", id)
      return id
    }

    // Pattern 3: Just the subform ID (validate it exists)
    if (subformHierarchyMap.has(dropZoneId)) {
      console.log("✅ Pattern 3 match (direct ID):", dropZoneId)
      return dropZoneId
    }

    console.log("❌ No pattern match found")
    return null
  }

  // FIXED: Enhanced function to validate if a subform exists in the form structure
  const validateSubformExists = (subformId: string): boolean => {
    if (!form) return false

    // Check hierarchy map first (fastest)
    if (subformHierarchyMap.has(subformId)) {
      console.log("✅ Subform found in hierarchy map:", subformId)
      return true
    }

    // Fallback: search form structure
    const searchSubforms = (subforms: Subform[]): boolean => {
      for (const subform of subforms) {
        if (subform.id === subformId) return true
        if (subform.childSubforms && searchSubforms(subform.childSubforms)) {
          return true
        }
      }
      return false
    }

    for (const section of form.sections) {
      if (searchSubforms(section.subforms)) {
        console.log("✅ Subform found in form structure:", subformId)
        return true
      }
    }

    console.log("❌ Subform not found:", subformId)
    return false
  }

  const onDragStart = (event: DragStartEvent) => {
    console.log("🚀 Drag Start:", event.active.id, event.active.data.current)

    if (event.active.data.current?.isPaletteItem) {
      setActivePaletteItem(String(event.active.id))
      setActiveItem(null)
    } else if (event.active.data.current?.type === "Section") {
      setActiveItem(event.active.data.current.section)
      setActivePaletteItem(null)
    } else if (event.active.data.current?.type === "Field") {
      setActiveItem(event.active.data.current.field)
      setActivePaletteItem(null)
    } else if (event.active.data.current?.type === "Subform") {
      setActiveItem(event.active.data.current.subform)
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
    const isActiveASubform = active.data.current?.type === "Subform"
    const isOverAField = over.data.current?.type === "Field"
    const isOverASection = over.data.current?.type === "Section"
    const isOverASubform = over.data.current?.type === "Subform"

    // Handle field reordering and movement
    if (isActiveAField) {
      setForm((prevForm) => {
        if (!prevForm) return null

        const activeSectionId = active.data.current?.field.sectionId
        const activeSubformId = active.data.current?.field.subformId
        let targetSectionId: string | undefined
        let targetSubformId: string | undefined

        // Determine target container
        if (isOverAField) {
          targetSectionId = over.data.current?.field.sectionId
          targetSubformId = over.data.current?.field.subformId
        } else if (isOverASection) {
          targetSectionId = String(over.id).replace("section-dropzone-", "")
        } else if (isOverASubform) {
          const targetSubform = over.data.current?.subform
          targetSectionId = targetSubform?.sectionId
          targetSubformId = targetSubform?.id
        }

        if (!targetSectionId) return prevForm

        // Handle movement between different containers
        if (activeSectionId !== targetSectionId || activeSubformId !== targetSubformId) {
          const newSections = [...prevForm.sections]

          // Remove from source
          const activeSection = newSections.find((s) => s.id === activeSectionId)
          if (!activeSection) return prevForm

          let movedField: FormField | undefined

          if (activeSubformId) {
            // Remove from subform
            const removeFromSubform = (subforms: Subform[]): boolean => {
              for (const subform of subforms) {
                const fieldIndex = subform.fields.findIndex((f) => f.id === active.id)
                if (fieldIndex !== -1) {
                  ;[movedField] = subform.fields.splice(fieldIndex, 1)
                  return true
                }
                if (subform.childSubforms && removeFromSubform(subform.childSubforms)) {
                  return true
                }
              }
              return false
            }

            if (!removeFromSubform(activeSection.subforms)) return prevForm
          } else {
            // Remove from section
            const activeIndex = activeSection.fields.findIndex((f) => f.id === active.id)
            if (activeIndex === -1) return prevForm
              ;[movedField] = activeSection.fields.splice(activeIndex, 1)
          }

          if (!movedField) return prevForm

          // Add to target
          const targetSection = newSections.find((s) => s.id === targetSectionId)
          if (!targetSection) return prevForm

          movedField.sectionId = targetSectionId
          movedField.subformId = targetSubformId

          if (targetSubformId) {
            // Add to subform
            const addToSubform = (subforms: Subform[]): boolean => {
              for (const subform of subforms) {
                if (subform.id === targetSubformId) {
                  subform.fields.push(movedField!)
                  return true
                }
                if (subform.childSubforms && addToSubform(subform.childSubforms)) {
                  return true
                }
              }
              return false
            }

            addToSubform(targetSection.subforms)
          } else {
            // Add to section
            targetSection.fields.push(movedField)
          }

          return { ...prevForm, sections: newSections }
        }

        return prevForm
      })
    }

    // Handle subform movement
    if (isActiveASubform) {
      setForm((prevForm) => {
        if (!prevForm) return null

        const activeSubform = active.data.current?.subform
        const activeLevel = activeSubform?.level || 0
        let targetSectionId: string | undefined
        let targetSubformId: string | undefined
        let targetLevel = 0

        // Determine target container
        if (isOverASection) {
          targetSectionId = String(over.id).replace("section-dropzone-", "")
        } else if (isOverASubform) {
          const targetSubform = over.data.current?.subform
          targetSectionId = targetSubform?.sectionId
          targetSubformId = targetSubform?.id
          targetLevel = (targetSubform?.level || 0) + 1
        }

        if (!targetSectionId) return prevForm

        // Prevent moving subform into itself or its children
        if (targetSubformId === activeSubform?.id) return prevForm

        // Check if target is a child of active subform (prevent circular nesting)
        const isChildOfActive = (subform: Subform, targetId: string): boolean => {
          if (subform.id === targetId) return true
          return subform.childSubforms
            ? subform.childSubforms.some((child: Subform) => isChildOfActive(child, targetId))
            : false
        }

        if (targetSubformId && activeSubform && isChildOfActive(activeSubform, targetSubformId)) {
          return prevForm
        }

        // Move the subform
        const newSections = [...prevForm.sections]

        // Remove from source
        const removeSubform = (subforms: Subform[], targetId: string): Subform | null => {
          const index = subforms.findIndex((sub) => sub.id === targetId)
          if (index !== -1) {
            return subforms.splice(index, 1)[0]
          }

          for (const subform of subforms) {
            if (subform.childSubforms && subform.childSubforms.length > 0) {
              const removed = removeSubform(subform.childSubforms, targetId)
              if (removed) return removed
            }
          }

          return null
        }

        let movedSubform: Subform | null = null
        for (const section of newSections) {
          movedSubform = removeSubform(section.subforms, activeSubform?.id || "")
          if (movedSubform) break
        }

        if (!movedSubform) return prevForm

        // Update subform properties
        movedSubform.sectionId = targetSectionId
        movedSubform.parentSubformId = targetSubformId
        movedSubform.level = targetLevel

        // Add to target
        const targetSection = newSections.find((s) => s.id === targetSectionId)
        if (!targetSection) return prevForm

        if (targetSubformId) {
          // Add to subform
          const addToSubform = (subforms: Subform[]): boolean => {
            for (const subform of subforms) {
              if (subform.id === targetSubformId) {
                if (!subform.childSubforms) subform.childSubforms = []
                subform.childSubforms.push(movedSubform!)
                return true
              }
              if (subform.childSubforms && addToSubform(subform.childSubforms)) {
                return true
              }
            }
            return false
          }

          addToSubform(targetSection.subforms)
        } else {
          // Add to section
          targetSection.subforms.push(movedSubform)
        }

        return { ...prevForm, sections: newSections }
      })
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    console.log("🎯 DRAG END - Complete Event Analysis:", {
      activeId: event.active.id,
      activeType: event.active.data.current?.type,
      isPaletteItem: event.active.data.current?.isPaletteItem,
      overId: event.over?.id,
      overType: event.over?.data.current?.type,
      overData: event.over?.data.current,
    })

    setActiveItem(null)
    setActivePaletteItem(null)

    const { active, over } = event

    if (!over) {
      console.log("❌ No drop target found")
      return
    }

    // Handle dropping a new field from the palette
    if (active.data.current?.isPaletteItem) {
      console.log("🎨 PALETTE ITEM DROP DETECTED")
      const overData = over.data.current
      const fieldType = String(active.id)

      // Initialize target variables
      let targetSectionId: string | undefined
      let targetSubformId: string | undefined
      let insertionIndex: number | undefined

      console.log("🔍 ENHANCED DROP TARGET ANALYSIS:", {
        overId: over.id,
        overIdString: String(over.id),
        overData: overData,
        overDataType: overData?.type,
        hierarchyMapSize: subformHierarchyMap.size,
        hierarchyMapKeys: Array.from(subformHierarchyMap.keys()),
      })

      // FIXED: Improved subform detection logic with better error handling
      // Method 1: Check for SubformDropzone or SubformEmptyDropzone types
      if (overData?.type === "SubformDropzone" || overData?.type === "SubformEmptyDropzone") {
        console.log("✅ METHOD 1 - Detected subform dropzone type:", overData.type)

        // First try to get subform data from overData.subform
        if (overData.subform?.id) {
          targetSubformId = overData.subform.id
          targetSectionId = overData.subform.sectionId
          console.log("✅ METHOD 1A SUCCESS - From subform object:", { targetSubformId, targetSectionId })
        }
        // Fallback to overData.subformId
        else if (overData.subformId) {
          targetSubformId = overData.subformId
          let hierarchy: SubformHierarchy | undefined = undefined
          if (typeof targetSubformId === "string") {
            hierarchy = subformHierarchyMap.get(targetSubformId)
          }
          targetSectionId = hierarchy?.sectionId
          console.log("✅ METHOD 1B SUCCESS - From subformId:", { targetSubformId, targetSectionId })
        }
        // Last resort: extract from over.id
        else {
          const extractedId = extractSubformIdFromDropZone(String(over.id))
          if (extractedId && validateSubformExists(extractedId)) {
            targetSubformId = extractedId
            const hierarchy = subformHierarchyMap.get(targetSubformId)
            targetSectionId = hierarchy?.sectionId
            console.log("✅ METHOD 1C SUCCESS - From over.id extraction:", { targetSubformId, targetSectionId })
          }
        }
      }

      // Method 2: Field proximity (handle dropping near existing fields)
      if (!targetSubformId && overData?.field) {
        targetSectionId = overData.field.sectionId
        targetSubformId = overData.field.subformId
        insertionIndex = overData.field.order + 1
        console.log("✅ METHOD 2 SUCCESS - Near field:", { targetSectionId, targetSubformId, insertionIndex })

        // If field is in a subform but has no sectionId, get it from hierarchy
        if (targetSubformId && !targetSectionId) {
          const hierarchy = subformHierarchyMap.get(targetSubformId)
          targetSectionId = hierarchy?.sectionId
          console.log("✅ METHOD 2B SUCCESS - Got section from hierarchy:", { targetSectionId, targetSubformId })
        }
      }

      // Method 3: Extract from drop zone ID patterns (only if previous methods failed)
      if (!targetSubformId && !targetSectionId) {
        const extractedSubformId = extractSubformIdFromDropZone(String(over.id))
        if (extractedSubformId && validateSubformExists(extractedSubformId)) {
          targetSubformId = extractedSubformId
          const hierarchy = subformHierarchyMap.get(targetSubformId)
          targetSectionId = hierarchy?.sectionId
          console.log("✅ METHOD 3 SUCCESS:", { targetSubformId, targetSectionId })
        }
      }

      // Method 4: Section dropzone (only if no subform target found)
      if (!targetSubformId && !targetSectionId && (overData?.type === "Section" || overData?.isSectionDropzone)) {
        targetSectionId = String(over.id).replace("section-dropzone-", "")
        console.log("✅ METHOD 4 SUCCESS - Section dropzone:", { targetSectionId })
      }

      // FINAL VALIDATION - Enhanced error reporting
      if (!targetSectionId) {
        console.log("❌ COMPLETE FAILURE - No valid drop target found")
        console.log("🔍 DEBUGGING INFORMATION:")
        console.log("Over ID:", over.id)
        console.log("Over data:", overData)
        console.log("Hierarchy map keys:", Array.from(subformHierarchyMap.keys()))
        console.log(
          "Form sections:",
          form?.sections.map((s) => ({ id: s.id, name: s.name })),
        )

        toast({
          title: "Drop Failed",
          description: `Could not identify drop target. Over ID: ${over.id}, Type: ${overData?.type || "unknown"}. Please try refreshing the page.`,
          variant: "destructive",
        })
        return
      }

      // FIXED: Additional validation to ensure target exists in current form state
      if (targetSubformId && !validateSubformExists(targetSubformId)) {
        console.log("❌ TARGET SUBFORM VALIDATION FAILED:", targetSubformId)
        toast({
          title: "Drop Failed",
          description: "Target subform no longer exists. Please refresh the page.",
          variant: "destructive",
        })
        return
      }

      console.log("🎯 FINAL TARGET CONFIRMED:", {
        targetSectionId,
        targetSubformId,
        fieldType,
        insertionIndex,
        willCreateInSubform: !!targetSubformId,
        subformPath: targetSubformId ? getSubformPath(targetSubformId) : "N/A",
      })

      // Special handling for subform field type
      if (fieldType === "subform") {
        console.log("🏗️ Creating subform")
        await createSubform(targetSectionId, targetSubformId)
        return
      }

      // FIXED: Special handling for lookup fields - now supports subforms
      if (fieldType === "lookup") {
        console.log("🔍 Creating lookup field")
        setPendingLookupSectionId(targetSectionId || "")
        setPendingLookupSubformId(targetSubformId || null)
        setIsLookupDialogOpen(true)
        return
      }

      // Handle other field types
      console.log("⚡ Creating field:", fieldType)
      await createSingleField(fieldType, targetSectionId, targetSubformId, insertionIndex)
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
        const sectionsWithOrder = sortedSections.map((section, index) => ({
          ...section,
          order: index,
        }))

        return { ...prevForm, sections: sectionsWithOrder }
      })

      setTimeout(() => updateSectionOrders(), 100)
    }

    const isFieldDrag = active.data.current?.type === "Field" && over.data.current?.type === "Field"
    if (isFieldDrag) {
      const activeSectionId = active.data.current?.field.sectionId
      const overSectionId = over.data.current?.field.sectionId
      const activeSubformId = active.data.current?.field.subformId
      const overSubformId = over.data.current?.field.subformId

      setForm((prevForm) => {
        if (!prevForm) return null

        const newSections = [...prevForm.sections]

        // Handle cross-container movement
        if (activeSectionId !== overSectionId || activeSubformId !== overSubformId) {
          // Remove from source
          const activeSection = newSections.find((s) => s.id === activeSectionId)
          if (!activeSection) return prevForm

          let movedField: FormField | undefined

          if (activeSubformId) {
            // Remove from subform
            const removeFromSubform = (subforms: Subform[]): boolean => {
              for (const subform of subforms) {
                const fieldIndex = subform.fields.findIndex((f) => f.id === active.id)
                if (fieldIndex !== -1) {
                  ;[movedField] = subform.fields.splice(fieldIndex, 1)
                  // Reorder remaining fields
                  subform.fields.forEach((field, index) => {
                    field.order = index
                  })
                  return true
                }
                if (subform.childSubforms && removeFromSubform(subform.childSubforms)) {
                  return true
                }
              }
              return false
            }

            if (!removeFromSubform(activeSection.subforms)) return prevForm
          } else {
            // Remove from section
            const activeIndex = activeSection.fields.findIndex((f) => f.id === active.id)
            if (activeIndex === -1) return prevForm
              ;[movedField] = activeSection.fields.splice(activeIndex, 1)
            // Reorder remaining fields
            activeSection.fields.forEach((field, index) => {
              field.order = index
            })
          }

          if (!movedField) return prevForm

          // Add to target at specific position
          const targetSection = newSections.find((s) => s.id === overSectionId)
          if (!targetSection) return prevForm

          movedField.sectionId = overSectionId
          movedField.subformId = overSubformId

          const targetFieldOrder = over.data.current?.field.order || 0

          if (overSubformId) {
            // Add to subform at specific position
            const addToSubform = (subforms: Subform[]): boolean => {
              for (const subform of subforms) {
                if (subform.id === overSubformId) {
                  // Insert at the position after the target field
                  const insertIndex = Math.min(targetFieldOrder + 1, subform.fields.length)
                  subform.fields.splice(insertIndex, 0, movedField!)
                  // Reorder all fields
                  subform.fields.forEach((field, index) => {
                    field.order = index
                  })
                  return true
                }
                if (subform.childSubforms && addToSubform(subform.childSubforms)) {
                  return true
                }
              }
              return false
            }

            addToSubform(targetSection.subforms)
          } else {
            // Add to section at specific position
            const insertIndex = Math.min(targetFieldOrder + 1, targetSection.fields.length)
            targetSection.fields.splice(insertIndex, 0, movedField)
            // Reorder all fields
            targetSection.fields.forEach((field, index) => {
              field.order = index
            })
          }

          return { ...prevForm, sections: newSections }
        }

        // Handle reordering within the same container
        if (activeSectionId === overSectionId && activeSubformId === overSubformId) {
          const section = newSections.find((s) => s.id === activeSectionId)
          if (!section) return prevForm

          if (activeSubformId && overSubformId) {
            // Reordering within a subform
            const reorderInSubform = (subforms: Subform[]): boolean => {
              for (const subform of subforms) {
                if (subform.id === activeSubformId) {
                  const oldIndex = subform.fields.findIndex((f) => f.id === active.id)
                  const newIndex = subform.fields.findIndex((f) => f.id === over.id)

                  if (oldIndex === newIndex) return true

                  const sortedFields = arrayMove(subform.fields, oldIndex, newIndex)
                  const fieldsWithOrder = sortedFields.map((field, index) => ({
                    ...field,
                    order: index,
                  }))

                  subform.fields = fieldsWithOrder
                  return true
                }
                if (subform.childSubforms && reorderInSubform(subform.childSubforms)) {
                  return true
                }
              }
              return false
            }

            reorderInSubform(section.subforms)
          } else if (!activeSubformId && !overSubformId) {
            // Reordering within a section
            const oldIndex = section.fields.findIndex((f) => f.id === active.id)
            const newIndex = section.fields.findIndex((f) => f.id === over.id)

            if (oldIndex === newIndex) return prevForm

            const sortedFields = arrayMove(section.fields, oldIndex, newIndex)
            const fieldsWithOrder = sortedFields.map((field, index) => ({
              ...field,
              order: index,
            }))

            section.fields = fieldsWithOrder
          }

          return { ...prevForm, sections: newSections }
        }

        return prevForm
      })

      // Persist field order changes to database
      if (activeSubformId) {
        setTimeout(() => updateSubformFieldOrders(activeSubformId), 100)
      } else {
        setTimeout(() => updateFieldOrders(activeSectionId), 100)
      }

      // Also update target container if different
      if (activeSectionId !== overSectionId || activeSubformId !== overSubformId) {
        if (overSubformId) {
          setTimeout(() => updateSubformFieldOrders(overSubformId), 100)
        } else {
          setTimeout(() => updateFieldOrders(overSectionId), 100)
        }
      }
    }

    // Handle subform reordering
    const isSubformDrag = active.data.current?.type === "Subform" && over.data.current?.type === "Subform"
    if (isSubformDrag) {
      const activeSubform = active.data.current?.subform
      const overSubform = over.data.current?.subform

      // Only reorder if they're at the same level and have the same parent
      if (
        activeSubform?.parentSubformId === overSubform?.parentSubformId &&
        activeSubform?.sectionId === overSubform?.sectionId
      ) {
        setForm((prevForm) => {
          if (!prevForm) return null

          const newSections = [...prevForm.sections]

          const reorderSubforms = (subforms: Subform[]): boolean => {
            const activeIndex = subforms.findIndex((sub) => sub.id === active.id)
            const overIndex = subforms.findIndex((sub) => sub.id === over.id)

            if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
              const sortedSubforms = arrayMove(subforms, activeIndex, overIndex)
              const subformsWithOrder = sortedSubforms.map((subform, index) => ({
                ...subform,
                order: index,
              }))

              // Update the array in place
              subforms.splice(0, subforms.length, ...subformsWithOrder)
              return true
            }

            // Check nested subforms
            for (const subform of subforms) {
              if (subform.childSubforms && reorderSubforms(subform.childSubforms)) {
                return true
              }
            }

            return false
          }

          for (const section of newSections) {
            if (reorderSubforms(section.subforms)) break
          }

          return { ...prevForm, sections: newSections }
        })

        setTimeout(() => updateSubformOrders(), 100)
      }
    }
  }

  const updateSectionOrders = async () => {
    if (!form) return

    try {
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

  const updateSubformFieldOrders = async (subformId: string) => {
    if (!form) return

    try {
      const findSubform = (subforms: Subform[]): Subform | null => {
        for (const subform of subforms) {
          if (subform.id === subformId) return subform
          if (subform.childSubforms && subform.childSubforms.length > 0) {
            const found = findSubform(subform.childSubforms)
            if (found) return found
          }
        }
        return null
      }

      let targetSubform: Subform | null = null
      for (const section of form.sections) {
        targetSubform = findSubform(section.subforms)
        if (targetSubform) break
      }

      if (!targetSubform) return

      const updatePromises = targetSubform.fields.map((field, index) =>
        fetch(`/api/fields/${field.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index }),
        }),
      )
      await Promise.all(updatePromises)
      console.log("Subform field orders updated successfully for subform:", subformId)
    } catch (error) {
      console.error("Error updating subform field orders:", error)
      toast({
        title: "Error",
        description: "Failed to save subform field order",
        variant: "destructive",
      })
    }
  }

  const updateSubformOrders = async () => {
    if (!form) return
    try {
      const updatePromises: Promise<any>[] = []

      const collectSubformUpdates = (subforms: Subform[]) => {
        subforms.forEach((subform, index) => {
          updatePromises.push(
            fetch(`/api/subforms/${subform.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order: index }),
            }),
          )
          if (subform.childSubforms && subform.childSubforms.length > 0) {
            collectSubformUpdates(subform.childSubforms)
          }
        })
      }

      form.sections.forEach((section) => {
        collectSubformUpdates(section.subforms)
      })

      await Promise.all(updatePromises)
      console.log("Subform orders updated successfully")
    } catch (error) {
      console.error("Error updating subform orders:", error)
      toast({
        title: "Error",
        description: "Failed to save subform order",
        variant: "destructive",
      })
    }
  }

  const createSingleField = async (
    fieldType: string,
    sectionId?: string,
    subformId?: string,
    insertionIndex?: number,
  ) => {
    if (!form) return
    try {
      console.log("🔧 Creating field with params:", { fieldType, sectionId, subformId, insertionIndex })

      // Calculate the correct order based on insertion position
      let calculatedOrder = 0
      if (insertionIndex !== undefined) {
        calculatedOrder = insertionIndex
      } else {
        // Default to end of list
        if (subformId) {
          // Find the subform and get its field count
          const findSubform = (subforms: Subform[]): Subform | null => {
            for (const subform of subforms) {
              if (subform.id === subformId) return subform
              if (subform.childSubforms) {
                const found = findSubform(subform.childSubforms)
                if (found) return found
              }
            }
            return null
          }

          let targetSubform: Subform | null = null
          for (const section of form.sections) {
            targetSubform = findSubform(section.subforms)
            if (targetSubform) break
          }

          calculatedOrder = targetSubform?.fields.length || 0
        } else if (sectionId) {
          const section = form.sections.find((s) => s.id === sectionId)
          calculatedOrder = section?.fields.length || 0
        }
      }

      const fieldData = {
        sectionId: subformId ? undefined : sectionId,
        subformId: subformId,
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
        order: calculatedOrder,
        insertionIndex: insertionIndex, // Pass insertion index to API
      }

      console.log("📤 Sending field creation request:", fieldData)
      const response = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fieldData),
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Field creation failed:", response.status, errorText)
        throw new Error(`Failed to create field: ${response.status} ${errorText}`)
      }
      const result = await response.json()
      console.log("✅ Field creation successful:", result)
      if (result.success) {
        await fetchForm() // Refresh the entire form to get updated structure
        const location = subformId ? `subform ${getSubformPath(subformId)}` : "section"

        toast({
          title: "Success",
          description: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} field added to ${location} successfully`,
        })
      } else {
        throw new Error(result.error || "Failed to create field")
      }
    } catch (error: any) {
      console.error("❌ Error creating field:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }
  const createSubform = async (sectionId?: string, parentSubformId?: string) => {
    if (!form) return
    try {
      // Generate next path number for the subform
      let nextPath = "1"
      if (parentSubformId) {
        const parentHierarchy = subformHierarchyMap.get(parentSubformId)
        if (parentHierarchy) {
          const siblingCount = parentHierarchy.children.length
          nextPath = `${parentHierarchy.path}.${siblingCount + 1}`
        }
      } else if (sectionId) {
        // Count existing root-level subforms in this section
        const section = form.sections.find((s) => s.id === sectionId)
        if (section) {
          const rootSubformsCount = section.subforms.filter((sub) => !sub.parentSubformId).length
          nextPath = `${rootSubformsCount + 1}`
        }
      }
      const subformData = {
        sectionId: parentSubformId ? undefined : sectionId,
        parentSubformId: parentSubformId,
        name: `Subform ${nextPath}`,
        description: "",
        order: 0, // Will be calculated by API
        columns: 1,
        visible: true,
        collapsible: true,
        collapsed: false,
      }
      console.log("Creating subform with data:", subformData)
      const response = await fetch("/api/subforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subformData),
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Subform creation failed:", response.status, errorText)
        throw new Error(`Failed to create subform: ${response.status} ${errorText}`)
      }
      const result = await response.json()
      if (result.success) {
        await fetchForm() // Refresh the entire form to get updated structure
        const parentPath = parentSubformId ? getSubformPath(parentSubformId) : "root"
        toast({
          title: "Success",
          description: `Subform ${nextPath} created successfully${parentSubformId ? ` under ${parentPath}` : ""}`,
        })
        return result.data // Return the created subform for immediate use
      } else {
        throw new Error(result.error || "Failed to create subform")
      }
    } catch (error: any) {
      console.error("Error creating subform:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  // FIXED: Enhanced lookup field creation to support subforms
  const handleLookupFieldsConfirm = async (lookupFields: Partial<FormField>[]) => {
    if ((!pendingLookupSectionId && !pendingLookupSubformId) || !form) return

    try {
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
          } as FormField

          createdFields.push(savedField)
        }
      }
      await fetchForm() // Refresh the entire form

      // Show success message with location info
      const location = pendingLookupSubformId ? `subform ${getSubformPath(pendingLookupSubformId)}` : "section"

      toast({
        title: "Success",
        description: `${createdFields.length} lookup field${createdFields.length !== 1 ? "s" : ""} created in ${location} successfully`,
      })

      setPendingLookupSectionId(null)
      setPendingLookupSubformId(null)
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
      // The form structure is already maintained by the drag & drop operations
      // We just need to save the form metadata
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
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">{form.name}</h1>
                    {form.isUserForm && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                        <Users className="w-3 h-3 mr-1" />
                        User Form
                      </Badge>
                    )}
                    {form.isEmployeeForm && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Employee Form
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsUserFormSettingsOpen(true)} className="text-xs">
                <Settings className="mr-2 h-3 w-3" />
                Form Settings
              </Button>
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
            <FormCanvas
              form={form}
              onFormUpdate={handleFormUpdate}
              fetchForm={fetchForm}
              subformHierarchyMap={subformHierarchyMap}
              getSubformPath={getSubformPath}
              getFullSubformPath={getFullSubformPath}
              getParentChildDisplay={getParentChildDisplay}
              getAncestorPaths={getAncestorPaths}
            />
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
            {activeItem?.hasOwnProperty("childSubforms") && (
              <div style={{ zIndex: 10000 }}>
                <SubformComponent
                  subform={activeItem as Subform}
                  isOverlay
                  onUpdateSubform={() => { }}
                  onDeleteSubform={() => { }}
                  onUpdateField={handleUpdateField}
                  onDeleteField={handleDeleteField}
                />
              </div>
            )}
            {activeItem?.hasOwnProperty("subforms") && !activeItem?.hasOwnProperty("childSubforms") && (
              <div style={{ zIndex: 10000 }}>
                <SectionComponent
                  section={activeItem as FormSection}
                  isOverlay
                  onUpdateSection={() => { }}
                  onDeleteSection={async () => { }}
                  onUpdateField={handleUpdateField}
                  onDeleteField={handleDeleteField}
                  onAddSubform={async () => { }}
                  onUpdateSubform={async () => { }}
                  onDeleteSubform={() => { }}
                />
              </div>
            )}
            {activeItem &&
              !activeItem.hasOwnProperty("fields") &&
              !activeItem.hasOwnProperty("subforms") &&
              !activeItem.hasOwnProperty("childSubforms") && (
                <div style={{ zIndex: 10000 }}>
                  <FieldComponent
                    field={activeItem as FormField}
                    isOverlay
                    onUpdate={async () => { }}
                    onDelete={() => { }}
                    onCopy={() => { }}
                  />
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
