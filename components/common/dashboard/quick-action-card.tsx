"use client"

import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface QuickActionCardProps {
  label: string
  icon: LucideIcon
  onClick: () => void
}

export function QuickActionCard({ label, icon: Icon, onClick }: QuickActionCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
