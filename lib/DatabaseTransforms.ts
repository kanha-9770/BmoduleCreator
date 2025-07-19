import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import type { FormModule, Form, FormSection, FormField, FormRecord } from "@/types/form-builder"

export class DatabaseTransforms {
  // Helper method to transform raw module data to include hierarchy fields
  static transformModule(rawModule: any, level = 0, parentPath = ""): FormModule {
    const settings = (rawModule.settings || {}) as Record<string, any>

    // Extract hierarchy data from settings or calculate defaults
    const moduleType = rawModule.moduleType || (level === 0 ? "master" : "child")
    const modulePath = rawModule.path || rawModule.name.toLowerCase().replace(/\s+/g, "-")
    const fullPath = parentPath ? `${parentPath}/${modulePath}` : modulePath

    return {
      ...rawModule,
      settings,
      // Add hierarchy fields that don't exist in Prisma schema
      parentId: rawModule.parentId || null,
      parent: rawModule.parent || null,
      children: rawModule.children
        ? rawModule.children.map((child: any) => this.transformModule(child, level + 1, fullPath))
        : [],
      moduleType: moduleType as "master" | "child" | "standard",
      level: rawModule.level || level,
      path: rawModule.path || fullPath,
      isActive: rawModule.isActive ?? true,
      sortOrder: rawModule.sortOrder || 0,
      forms: rawModule.forms ? rawModule.forms.map((form: any) => this.transformForm(form)) : [],
    }
  }

  // Helper method to transform form data
  static transformForm(rawForm: any): Form {
    return {
      ...rawForm,
      settings: (rawForm.settings || {}) as Record<string, any>,
      conditional: rawForm.conditional || null,
      styling: rawForm.styling || null,
      sections: rawForm.sections ? rawForm.sections.map((s: any) => this.transformSection(s)) : [],
      recordCount: this.calculateRecordCount(rawForm),
      records: this.transformRecords(rawForm),
    }
  }

  // Calculate total record count from all record tables
  static calculateRecordCount(form: any): number {
    if (!form._count) return 0

    return (
      (form._count.records1 || 0) +
      (form._count.records2 || 0) +
      (form._count.records3 || 0) +
      (form._count.records4 || 0) +
      (form._count.records5 || 0) +
      (form._count.records6 || 0) +
      (form._count.records7 || 0) +
      (form._count.records8 || 0) +
      (form._count.records9 || 0) +
      (form._count.records10 || 0) +
      (form._count.records11 || 0) +
      (form._count.records12 || 0) +
      (form._count.records13 || 0) +
      (form._count.records14 || 0) +
      (form._count.records15 || 0)
    )
  }

  // Transform records from all tables
  static transformRecords(form: any): any[] {
    const allRecords = [
      ...(form.records1 || []),
      ...(form.records2 || []),
      ...(form.records3 || []),
      ...(form.records4 || []),
      ...(form.records5 || []),
      ...(form.records6 || []),
      ...(form.records7 || []),
      ...(form.records8 || []),
      ...(form.records9 || []),
      ...(form.records10 || []),
      ...(form.records11 || []),
      ...(form.records12 || []),
      ...(form.records13 || []),
      ...(form.records14 || []),
      ...(form.records15 || []),
    ]

    return allRecords.map((r) => this.transformRecord(r))
  }

  // Helper method to transform section data
  static transformSection(rawSection: any): FormSection {
    return {
      ...rawSection,
      conditional: (rawSection.conditional || null) as Record<string, any> | null,
      styling: (rawSection.styling || null) as Record<string, any> | null,
      fields: rawSection.fields ? rawSection.fields.map((f: any) => this.transformField(f)) : [],
      subforms: rawSection.subforms ? rawSection.subforms.map((sf: any) => this.transformSubform(sf)) : [],
    }
  }

  // Helper method to transform field data
  static transformField(rawField: any): FormField {
    return {
      ...rawField,
      options: (rawField.options || []) as any[],
      validation: (rawField.validation || {}) as Record<string, any>,
      conditional: (rawField.conditional || null) as Record<string, any> | null,
      styling: (rawField.styling || null) as Record<string, any> | null,
      properties: (rawField.properties || null) as Record<string, any> | null,
      rollup: (rawField.rollup || null) as Record<string, any> | null,
      lookup: (rawField.lookup || null) as any,
      width: (rawField.width as "full" | "half" | "third" | "quarter") || "full",
    }
  }

  // Helper method to transform subform data
  static transformSubform(rawSubform: any): any {
    return {
      ...rawSubform,
      fields: rawSubform.fields ? rawSubform.fields.map((f: any) => this.transformField(f)) : [],
      records: rawSubform.records
        ? rawSubform.records.map((r: any) => ({
          ...r,
          recordData: (r.data || {}) as Record<string, any>,
        }))
        : [],
    }
  }

  // Helper method to transform record data
  static transformRecord(rawRecord: any): FormRecord {
    return {
      ...rawRecord,
      recordData: (rawRecord.recordData || {}) as Record<string, any>,
      employee_id: rawRecord.employee_id || null,
      amount: rawRecord.amount ? Number(rawRecord.amount) : null,
      date: rawRecord.date || null,
      ipAddress: rawRecord.ipAddress || undefined,
      userAgent: rawRecord.userAgent || undefined,
      createdAt: rawRecord.createdAt || rawRecord.updatedAt,
      updatedAt: rawRecord.updatedAt,
    }
  }

  // Recursive helper to transform hierarchy with proper levels
  static transformModuleHierarchy(module: any, level: number): FormModule {
    const transformed = this.transformModule(module, level)

    if (module.children && module.children.length > 0) {
      transformed.children = module.children.map((child: any) => this.transformModuleHierarchy(child, level + 1))
    }

    return transformed
  }

  // Flatten hierarchy into a flat list
  static flattenModuleHierarchy(modules: FormModule[]): FormModule[] {
    const flattened: FormModule[] = []

    const flatten = (moduleList: FormModule[]) => {
      for (const module of moduleList) {
        flattened.push(module)
        if (module.children && module.children.length > 0) {
          flatten(module.children)
        }
      }
    }

    flatten(modules)
    return flattened
  }

  // Get the appropriate record table for a form
  static async getFormRecordTable(formId: string): Promise<string> {
    // First check if the form is a user form
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { isUserForm: true },
    })

    // If it's a user form, always use form_records_15
    if (form?.isUserForm === true) {
      console.log(`Form ${formId} is a user form, using form_records_15`)
      
      // Ensure mapping exists for user forms
      const mapping = await prisma.formTableMapping.findUnique({
        where: { formId },
      })

      if (!mapping) {
        await prisma.formTableMapping.create({
          data: {
            formId,
            storageTable: "form_records_15",
          },
        })
        console.log(`Created table mapping for user form ${formId} -> form_records_15`)
      } else if (mapping.storageTable !== "form_records_15") {
        // Update existing mapping to point to form_records_15 for user forms
        await prisma.formTableMapping.update({
          where: { formId },
          data: { storageTable: "form_records_15" },
        })
        console.log(`Updated table mapping for user form ${formId} -> form_records_15`)
      }

      return "form_records_15"
    }

    // For non-user forms, use existing logic
    // Check if form has a mapping
    const mapping = await prisma.formTableMapping.findUnique({
      where: { formId },
    })

    if (mapping && mapping.storageTable !== "form_records_15") {
      // Ensure non-user forms don't use form_records_15
      return mapping.storageTable
    }

    // If no mapping exists, find the next available table (excluding table 15 for user forms)
    for (let i = 1; i <= 14; i++) {
      const tableName = `form_records_${i}`

      // Check if this table is already assigned to another form
      const existingMapping = await prisma.formTableMapping.findFirst({
        where: { storageTable: tableName },
      })

      if (!existingMapping) {
        // Create mapping for this form
        await prisma.formTableMapping.create({
          data: {
            formId,
            storageTable: tableName,
          },
        })
        console.log(`Created table mapping for regular form ${formId} -> ${tableName}`)
        return tableName
      }
    }

    // If all tables 1-14 are taken, use table 1 (this should be handled better in production)
    console.warn(`All tables 1-14 are taken, using form_records_1 for form ${formId}`)
    return "form_records_1"
  }
}