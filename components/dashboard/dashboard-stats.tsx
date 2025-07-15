import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Package, Users, ShoppingCart, DollarSign } from "lucide-react"

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$2,847,392</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.5%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,247</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8.2%
            </span>
            from last week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$847,293</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-red-600 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              -2.1%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">342</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +5.7%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
