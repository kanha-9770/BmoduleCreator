"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"

interface ReportCardProps {
  title: string
  description: string
  lastGenerated?: string
  onView: () => void
  onExport: () => void
}

export function ReportCard({ title, description, lastGenerated, onView, onExport }: ReportCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {lastGenerated && <p className="text-sm text-muted-foreground">Last generated: {lastGenerated}</p>}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={onView} className="gap-2 bg-transparent">
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button variant="default" size="sm" onClick={onExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
