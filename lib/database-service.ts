import { DatabaseTransforms } from "./DatabaseTransforms"
import { DatabaseRecords } from "./DatabaseRecords"
import { DatabaseModules } from "./DatabaseModules"
import { DatabaseRoles } from "./DatabaseRoles"

export class DatabaseService {
  // Data transformation methods
  static transformModule = DatabaseTransforms.transformModule
  static transformForm = DatabaseTransforms.transformForm
  static transformSection = DatabaseTransforms.transformSection
  static transformField = DatabaseTransforms.transformField
  static transformRecord = DatabaseTransforms.transformRecord
  static transformSubform = DatabaseTransforms.transformSubform
  static calculateRecordCount = DatabaseTransforms.calculateRecordCount
  static transformRecords = DatabaseTransforms.transformRecords
  static transformModuleHierarchy = DatabaseTransforms.transformModuleHierarchy
  static flattenModuleHierarchy = DatabaseTransforms.flattenModuleHierarchy
  static getFormRecordTable = DatabaseTransforms.getFormRecordTable

  // Module operations
  static createModule = DatabaseModules.createModule
  static getModuleHierarchy = DatabaseModules.getModuleHierarchy
  static getModules = DatabaseModules.getModules
  static getModule = DatabaseModules.getModule
  static updateModule = DatabaseModules.updateModule
  static moveModule = DatabaseModules.moveModule
  static deleteModule = DatabaseModules.deleteModule

  // Form operations
  static createForm = DatabaseModules.createForm
  static getForms = DatabaseModules.getForms
  static getForm = DatabaseModules.getForm
  static updateForm = DatabaseModules.updateForm
  static deleteForm = DatabaseModules.deleteForm
  static publishForm = DatabaseModules.publishForm
  static unpublishForm = DatabaseModules.unpublishForm

  // Section operations
  static createSection = DatabaseModules.createSection
  static getSections = DatabaseModules.getSections
  static updateSection = DatabaseModules.updateSection
  static deleteSection = DatabaseModules.deleteSection
  static deleteSectionWithCleanup = DatabaseModules.deleteSectionWithCleanup

  // Field operations
  static createField = DatabaseModules.createField
  static getFields = DatabaseModules.getFields
  static updateField = DatabaseModules.updateField
  static deleteField = DatabaseModules.deleteField

  // Field types
  static getFieldTypes = DatabaseModules.getFieldTypes
  static upsertFieldType = DatabaseModules.upsertFieldType
  static seedFieldTypes = DatabaseModules.seedFieldTypes

  // User authentication methods
  static getUserRecords = DatabaseRecords.getUserRecords
  static updateUserLastLogin = DatabaseRecords.updateUserLastLogin
  static createUser = DatabaseRecords.createUser
  static getUserById = DatabaseRecords.getUserById
  static updateUserProfile = DatabaseRecords.updateUserProfile

  // Form record operations
  static createFormRecord = DatabaseRecords.createFormRecord
  static getFormRecords = DatabaseRecords.getFormRecords
  static getFormSubmissionCount = DatabaseRecords.getFormSubmissionCount
  static getFormRecord = DatabaseRecords.getFormRecord
  static updateFormRecord = DatabaseRecords.updateFormRecord
  static deleteFormRecord = DatabaseRecords.deleteFormRecord

  // Analytics
  static trackFormEvent = DatabaseRecords.trackFormEvent
  static getFormAnalytics = DatabaseRecords.getFormAnalytics

  // Lookup and relationship methods
  static getLookupSources = DatabaseRecords.getLookupSources
  static getLinkedRecords = DatabaseRecords.getLinkedRecords

  // RBAC operations
  static createRole = DatabaseRoles.createRole
  static getRoles = DatabaseRoles.getRoles
  static getRole = DatabaseRoles.getRole
  static updateRole = DatabaseRoles.updateRole
  static deleteRole = DatabaseRoles.deleteRole
  static createPermission = DatabaseRoles.createPermission
  static getPermissions = DatabaseRoles.getPermissions
  static getPermission = DatabaseRoles.getPermission
  static updatePermission = DatabaseRoles.updatePermission
  static deletePermission = DatabaseRoles.deletePermission
  static assignPermissionsToRole = DatabaseRoles.assignPermissionsToRole
  static removePermissionsFromRole = DatabaseRoles.removePermissionsFromRole
  static assignRoleToUser = DatabaseRoles.assignRoleToUser
  static getUserPermissions = DatabaseRoles.getUserPermissions
  static checkUserPermission = DatabaseRoles.checkUserPermission
  static createResourcePermissions = DatabaseRoles.createResourcePermissions
  static deleteResourcePermissions = DatabaseRoles.deleteResourcePermissions
  static seedDefaultRoles = DatabaseRoles.seedDefaultRoles
}