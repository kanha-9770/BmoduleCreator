"use client"

import { usePathname } from "next/navigation"

import { Providers } from "@/components/providers"
import { useAuth } from "./context/AuthContext"
import { DynamicSidebar } from "./sidebar"
import { Header } from "./header"
import { LoadingSpinner } from "./LoadingSpinner"
import { PermissionProvider } from "@/lib/permission-context"

// Routes that should not show the main layout (sidebar + header)
const NO_LAYOUT_ROUTES = ["/login", "/register", "/forgot-password"]

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <PermissionProvider>
        <ConditionalLayoutInner>{children}</ConditionalLayoutInner></PermissionProvider>
    </Providers>
  )
}

function ConditionalLayoutInner({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth()
  const pathname = usePathname()

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />
  }

  // Check if current route should not show layout
  const shouldShowLayout = !NO_LAYOUT_ROUTES.some(route => pathname.startsWith(route))

  // If user is authenticated and route should show layout, render with sidebar and header
  if (isAuthenticated && shouldShowLayout) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DynamicSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // For public routes or unauthenticated users, render without layout
  return <>{children}</>
}