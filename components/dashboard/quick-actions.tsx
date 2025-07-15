import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FileText, Package, BarChart3, Brain } from "lucide-react"

export function QuickActions() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Quotations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">QT-2024-001</p>
              <p className="text-sm text-muted-foreground">Acme Corp</p>
            </div>
            <Badge variant="outline">Pending</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">QT-2024-002</p>
              <p className="text-sm text-muted-foreground">Tech Solutions</p>
            </div>
            <Badge variant="secondary">Approved</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">QT-2024-003</p>
              <p className="text-sm text-muted-foreground">Global Industries</p>
            </div>
            <Badge variant="destructive">Rejected</Badge>
          </div>
          <Link href="/quotations">
            <Button variant="outline" className="w-full">
              View All Quotations
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Steel Rods - 12mm</p>
              <p className="text-sm text-muted-foreground">Current: 45 units</p>
            </div>
            <Badge variant="destructive">Critical</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Copper Wire - 2.5mm</p>
              <p className="text-sm text-muted-foreground">Current: 120 units</p>
            </div>
            <Badge variant="outline">Low</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Aluminum Sheets</p>
              <p className="text-sm text-muted-foreground">Current: 78 units</p>
            </div>
            <Badge variant="outline">Low</Badge>
          </div>
          <Link href="/inventory">
            <Button variant="outline" className="w-full">
              View Inventory
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Production Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Order #SO-2024-156</p>
              <p className="text-sm text-muted-foreground">Manufacturing</p>
            </div>
            <Badge>In Progress</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Order #SO-2024-157</p>
              <p className="text-sm text-muted-foreground">Quality Check</p>
            </div>
            <Badge variant="secondary">QC</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Order #SO-2024-158</p>
              <p className="text-sm text-muted-foreground">Ready to Ship</p>
            </div>
            <Badge variant="outline">Completed</Badge>
          </div>
          <Link href="/production">
            <Button variant="outline" className="w-full">
              View Production
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Inventory Optimization</p>
              <p className="text-sm text-muted-foreground">3 items need attention</p>
            </div>
            <Badge variant="destructive">High</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sales Opportunity</p>
              <p className="text-sm text-muted-foreground">Volume discount potential</p>
            </div>
            <Badge variant="secondary">Medium</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Production Efficiency</p>
              <p className="text-sm text-muted-foreground">15% improvement possible</p>
            </div>
            <Badge variant="outline">Low</Badge>
          </div>
          <Link href="/ai">
            <Button variant="outline" className="w-full">
              View AI Assistant
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
