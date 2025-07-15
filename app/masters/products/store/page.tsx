"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Store,
  Package,
  AlertTriangle,
  TrendingDown,
} from "lucide-react"

const storeItems = [
  {
    id: "STR-001",
    name: "Cutting Oil - Grade A",
    code: "CO-GA-001",
    category: "Lubricants",
    subCategory: "Cutting Fluids",
    unit: "LTR",
    currentStock: 450,
    minStock: 200,
    maxStock: 1000,
    reorderLevel: 250,
    unitPrice: 12.5,
    totalValue: 5625,
    supplier: "Industrial Oils Ltd",
    location: "Store Room A",
    shelf: "A-12",
    lastPurchase: "2024-01-10",
    expiryDate: "2025-01-10",
    status: "Active",
    consumption: "High",
    leadTime: 7,
  },
  {
    id: "STR-002",
    name: "Safety Gloves - Medium",
    code: "SG-M-002",
    category: "Safety Equipment",
    subCategory: "Personal Protection",
    unit: "PAIR",
    currentStock: 85,
    minStock: 100,
    maxStock: 500,
    reorderLevel: 120,
    unitPrice: 8.75,
    totalValue: 743.75,
    supplier: "Safety First Co",
    location: "Store Room B",
    shelf: "B-05",
    lastPurchase: "2023-12-15",
    expiryDate: "N/A",
    status: "Low Stock",
    consumption: "Medium",
    leadTime: 5,
  },
  {
    id: "STR-003",
    name: "Welding Electrodes - 3.2mm",
    code: "WE-32-003",
    category: "Welding Supplies",
    subCategory: "Electrodes",
    unit: "KG",
    currentStock: 125,
    minStock: 50,
    maxStock: 300,
    reorderLevel: 75,
    unitPrice: 45.0,
    totalValue: 5625,
    supplier: "Weld Tech Solutions",
    location: "Store Room A",
    shelf: "A-08",
    lastPurchase: "2024-01-05",
    expiryDate: "2026-01-05",
    status: "Active",
    consumption: "High",
    leadTime: 10,
  },
  {
    id: "STR-004",
    name: "Cleaning Solvent - Industrial",
    code: "CS-IND-004",
    category: "Chemicals",
    subCategory: "Solvents",
    unit: "LTR",
    currentStock: 25,
    minStock: 50,
    maxStock: 200,
    reorderLevel: 60,
    unitPrice: 18.5,
    totalValue: 462.5,
    supplier: "Chemical Solutions Inc",
    location: "Store Room C",
    shelf: "C-03",
    lastPurchase: "2023-11-20",
    expiryDate: "2024-11-20",
    status: "Critical",
    consumption: "Medium",
    leadTime: 14,
  },
]

const storeCategories = [
  { name: "Lubricants", count: 45, lowStock: 3, critical: 1 },
  { name: "Safety Equipment", count: 78, lowStock: 8, critical: 2 },
  { name: "Welding Supplies", count: 34, lowStock: 2, critical: 0 },
  { name: "Chemicals", count: 23, lowStock: 4, critical: 2 },
  { name: "Tools & Hardware", count: 56, lowStock: 5, critical: 1 },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800"
    case "Low Stock":
      return "bg-yellow-100 text-yellow-800"
    case "Critical":
      return "bg-red-100 text-red-800"
    case "Out of Stock":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getConsumptionColor = (consumption: string) => {
  switch (consumption) {
    case "High":
      return "text-red-600"
    case "Medium":
      return "text-yellow-600"
    case "Low":
      return "text-green-600"
    default:
      return "text-gray-600"
  }
}

export default function StorePage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredItems = storeItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalValue = storeItems.reduce((sum, item) => sum + item.totalValue, 0)
  const lowStockItems = storeItems.filter((item) => item.currentStock <= item.minStock).length
  const criticalItems = storeItems.filter((item) => item.status === "Critical").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Master</h1>
          <p className="text-muted-foreground">Manage store items and consumables</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Store Item
          </Button>
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList>
          <TabsTrigger value="items">Store Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">234</div>
                <p className="text-xs text-muted-foreground">+12 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Current inventory value</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <TrendingDown className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
                <p className="text-xs text-muted-foreground">Need reordering</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
                <p className="text-xs text-muted-foreground">Immediate attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search store items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min/Max</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Consumption</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.subCategory}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{item.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>
                            {item.currentStock} {item.unit}
                          </span>
                          {item.currentStock <= item.minStock && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Min: {item.minStock}</div>
                          <div>Max: {item.maxStock}</div>
                        </div>
                      </TableCell>
                      <TableCell>${item.unitPrice}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{item.location}</div>
                          <div className="text-muted-foreground">{item.shelf}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getConsumptionColor(item.consumption)}>{item.consumption}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Package className="h-4 w-4" />
                              Stock Adjustment
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-red-600">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Store Categories</CardTitle>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Total Items</TableHead>
                    <TableHead>Low Stock</TableHead>
                    <TableHead>Critical</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storeCategories.map((category) => (
                    <TableRow key={category.name}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.count}</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800">{category.lowStock}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">{category.critical}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Items
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" />
                              Edit Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumption" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consumption Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storeItems
                  .filter((item) => item.consumption === "High")
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-red-100">
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Current: {item.currentStock} {item.unit} | Lead Time: {item.leadTime} days
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">High Consumption</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Items Distribution by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {storeCategories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category.name}</span>
                        <span>{category.count} items</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(category.count / 234) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Adequate Stock</span>
                    </div>
                    <span className="font-semibold">218</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Low Stock</span>
                    </div>
                    <span className="font-semibold">{lowStockItems}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Critical Stock</span>
                    </div>
                    <span className="font-semibold">{criticalItems}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
