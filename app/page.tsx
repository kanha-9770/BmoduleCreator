import { Button } from "@/components/ui/button"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { SystemAlerts } from "@/components/dashboard/system-alerts"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ERP Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>New Transaction</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <DashboardStats />

      {/* Quick Actions */}
      <QuickActions />

      {/* Alerts */}
      <SystemAlerts />
    </div>
  )
}
