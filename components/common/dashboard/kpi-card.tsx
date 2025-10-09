import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  label: string
  value: string | number
  change?: number
  trend?: "up" | "down" | "neutral"
  icon: LucideIcon
}

export function KPICard({ label, value, change, trend, icon: Icon }: KPICardProps) {
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            {change !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                <TrendIcon
                  className={cn(
                    "h-4 w-4",
                    trend === "up" && "text-primary",
                    trend === "down" && "text-destructive",
                    trend === "neutral" && "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend === "up" && "text-primary",
                    trend === "down" && "text-destructive",
                    trend === "neutral" && "text-muted-foreground",
                  )}
                >
                  {Math.abs(change)}%
                </span>
                <span className="text-sm text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
