import { prisma } from "@/lib/prisma"

export class DatabaseTransforms {
  // Transform database module to frontend format
  static transformModule(rawModule: any, level?: number): any {
    return {
      id: rawModule.id,
      name: rawModule.name,
      description: rawModule.description,
      icon: rawModule.icon,
      color: rawModule.color,
      moduleType: rawModule.moduleType || "standard",
      level: level !== undefined ? level : rawModule.level || 0,
      path: rawModule.path || rawModule.name.toLowerCase().replace(/\s+/g, '-'),
      isActive: rawModule.isActive !== false,
      sortOrder: rawModule.sortOrder || 0,
      parentId: rawModule.parentId,
      forms: rawModule.forms ? rawModule.forms.map((form: any) => this.transformForm(form)) : [],
      children: rawModule.children ? rawModule.children.map((child: any) => this.transformModule(child, (level || 0) + 1)) : [],
      createdAt: rawModule.createdAt,
      updatedAt: rawModule.updatedAt,
      recordCount: this.calculateRecordCount(rawModule)
    }
  }

  // Transform database form to frontend format
  static transformForm(rawForm: any): any {
    return {
      id: rawForm.id,
      moduleId: rawForm.moduleId,
      name: rawForm.name,
      description: rawForm.description,
      settings: rawForm.settings || {},
      isPublished: rawForm.isPublished || false,
      publishedAt: rawForm.publishedAt,
      formUrl: rawForm.formUrl,
      allowAnonymous: rawForm.allowAnonymous !== false,
      requireLogin: rawForm.requireLogin || false,
      maxSubmissions: rawForm.maxSubmissions,
      submissionMessage: rawForm.submissionMessage,
      conditional: rawForm.conditional,
      styling: rawForm.styling,
      isUserForm: rawForm.isUserForm || false,
      isEmployeeForm: rawForm.isEmployeeForm || false,
      sections: rawForm.sections ? rawForm.sections.map((section: any) => this.transformSection(section)) : [],
      createdAt: rawForm.createdAt,
      updatedAt: rawForm.updatedAt,
      recordCount: this.calculateRecordCount(rawForm),
      tableMapping: rawForm.tableMapping
    }
  }

  // Transform database section to frontend format
  static transformSection(rawSection: any): any {
    return {
      id: rawSection.id,
      formId: rawSection.formId,
      title: rawSection.title,
      description: rawSection.description,
      order: rawSection.order || 0,
      columns: rawSection.columns || 1,
      visible: rawSection.visible !== false,
      collapsible: rawSection.collapsible || false,
      collapsed: rawSection.collapsed || false,
      conditional: rawSection.conditional,
      styling: rawSection.styling,
      fields: rawSection.fields ? rawSection.fields.map((field: any) => this.transformField(field)) : [],
      subforms: rawSection.subforms ? rawSection.subforms.map((subform: any) => this.transformSubform(subform)) : [],
      createdAt: rawSection.createdAt,
      updatedAt: rawSection.updatedAt
    }
  }

  // Transform database field to frontend format
  static transformField(rawField: any): any {
    return {
      id: rawField.id,
      sectionId: rawField.sectionId,
      subformId: rawField.subformId,
      type: rawField.type,
      label: rawField.label,
      placeholder: rawField.placeholder,
      description: rawField.description,
      defaultValue: rawField.defaultValue,
      options: rawField.options || [],
      validation: rawField.validation || {},
      visible: rawField.visible !== false,
      readonly: rawField.readonly || false,
      width: rawField.width || "full",
      order: rawField.order || 0,
      conditional: rawField.conditional,
      styling: rawField.styling,
      properties: rawField.properties,
      formula: rawField.formula,
      rollup: rawField.rollup,
      lookup: rawField.lookup,
      createdAt: rawField.createdAt,
      updatedAt: rawField.updatedAt
    }
  }

  // Transform database record to frontend format
  static transformRecord(rawRecord: any): any {
    return {
      id: rawRecord.id,
      formId: rawRecord.formId,
      recordData: rawRecord.recordData || {},
      employee_id: rawRecord.employee_id,
      amount: rawRecord.amount ? parseFloat(rawRecord.amount.toString()) : null,
      date: rawRecord.date,
      submittedBy: rawRecord.submittedBy,
      submittedAt: rawRecord.submittedAt,
      ipAddress: rawRecord.ipAddress,
      userAgent: rawRecord.userAgent,
      status: rawRecord.status || "submitted",
      createdAt: rawRecord.createdAt,
      updatedAt: rawRecord.updatedAt
    }
  }

  // Transform database subform to frontend format
  static transformSubform(rawSubform: any): any {
    return {
      id: rawSubform.id,
      sectionId: rawSubform.sectionId,
      name: rawSubform.name,
      order: rawSubform.order || 0,
      fields: rawSubform.fields ? rawSubform.fields.map((field: any) => this.transformField(field)) : [],
      records: rawSubform.records ? rawSubform.records.map((record: any) => this.transformRecord(record)) : [],
      createdAt: rawSubform.createdAt,
      updatedAt: rawSubform.updatedAt
    }
  }

  // Calculate record count from _count or records array
  static calculateRecordCount(entity: any): number {
    if (entity._count) {
      // Sum all record counts from different tables
      return Object.keys(entity._count)
        .filter(key => key.startsWith('records'))
        .reduce((sum, key) => sum + (entity._count[key] || 0), 0)
    }
    
    if (entity.records && Array.isArray(entity.records)) {
      return entity.records.length
    }
    
    return 0
  }

  // Transform multiple records
  static transformRecords(rawRecords: any[]): any[] {
    return rawRecords.map(record => this.transformRecord(record))
  }

  // Transform module hierarchy recursively
  static transformModuleHierarchy(rawModule: any, level: number = 0): any {
    const transformedModule = this.transformModule(rawModule, level)
    
    if (rawModule.children && rawModule.children.length > 0) {
      transformedModule.children = rawModule.children.map((child: any) => 
        this.transformModuleHierarchy(child, level + 1)
      )
    }
    
    return transformedModule
  }

  // Flatten module hierarchy to a flat array
  static flattenModuleHierarchy(modules: any[]): any[] {
    const flattened: any[] = []
    
    const flatten = (moduleList: any[]) => {
      moduleList.forEach(module => {
        flattened.push(module)
        if (module.children && module.children.length > 0) {
          flatten(module.children)
        }
      })
    }
    
    flatten(modules)
    return flattened
  }

  // Get the appropriate table name for form records
  static async getFormRecordTable(formId: string): Promise<string> {
    try {
      // Check if form has a specific table mapping
      const tableMapping = await prisma.formTableMapping.findUnique({
        where: { formId }
      })

      if (tableMapping) {
        console.log(`Form ${formId} mapped to table: ${tableMapping.storageTable}`)
        return tableMapping.storageTable
      }

      // Check if this is a user form or employee form
      const form = await prisma.form.findUnique({
        where: { id: formId },
        select: { isUserForm: true, isEmployeeForm: true }
      })

      if (form?.isUserForm) {
        // User forms go to form_records_15
        const tableName = "form_records_15"
        await this.createTableMapping(formId, tableName)
        return tableName
      }

      if (form?.isEmployeeForm) {
        // Employee forms go to form_records_14
        const tableName = "form_records_14"
        await this.createTableMapping(formId, tableName)
        return tableName
      }

      // For regular forms, find the least used table (1-13)
      const tableCounts = await Promise.all([
        prisma.formRecord1.count(),
        prisma.formRecord2.count(),
        prisma.formRecord3.count(),
        prisma.formRecord4.count(),
        prisma.formRecord5.count(),
        prisma.formRecord6.count(),
        prisma.formRecord7.count(),
        prisma.formRecord8.count(),
        prisma.formRecord9.count(),
        prisma.formRecord10.count(),
        prisma.formRecord11.count(),
        prisma.formRecord12.count(),
        prisma.formRecord13.count(),
      ])

      // Find the table with the least records
      const minCount = Math.min(...tableCounts)
      const tableIndex = tableCounts.indexOf(minCount) + 1
      const tableName = `form_records_${tableIndex}`

      // Create mapping
      await this.createTableMapping(formId, tableName)
      
      console.log(`Assigned form ${formId} to table: ${tableName}`)
      return tableName
    } catch (error: any) {
      console.error("Error determining form record table:", error)
      // Default fallback
      return "form_records_1"
    }
  }

  // Create table mapping
  private static async createTableMapping(formId: string, tableName: string): Promise<void> {
    try {
      await prisma.formTableMapping.upsert({
        where: { formId },
        update: { storageTable: tableName },
        create: { formId, storageTable: tableName }
      })
    } catch (error: any) {
      console.error("Error creating table mapping:", error)
    }
  }
}