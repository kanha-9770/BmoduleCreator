"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SettingItemProps {
  label: string
  description?: string
  type: "toggle" | "input" | "textarea" | "select"
  value: any
  onChange: (value: any) => void
  options?: Array<{ label: string; value: string }>
  placeholder?: string
}

export function SettingItem({ label, description, type, value, onChange, options, placeholder }: SettingItemProps) {
  const renderControl = () => {
    switch (type) {
      case "toggle":
        return <Switch checked={value} onCheckedChange={onChange} />

      case "input":
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="max-w-md bg-background"
          />
        )

      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="max-w-md bg-background"
            rows={4}
          />
        )

      case "select":
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-1">
        <Label className="text-foreground">{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex-shrink-0">{renderControl()}</div>
    </div>
  )
}
