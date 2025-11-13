import { prisma } from "@/lib/prisma"

interface LookupOptions {
  search?: string
  limit?: number
  offset?: number
}

interface LookupSourceData {
  id: string
  name: string
  description?: string | null
  type: string
  recordCount: number
  icon: string
}

const tableMappingCache = new Map<string, string>()

export class LookupService {
  private async getTableName(formId: string): Promise<string | null> {
    if (tableMappingCache.has(formId)) {
      return tableMappingCache.get(formId)!
    }

    const mapping = await prisma.formTableMapping.findUnique({
      where: { formId },
      select: { storageTable: true },
    })

    if (mapping) {
      tableMappingCache.set(formId, mapping.storageTable)
      return mapping.storageTable
    }

    return null
  }

  private getTableModel(tableName: string): any {
    const tableMap: Record<string, any> = {
      form_records_1: prisma.formRecord1,
      form_records_2: prisma.formRecord2,
      form_records_3: prisma.formRecord3,
      form_records_4: prisma.formRecord4,
      form_records_5: prisma.formRecord5,
      form_records_6: prisma.formRecord6,
      form_records_7: prisma.formRecord7,
      form_records_8: prisma.formRecord8,
      form_records_9: prisma.formRecord9,
      form_records_10: prisma.formRecord10,
      form_records_11: prisma.formRecord11,
      form_records_12: prisma.formRecord12,
      form_records_13: prisma.formRecord13,
      form_records_14: prisma.formRecord14,
      form_records_15: prisma.formRecord15,
    }
    return tableMap[tableName]
  }

  private async getFormRecords(formId: string, options: { limit?: number; offset?: number } = {}): Promise<any[]> {
    const { limit = 50, offset = 0 } = options

    const tableName = await this.getTableName(formId)
    if (!tableName) {
      return []
    }

    const model = this.getTableModel(tableName)
    if (!model) {
      return []
    }

    const records = await model.findMany({
      where: { formId },
      orderBy: { createdAt: "desc" as const },
      take: limit,
      skip: offset,
      select: {
        id: true,
        recordData: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return records
  }

  private async countFormRecords(formId: string): Promise<number> {
    const tableName = await this.getTableName(formId)
    if (!tableName) return 0

    const model = this.getTableModel(tableName)
    if (!model) return 0

    return await model.count({ where: { formId } })
  }

  private transformRecord(record: any, form: any, module?: any): any {
    const recordData = record.recordData as any
    const transformedData: any = {
      record_id: record.id,
      form_id: form.id,
      _recordId: record.id,
      _formId: form.id,
      _formName: form.name,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }

    if (module) {
      transformedData._moduleId = module.id
      transformedData._moduleName = module.name
    }

    for (const [key, value] of Object.entries(recordData)) {
      const fieldData = value as any
      const fieldType = fieldData?.type || "text"
      let fieldValue = fieldData?.value

      // Type conversion
      if (fieldType === "number" && fieldValue != null) {
        const num = Number(fieldValue)
        fieldValue = isNaN(num) ? fieldValue : num
      } else if ((fieldType === "datetime" || fieldType === "date") && fieldValue) {
        try {
          const date = new Date(fieldValue)
          fieldValue = fieldType === "date" ? date.toISOString().split("T")[0] : date.toISOString()
        } catch {
          // Keep original value
        }
      } else if (fieldType === "checkbox") {
        fieldValue = Boolean(fieldValue)
      } else if (["tel", "email", "url"].includes(fieldType)) {
        fieldValue = String(fieldValue)
      }

      // Parse options and validation only if they exist
      let parsedOptions = null
      let parsedValidation = null

      if (fieldData?.options != null) {
        try {
          parsedOptions = typeof fieldData.options === "string" ? JSON.parse(fieldData.options) : fieldData.options
        } catch {
          parsedOptions = []
        }
      }

      if (fieldData?.validation != null) {
        try {
          parsedValidation =
            typeof fieldData.validation === "string" ? JSON.parse(fieldData.validation) : fieldData.validation
        } catch {
          parsedValidation = {}
        }
      }

      transformedData[key] = {
        field_id: fieldData?.fieldId || key,
        field_value: fieldValue,
        field_label: fieldData?.label || key,
        field_type: fieldType,
        field_section_id: fieldData?.sectionId || null,
        field_options: parsedOptions,
        field_validation: parsedValidation,
      }
    }

    return transformedData
  }

  private matchesSearch(transformedData: any, search: string): boolean {
    const searchLower = search.toLowerCase()
    return Object.values(transformedData).some((field: any) => {
      const value = field?.field_value
      return value != null && typeof value === "string" && value.toLowerCase().includes(searchLower)
    })
  }

  async getData(sourceId: string, options: LookupOptions = {}): Promise<any[]> {
    const { search = "", limit = 50, offset = 0 } = options

    try {
      const lookupSource = await prisma.lookupSource.findUnique({
        where: { id: sourceId },
        include: {
          sourceModule: true,
          sourceForm: { select: { id: true, name: true } },
        },
      })

      if (!lookupSource) {
        return []
      }

      if (lookupSource.type === "form" && lookupSource.sourceFormId) {
        const form = lookupSource.sourceForm
        if (!form) return []

        const records = await this.getFormRecords(form.id, { limit: limit * 2, offset }) // Fetch extra for filtering

        const transformedRecords = records
          .map((record) => this.transformRecord(record, form))
          .filter((record) => !search || this.matchesSearch(record, search))
          .slice(0, limit)

        return transformedRecords
      }

      if (lookupSource.type === "module" && lookupSource.sourceModuleId) {
        const module = await prisma.formModule.findUnique({
          where: { id: lookupSource.sourceModuleId },
          include: {
            forms: {
              select: { id: true, name: true },
            },
          },
        })

        if (!module || module.forms.length === 0) return []

        const limitPerForm = Math.ceil((limit * 2) / module.forms.length)

        const allRecordsPromises = module.forms.map((form) =>
          this.getFormRecords(form.id, { limit: limitPerForm }).then((records) => ({
            form,
            records,
          })),
        )

        const allRecordsResults = await Promise.all(allRecordsPromises)

        const transformedRecords: any[] = []
        for (const { form, records } of allRecordsResults) {
          for (const record of records) {
            const transformed = this.transformRecord(record, form, module)
            if (!search || this.matchesSearch(transformed, search)) {
              transformedRecords.push(transformed)
            }
          }
        }

        return transformedRecords.slice(0, limit)
      }

      return []
    } catch (error: any) {
      console.error("Error in LookupService.getData:", error.message)
      throw error
    }
  }

  async getFields(sourceId: string): Promise<string[]> {
    try {
      const lookupSource = await prisma.lookupSource.findUnique({
        where: { id: sourceId },
        include: {
          sourceForm: { select: { id: true } },
          sourceModule: {
            select: {
              id: true,
              forms: { select: { id: true } },
            },
          },
        },
      })

      if (!lookupSource) {
        return []
      }

      const fields = new Set<string>()

      const extractFields = (recordData: any) => {
        if (recordData && typeof recordData === "object") {
          for (const value of Object.values(recordData)) {
            const fieldData = value as any
            const fieldLabel = fieldData?.label || fieldData?.fieldId
            if (fieldLabel) fields.add(fieldLabel)
          }
        }
      }

      if (lookupSource.type === "form" && lookupSource.sourceForm) {
        const sampleRecords = await this.getFormRecords(lookupSource.sourceForm.id, { limit: 1 })
        if (sampleRecords.length > 0) {
          extractFields(sampleRecords[0].recordData)
        }
      } else if (lookupSource.type === "module" && lookupSource.sourceModule) {
        const fieldPromises = lookupSource.sourceModule.forms.map(async (form) => {
          const sampleRecords = await this.getFormRecords(form.id, { limit: 1 })
          if (sampleRecords.length > 0) {
            extractFields(sampleRecords[0].recordData)
          }
        })

        await Promise.all(fieldPromises)
      }

      return Array.from(fields)
    } catch (error) {
      console.error("Error in LookupService.getFields:", error)
      throw error
    }
  }

  static async getLookupSources(options: { quick?: boolean } = {}): Promise<LookupSourceData[]> {
    const { quick = false } = options

    try {
      // Fetch all modules with their forms in one query
      const modules = await prisma.formModule.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          forms: {
            select: {
              id: true,
              name: true,
              tableMapping: { select: { storageTable: true } },
            },
          },
        },
      })

      const allSources: LookupSourceData[] = []

      if (quick) {
        for (const module of modules) {
          // Module source without count
          allSources.push({
            id: `module_${module.id}`,
            name: module.name,
            description: module.description,
            type: "module",
            recordCount: 0, // Will be loaded later
            icon: "folder",
          })

          // Form sources without counts
          for (const form of module.forms) {
            allSources.push({
              id: `form_${form.id}`,
              name: `${form.name} (${module.name})`,
              description: `Records from ${form.name} form in ${module.name} module`,
              type: "form",
              recordCount: 0, // Will be loaded later
              icon: "document",
            })
          }
        }

        return allSources
      }

      const service = new LookupService()
      const modulePromises = modules.map(async (module) => {
        // Count records for all forms in parallel
        const countPromises = module.forms.map((form) => service.countFormRecords(form.id))
        const counts = await Promise.all(countPromises)
        const totalRecords = counts.reduce((sum, count) => sum + count, 0)

        const moduleSource: LookupSourceData = {
          id: `module_${module.id}`,
          name: module.name,
          description: module.description,
          type: "module",
          recordCount: totalRecords,
          icon: "folder",
        }

        const formSources: LookupSourceData[] = module.forms.map((form, index) => ({
          id: `form_${form.id}`,
          name: `${form.name} (${module.name})`,
          description: `Records from ${form.name} form in ${module.name} module`,
          type: "form",
          recordCount: counts[index],
          icon: "document",
        }))

        return [moduleSource, ...formSources]
      })

      const allSourcesArrays = await Promise.all(modulePromises)
      const sourcesWithCounts = allSourcesArrays.flat()

      Promise.all(
        sourcesWithCounts.map((source) =>
          prisma.lookupSource.upsert({
            where: { id: source.id },
            update: {
              name: source.name,
              type: source.type as any,
              description: source.description,
              active: true,
              updatedAt: new Date(),
            },
            create: {
              id: source.id,
              name: source.name,
              type: source.type as any,
              sourceModuleId: source.type === "module" ? source.id.replace("module_", "") : undefined,
              sourceFormId: source.type === "form" ? source.id.replace("form_", "") : undefined,
              description: source.description,
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          }),
        ),
      ).catch((error) => console.error("Background upsert error:", error))

      return sourcesWithCounts
    } catch (error) {
      console.error("Error fetching lookup sources:", error)
      return []
    }
  }
}
