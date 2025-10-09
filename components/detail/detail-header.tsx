"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface DetailHeaderProps {
  title: string
  subtitle?: string
  status?: string
  statusVariant?: "default" | "secondary" | "destructive" | "outline"
  backUrl: string
  actions?: Array<{
    label: string
    icon: React.ComponentType<{ className?: string }>
    variant?: "default" | "destructive" | "outline" | "secondary"
    onClick: () => void
  }>
}

export function DetailHeader({
  title,
  subtitle,
  status,
  statusVariant = "default",
  backUrl,
  actions,
}: DetailHeaderProps) {
  const router = useRouter()

  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(backUrl)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {status && <Badge variant={statusVariant}>{status}</Badge>}
            </div>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions?.map((action, index) => {
            const Icon = action.icon
            return (
              <Button key={index} variant={action.variant || "outline"} onClick={action.onClick} className="gap-2">
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
