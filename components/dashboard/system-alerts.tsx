import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function SystemAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          System Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Purchase Order PO-2024-089 is overdue for delivery</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm">Critical inventory shortage detected for 3 items</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-blue-500" />
            <span className="text-sm">New vendor registration pending approval</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
