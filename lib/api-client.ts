import type { ApiResponse } from "@/types/auth"

export class ApiClient {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

  /**
   * Make authenticated API request with user credentials or token
   */
  static async request<T = any>(
    endpoint: string,
    options: RequestInit & {
      userId?: string
      userEmail?: string
      useToken?: boolean
    } = {}
  ): Promise<ApiResponse<T>> {
    const { userId, userEmail, useToken = false, ...requestOptions } = options

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(requestOptions.headers as Record<string, string>),
    }

    // Add authentication headers
    if (useToken) {
      // Use token-based authentication (for existing auth system)
      const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    } else {
      // Use user credentials for RBAC system
      if (userId) {
        headers["x-user-id"] = userId
      }
      if (userEmail) {
        headers["x-user-email"] = userEmail
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...requestOptions,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error: any) {
      console.error(`API request failed for ${endpoint}:`, error)
      return {
        success: false,
        error: error.message || "Request failed",
      }
    }
  }

  /**
   * GET request with authentication
   */
  static async get<T = any>(
    endpoint: string,
    userId?: string,
    userEmail?: string,
    useToken = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "GET",
      userId,
      userEmail,
      useToken,
    })
  }

  /**
   * POST request with authentication
   */
  static async post<T = any>(
    endpoint: string,
    data: any,
    userId?: string,
    userEmail?: string,
    useToken = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      userId,
      userEmail,
      useToken,
    })
  }

  /**
   * PUT request with authentication
   */
  static async put<T = any>(
    endpoint: string,
    data: any,
    userId?: string,
    userEmail?: string,
    useToken = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      userId,
      userEmail,
      useToken,
    })
  }

  /**
   * DELETE request with authentication
   */
  static async delete<T = any>(
    endpoint: string,
    userId?: string,
    userEmail?: string,
    useToken = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      userId,
      userEmail,
      useToken,
    })
  }
}