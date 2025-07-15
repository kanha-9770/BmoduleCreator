"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Header } from "./header"
import { DynamicSidebar } from "./sidebar"

const publicRoutes = ["/login", "/auth/signin", "/unauthorized"]

export function ConditionalLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex h-screen bg-gray-50">
      <DynamicSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
