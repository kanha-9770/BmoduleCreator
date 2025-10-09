import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TimelineItem {
  id: string
  title: string
  description: string
  timestamp: string
  type: "info" | "success" | "warning" | "error"
  user?: string
}

interface ActivityTimelineProps {
  items: TimelineItem[]
}

const typeColors = {
  info: "bg-primary",
  success: "bg-chart-1",
  warning: "bg-chart-3",
  error: "bg-destructive",
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Timeline line */}
          <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />

          {items.map((item, index) => (
            <div key={item.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className={cn("relative z-10 mt-1 h-4 w-4 rounded-full", typeColors[item.type])} />

              {/* Content */}
              <div className="flex-1 space-y-1 pb-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {item.user && (
                  <p className="text-xs text-muted-foreground">
                    by <span className="font-medium">{item.user}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
