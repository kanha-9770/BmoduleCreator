"use client"

import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "./context/AuthContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  )
}