"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

const inventory = [
  {
    id: "ITM-001",
    name: "Steel Rods - 12mm",
    category: "Raw Materials",
    sku: "SR-12MM-001",
    currentStock: 45,
    minStock: 100,
    maxStock: 500,
    unit: "PCS",
    unitPrice: 25.5,
    totalValue: 1147.5,
    location: "Warehouse A",
    status: "Critical",
  },
  {
    id: "ITM-002",
    name: "Copper Wire - 2.5mm",
    category: "Electrical",
    sku: "CW-2.5MM-001",
    currentStock: 120,
    minStock: 150,
    maxStock: 800,
    unit: "MTR",
    unitPrice: 8.75,
    totalValue: 1050.0,
    location: "Warehouse B",
    status: "Low",
  },
  {
    id: "ITM-003",
    name: "Aluminum Sheets",
    category: "Raw Materials",
    sku: "AS-4X8-001",
    currentStock: 78,
    minStock: 50,
    maxStock: 200,
    unit: "SHT",
    unitPrice: 145.0,
    totalValue: 11310.0,
    location: "Warehouse A",
    status: "Good",
  },
  {
    id: "ITM-004",
    name: "Hydraulic Pumps",
    category: "Components",
    sku: "HP-500-001",
    currentStock: 25,
    minStock: 10,
    maxStock: 50,
    unit: "PCS",
    unitPrice: 850.0,
    totalValue: 21250.0,
    location: "Warehouse C",
    status: "Good",
  },
  {
    id: "ITM-005",
    name: "Bearing Assembly",
    category: "Components",
    sku: "BA-6205-001",
    currentStock: 5,
    minStock: 20,
    maxStock: 100,
    unit: "PCS",
    unitPrice: 125.0,
    totalValue: 625.0,
    location: "Warehouse B",
    status: "Critical",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Critical":
      return "bg-red-100 text-red-800"
    case "Low":
      return "bg-yellow-100 text-yellow-800"
    case "Good":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0)
  const criticalItems = inventory.filter((item) => item.status === "Critical").length
  const lowStockItems = inventory.filter((item) => item.status === "Low").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">Stock Adjustment</Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
            <p className="text-xs text-muted-foreground">Items below minimum</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items running low</p>
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
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Low Stock Only
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min/Max</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {item.currentStock} {item.unit}
                      {item.status === "Critical" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Min: {item.minStock}</div>
                      <div>Max: {item.maxStock}</div>
                    </div>
                  </TableCell>
                  <TableCell>${item.unitPrice}</TableCell>
                  <TableCell>${item.totalValue.toLocaleString()}</TableCell>
                  <TableCell>{item.location}</TableCell>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
