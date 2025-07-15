import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Package, MapPin } from "lucide-react"

interface WarehouseStatsProps {
  totalWarehouses: number
  totalCapacity: number
  totalUtilization: number
  totalLocations: number
  utilizationPercentage: number
}

export function WarehouseStats({
  totalWarehouses,
  totalCapacity,
  totalUtilization,
  totalLocations,
  utilizationPercentage,
}: WarehouseStatsProps) {
  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-red-600"
    if (utilization >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWarehouses}</div>
          <p className="text-xs text-muted-foreground">Active facilities</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCapacity.toLocaleString()} sq ft</div>
          <p className="text-xs text-muted-foreground">Storage capacity</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Utilization</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getUtilizationColor(utilizationPercentage)}`}>
            {utilizationPercentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">{totalUtilization.toLocaleString()} sq ft used</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Locations</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLocations}</div>
          <p className="text-xs text-muted-foreground">Total locations</p>
        </CardContent>
      </Card>
    </div>
  )
}
