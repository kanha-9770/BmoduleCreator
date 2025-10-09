"use client"

import type * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TabConfig {
  id: string
  label: string
  content: React.ReactNode
}

interface DetailTabsProps {
  tabs: TabConfig[]
  defaultTab?: string
}

export function DetailTabs({ tabs, defaultTab }: DetailTabsProps) {
  return (
    <Tabs defaultValue={defaultTab || tabs[0]?.id} className="w-full">
      <TabsList className="bg-muted">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

interface InfoFieldProps {
  label: string
  value: string | React.ReactNode
}

export function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base text-foreground">{value}</p>
    </div>
  )
}

interface InfoSectionProps {
  title: string
  fields: Array<{ label: string; value: string | React.ReactNode }>
}

export function InfoSection({ title, fields }: InfoSectionProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {fields.map((field, index) => (
            <InfoField key={index} label={field.label} value={field.value} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
