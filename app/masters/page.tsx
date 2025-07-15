import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Package,
  Users,
  DollarSign,
  Factory,
  UserCheck,
  Settings,
  Truck,
  MapPin,
  FileText,
  Globe,
  Shield,
  Database,
} from "lucide-react"

const masterCategories = [
  {
    title: "Product Masters",
    description: "Manage products, categories, units, and specifications",
    icon: Package,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    items: [
      { name: "Products", count: 1247, href: "/masters/products" },
      { name: "Categories", count: 45, href: "/masters/categories" },
      { name: "Sub Categories", count: 128, href: "/masters/subcategories" },
      { name: "Units of Measure", count: 25, href: "/masters/units" },
      { name: "Brands", count: 67, href: "/masters/brands" },
      { name: "Product Groups", count: 23, href: "/masters/product-groups" },
    ],
  },
  {
    title: "Customer Masters",
    description: "Customer information, categories, and pricing",
    icon: Users,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    items: [
      { name: "Customers", count: 342, href: "/masters/customers" },
      { name: "Customer Categories", count: 12, href: "/masters/customer-categories" },
      { name: "Customer Groups", count: 8, href: "/masters/customer-groups" },
      { name: "Price Lists", count: 15, href: "/masters/price-lists" },
      { name: "Credit Terms", count: 10, href: "/masters/credit-terms" },
      { name: "Sales Territories", count: 18, href: "/masters/sales-territories" },
    ],
  },
  {
    title: "Vendor Masters",
    description: "Supplier and vendor management data",
    icon: Truck,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    items: [
      { name: "Vendors", count: 156, href: "/masters/vendors" },
      { name: "Vendor Categories", count: 8, href: "/masters/vendor-categories" },
      { name: "Vendor Groups", count: 6, href: "/masters/vendor-groups" },
      { name: "Payment Terms", count: 12, href: "/masters/payment-terms" },
      { name: "Purchase Categories", count: 20, href: "/masters/purchase-categories" },
      { name: "Vendor Ratings", count: 5, href: "/masters/vendor-ratings" },
    ],
  },
  {
    title: "Location Masters",
    description: "Warehouses, locations, and storage management",
    icon: MapPin,
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-600",
    items: [
      { name: "Warehouses", count: 8, href: "/masters/warehouses" },
      { name: "Locations", count: 45, href: "/masters/locations" },
      { name: "Storage Bins", count: 234, href: "/masters/storage-bins" },
      { name: "Zones", count: 16, href: "/masters/zones" },
      { name: "Dock Doors", count: 12, href: "/masters/dock-doors" },
      { name: "Location Types", count: 7, href: "/masters/location-types" },
    ],
  },
  {
    title: "Financial Masters",
    description: "Tax codes, currencies, and financial settings",
    icon: DollarSign,
    color: "bg-yellow-50 border-yellow-200",
    iconColor: "text-yellow-600",
    items: [
      { name: "Tax Codes", count: 18, href: "/masters/tax-codes" },
      { name: "Currencies", count: 12, href: "/masters/currencies" },
      { name: "Exchange Rates", count: 24, href: "/masters/exchange-rates" },
      { name: "Payment Methods", count: 8, href: "/masters/payment-methods" },
      { name: "Bank Accounts", count: 15, href: "/masters/bank-accounts" },
      { name: "Cost Centers", count: 32, href: "/masters/cost-centers" },
    ],
  },
  {
    title: "Production Masters",
    description: "Manufacturing and production configuration",
    icon: Factory,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-600",
    items: [
      { name: "Work Centers", count: 12, href: "/masters/work-centers" },
      { name: "Operations", count: 45, href: "/masters/operations" },
      { name: "Bill of Materials", count: 234, href: "/masters/bom" },
      { name: "Routing", count: 67, href: "/masters/routing" },
      { name: "Machine Types", count: 15, href: "/masters/machine-types" },
      { name: "Quality Parameters", count: 28, href: "/masters/quality-parameters" },
    ],
  },
  {
    title: "HR Masters",
    description: "Employee and organizational data",
    icon: UserCheck,
    color: "bg-indigo-50 border-indigo-200",
    iconColor: "text-indigo-600",
    items: [
      { name: "Employees", count: 89, href: "/masters/employees" },
      { name: "Departments", count: 12, href: "/masters/departments" },
      { name: "Designations", count: 25, href: "/masters/designations" },
      { name: "Employee Categories", count: 8, href: "/masters/employee-categories" },
      { name: "Shifts", count: 6, href: "/masters/shifts" },
      { name: "Holiday Calendar", count: 4, href: "/masters/holidays" },
    ],
  },
  {
    title: "System Masters",
    description: "Users, roles, and system configuration",
    icon: Settings,
    color: "bg-gray-50 border-gray-200",
    iconColor: "text-gray-600",
    items: [
      { name: "Users", count: 45, href: "/masters/users" },
      { name: "Roles", count: 12, href: "/masters/roles" },
      { name: "Permissions", count: 156, href: "/masters/permissions" },
      { name: "User Groups", count: 8, href: "/masters/user-groups" },
      { name: "System Settings", count: 34, href: "/masters/system-settings" },
      { name: "Audit Logs", count: 2847, href: "/masters/audit-logs" },
    ],
  },
]

export default function MastersPage() {
  const totalMasters = masterCategories.reduce(
    (sum, category) => sum + category.items.reduce((itemSum, item) => itemSum + item.count, 0),
    0,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Masters Management</h1>
          <p className="text-muted-foreground mt-2">Manage all master data across your ERP system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Import Masters</Button>
          <Button variant="outline">Export Masters</Button>
          <Button>System Backup</Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Masters</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMasters.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{masterCategories.length}</div>
            <p className="text-xs text-muted-foreground">Master categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">System users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h ago</div>
            <p className="text-xs text-muted-foreground">Data synchronization</p>
          </CardContent>
        </Card>
      </div>

      {/* Master Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {masterCategories.map((category) => (
          <Card key={category.title} className={`${category.color} hover:shadow-md transition-shadow`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white`}>
                  <category.icon className={`h-6 w-6 ${category.iconColor}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {category.items.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-colors">
                      <span className="text-sm font-medium">{item.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.count.toLocaleString()}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Package className="h-6 w-6" />
              <span>Bulk Product Import</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Customer Data Sync</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Settings className="h-6 w-6" />
              <span>System Configuration</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
