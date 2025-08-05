"use client"

import { Providers } from "@/components/providers"
import { DynamicSidebar } from "./sidebar"
import { Header } from "./header"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex h-screen bg-gray-50">
        <DynamicSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  )
}