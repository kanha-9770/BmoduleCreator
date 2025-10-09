"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { Role, RoleFormData, OrganizationUnit, OrganizationUnitFormData } from "@/types/role"
import { useToast } from "@/hooks/use-toast"

interface RoleState {
  roles: Role[]
  organizationUnits: OrganizationUnit[]
  expandedNodes: Set<string>
  expandedOrgNodes: Set<string>
  selectedRole: Role | null
  selectedOrgUnit: OrganizationUnit | null
  isRoleSheetOpen: boolean
  isOrgFormOpen: boolean
  isHeaderCollapsed: boolean
  isTreeOnlyMode: boolean
  isStatsPopupOpen: boolean
  isOrgStatsPopupOpen: boolean
  loading: boolean
  error: string | null
  organizationId: string | null
}

type RoleAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ROLES"; payload: Role[] }
  | { type: "SET_ORGANIZATION_UNITS"; payload: OrganizationUnit[] }
  | { type: "ADD_ROLE"; payload: { parentId?: string; roleData: RoleFormData } }
  | { type: "UPDATE_ROLE"; payload: { roleId: string; roleData: Partial<RoleFormData> } }
  | { type: "DELETE_ROLE"; payload: { roleId: string } }
  | { type: "TOGGLE_EXPAND"; payload: { roleId: string } }
  | { type: "TOGGLE_ORG_EXPAND"; payload: { unitId: string } }
  | { type: "EXPAND_ALL" }
  | { type: "COLLAPSE_ALL" }
  | { type: "EXPAND_ALL_ORG" }
  | { type: "COLLAPSE_ALL_ORG" }
  | { type: "SELECT_ROLE"; payload: { role: Role | null } }
  | { type: "TOGGLE_ROLE_SHEET" }
  | { type: "OPEN_ROLE_SHEET" }
  | { type: "CLOSE_ROLE_SHEET" }
  | { type: "TOGGLE_HEADER_COLLAPSE" }
  | { type: "TOGGLE_TREE_ONLY_MODE" }
  | { type: "TOGGLE_STATS_POPUP" }
  | { type: "TOGGLE_ORG_STATS_POPUP" }
  | { type: "ADD_ORG_UNIT"; payload: { parentId?: string; unitData: OrganizationUnitFormData } }
  | { type: "UPDATE_ORG_UNIT"; payload: { unitId: string; unitData: Partial<OrganizationUnitFormData> } }
  | { type: "DELETE_ORG_UNIT"; payload: { unitId: string } }
  | { type: "SELECT_ORG_UNIT"; payload: { unit: OrganizationUnit | null } }
  | { type: "CLOSE_ORG_FORM" }
  | { type: "ASSIGN_ROLE_TO_UNIT"; payload: { unitId: string; roleId: string } }
  | { type: "REMOVE_ROLE_FROM_UNIT"; payload: { unitId: string; roleId: string } }
  | { type: "ASSIGN_USER_TO_UNIT"; payload: { unitId: string; userId: string; roleId: string } }
  | { type: "REMOVE_USER_FROM_UNIT"; payload: { unitId: string; userId: string } }
  | { type: "SET_ORGANIZATION_ID"; payload: string | null }

const initialState: RoleState = {
  roles: [],
  organizationUnits: [],
  expandedNodes: new Set(),
  expandedOrgNodes: new Set(),
  selectedRole: null,
  selectedOrgUnit: null,
  isRoleSheetOpen: false,
  isOrgFormOpen: false,
  isHeaderCollapsed: false,
  isTreeOnlyMode: false,
  isStatsPopupOpen: false,
  isOrgStatsPopupOpen: false,
  loading: false,
  error: null,
  organizationId: null,
}

const RoleContext = createContext<{
  state: RoleState
  dispatch: React.Dispatch<RoleAction>
  refreshData: () => Promise<void>
} | null>(null)

function roleReducer(state: RoleState, action: RoleAction): RoleState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }

    case "SET_ROLES":
      return { ...state, roles: action.payload, loading: false }

    case "SET_ORGANIZATION_UNITS":
      return { ...state, organizationUnits: action.payload, loading: false }

    case "SET_ORGANIZATION_ID":
      return { ...state, organizationId: action.payload }

    case "ADD_ROLE": {
      // This will be handled by API call and then refreshed
      return state
    }

    case "UPDATE_ROLE": {
      // This will be handled by API call and then refreshed
      return state
    }

    case "DELETE_ROLE": {
      // This will be handled by API call and then refreshed
      return state
    }

    case "TOGGLE_EXPAND": {
      const { roleId } = action.payload
      const newExpanded = new Set(state.expandedNodes)
      if (newExpanded.has(roleId)) {
        newExpanded.delete(roleId)
      } else {
        newExpanded.add(roleId)
      }
      return { ...state, expandedNodes: newExpanded }
    }

    case "TOGGLE_ORG_EXPAND": {
      const { unitId } = action.payload
      const newExpanded = new Set(state.expandedOrgNodes)
      if (newExpanded.has(unitId)) {
        newExpanded.delete(unitId)
      } else {
        newExpanded.add(unitId)
      }
      return { ...state, expandedOrgNodes: newExpanded }
    }

    case "EXPAND_ALL": {
      const allIds = getAllRoleIds(state.roles)
      return { ...state, expandedNodes: new Set(allIds) }
    }

    case "COLLAPSE_ALL": {
      return { ...state, expandedNodes: new Set() }
    }

    case "EXPAND_ALL_ORG": {
      const allIds = getAllOrgIds(state.organizationUnits)
      return { ...state, expandedOrgNodes: new Set(allIds) }
    }

    case "COLLAPSE_ALL_ORG": {
      return { ...state, expandedOrgNodes: new Set() }
    }

    case "SELECT_ROLE": {
      return { ...state, selectedRole: action.payload.role }
    }

    case "TOGGLE_ROLE_SHEET": {
      return { ...state, isRoleSheetOpen: !state.isRoleSheetOpen }
    }

    case "OPEN_ROLE_SHEET": {
      return { ...state, isRoleSheetOpen: true }
    }

    case "CLOSE_ROLE_SHEET": {
      return { ...state, isRoleSheetOpen: false }
    }

    case "TOGGLE_HEADER_COLLAPSE": {
      return { ...state, isHeaderCollapsed: !state.isHeaderCollapsed }
    }

    case "TOGGLE_TREE_ONLY_MODE": {
      return { ...state, isTreeOnlyMode: !state.isTreeOnlyMode }
    }

    case "TOGGLE_STATS_POPUP": {
      return { ...state, isStatsPopupOpen: !state.isStatsPopupOpen }
    }

    case "TOGGLE_ORG_STATS_POPUP": {
      return { ...state, isOrgStatsPopupOpen: !state.isOrgStatsPopupOpen }
    }

    case "ADD_ORG_UNIT": {
      // This will be handled by API call and then refreshed
      return state
    }

    case "UPDATE_ORG_UNIT": {
      // This will be handled by API call and then refreshed
      return state
    }

    case "DELETE_ORG_UNIT": {
      // This will be handled by API call and then refreshed
      return state
    }

    case "CLOSE_ORG_FORM": {
      return {
        ...state,
        selectedOrgUnit: null,
        isOrgFormOpen: false,
      }
    }

    case "SELECT_ORG_UNIT": {
      const unit = action.payload.unit
      return {
        ...state,
        selectedOrgUnit: unit,
        isOrgFormOpen: !!unit,
      }
    }

    case "ASSIGN_ROLE_TO_UNIT": {
      // This will be handled by API call and then refreshed
      return state
    }

    case "REMOVE_ROLE_FROM_UNIT": {
      // This will be handled by API call and then refreshed
      return state
    }

    case "ASSIGN_USER_TO_UNIT": {
      // This will be handled by API call and then refreshed
      return state
    }

    case "REMOVE_USER_FROM_UNIT": {
      // This will be handled by API call and then refreshed
      return state
    }

    default:
      return state
  }
}

// Helper functions
function getAllRoleIds(roles: Role[]): string[] {
  const ids: string[] = []
  roles.forEach((role) => {
    ids.push(role.id)
    ids.push(...getAllRoleIds(role.children))
  })
  return ids
}

function getAllOrgIds(units: OrganizationUnit[]): string[] {
  const ids: string[] = []
  units.forEach((unit) => {
    ids.push(unit.id)
    ids.push(...getAllOrgIds(unit.children))
  })
  return ids
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(roleReducer, initialState)
  const { toast } = useToast()

  const fetchUserOrganization = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const response = await fetch("/api/auth/me")
      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }
      const result = await response.json()
      if (result.user?.organization?.id) {
        dispatch({ type: "SET_ORGANIZATION_ID", payload: result.user.organization.id })
      } else {
        throw new Error("Organization ID not found")
      }
    } catch (error) {
      console.error("Error fetching organization ID:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to load organization data" })
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const refreshData = async () => {
    if (!state.organizationId) {
      return // Wait until organizationId is set
    }
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      // Ensure organization exists
      await fetch("/api/organizations/ensure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: state.organizationId,
          name: "Default Organization",
        }),
      })

      // Fetch roles
      const rolesResponse = await fetch(`/api/organizations/${state.organizationId}/roles`)
      if (rolesResponse.ok) {
        const roles = await rolesResponse.json()
        dispatch({ type: "SET_ROLES", payload: roles })
      }

      // Fetch organization units
      const unitsResponse = await fetch(`/api/organizations/${state.organizationId}/units`)
      if (unitsResponse.ok) {
        const units = await unitsResponse.json()
        dispatch({ type: "SET_ORGANIZATION_UNITS", payload: units })
      }

      dispatch({ type: "SET_ERROR", payload: null })
    } catch (error) {
      console.error("Error refreshing data:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to load data" })
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  // Load initial user data
  useEffect(() => {
    fetchUserOrganization()
  }, [])

  // Refresh data when organizationId changes
  useEffect(() => {
    if (state.organizationId) {
      refreshData()
    }
  }, [state.organizationId])

  return <RoleContext.Provider value={{ state, dispatch, refreshData }}>{children}</RoleContext.Provider>
}

export function useRoles() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error("useRoles must be used within a RoleProvider")
  }
  return context
}