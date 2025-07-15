"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Plus, Settings, Package, Hammer, Store, Zap, BarChart3 } from "lucide-react"

const masterTypes = [
  {
    id: "machine",
    name: "Machine Master",
    description: "Manage manufacturing machines and equipment",
    icon: Settings,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    count: 45,
    active: 42,
    inactive: 3,
    href: "/masters/products/machine",
  },
  {
    id: "mold",
    name: "Mold Master",
    description: "Manage molds and tooling equipment",
    icon: Hammer,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    count: 78,
    active: 75,
    inactive: 3,
    href: "/masters/products/mold",
  },
  {
    id: "store",
    name: "Store Master",
    description: "Manage store items and consumables",
    icon: Store,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    count: 234,
    active: 228,
    inactive: 6,
    href: "/masters/products/store",
  },
  {
    id: "metal",
    name: "Metal Master",
    description: "Manage metal materials and specifications",
    icon: Zap,
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-600",
    count: 156,
    active: 152,
    inactive: 4,
    href: "/masters/products/metal",
  },
]

const recentActivity = [
  {
    type: "Machine",
    name: "CNC Machine - Model X200",
    action: "Added",
    time: "2 hours ago",
    user: "John Doe",
  },
  {
    type: "Mold",
    name: "Injection Mold - IM-001",
    action: "Updated",
    time: "4 hours ago",
    user: "Sarah Smith",
  },
  {
    type: "Store",
    name: "Cutting Oil - Grade A",
    action: "Stock Updated",
    time: "6 hours ago",
    user: "Mike Johnson",
  },
  {
    type: "Metal",
    name: "Steel Rod - 12mm",
    action: "Price Updated",
    time: "1 day ago",
    user: "Lisa Brown",
  },
]

export default function ProductMastersPage() {
  const [isAddMasterDialogOpen, setIsAddMasterDialogOpen] = useState(false)
  const [newMasterType, setNewMasterType] = useState({
    name: "",
    description: "",
    icon: "Package",
  })

  const totalItems = masterTypes.reduce((sum, type) => sum + type.count, 0)
  const totalActive = masterTypes.reduce((sum, type) => sum + type.active, 0)
  const totalInactive = masterTypes.reduce((sum, type) => sum + type.inactive, 0)

  const handleAddMasterType = () => {
    // In a real application, this would save to a database
    console.log("Adding new master type:", newMasterType)
    setIsAddMasterDialogOpen(false)
    setNewMasterType({ name: "", description: "", icon: "Package" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Masters</h1>
          <p className="text-muted-foreground">Manage different types of product masters</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddMasterDialogOpen} onOpenChange={setIsAddMasterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Master Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Master Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="masterName">Master Type Name</Label>
                  <Input
                    id="masterName"
                    value={newMasterType.name}
                    onChange={(e) => setNewMasterType({ ...newMasterType, name: e.target.value })}
                    placeholder="e.g., Tool Master"
                  />
                </div>
                <div>
                  <Label htmlFor="masterDescription">Description</Label>
                  <Input
                    id="masterDescription"
                    value={newMasterType.description}
                    onChange={(e) => setNewMasterType({ ...newMasterType, description: e.target.value })}
                    placeholder="e.g., Manage tools and equipment"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddMasterType}>Add Master Type</Button>
                  <Button variant="outline" onClick={() => setIsAddMasterDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="gap-2">
            <Settings className="h-4 w-4" />
            Configure Masters
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all master types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalActive}</div>
            <p className="text-xs text-muted-foreground">{((totalActive / totalItems) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Master Types</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{masterTypes.length}</div>
            <p className="text-xs text-muted-foreground">Different master categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Items</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalInactive}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Master Types Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {masterTypes.map((masterType) => (
          <Link key={masterType.id} href={masterType.href}>
            <Card className={`${masterType.color} hover:shadow-md transition-all cursor-pointer`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-white">
                    <masterType.icon className={`h-8 w-8 ${masterType.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{masterType.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{masterType.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{masterType.count}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{masterType.active}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{masterType.inactive}</div>
                    <div className="text-xs text-muted-foreground">Inactive</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{activity.type}</Badge>
                  <div>
                    <div className="font-medium">{activity.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.action} by {activity.user}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Settings className="h-6 w-6" />
              <span>Bulk Import</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Generate Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Package className="h-6 w-6" />
              <span>Stock Sync</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span>Add Items</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
