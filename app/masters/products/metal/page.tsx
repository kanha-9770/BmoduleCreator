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
  Zap,
  Package,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"

const metals = [
  {
    id: "MTL-001",
    name: "Steel Rod - 12mm",
    code: "SR-12MM-001",
    type: "Steel",
    grade: "MS Grade",
    specification: "IS 2062",
    diameter: "12mm",
    length: "6m",
    weight: "6.7 kg/piece",
    density: "7.85 g/cm³",
    tensileStrength: "410 MPa",
    yieldStrength: "250 MPa",
    currentStock: 450,
    minStock: 200,
    maxStock: 1000,
    unitPrice: 25.5,
    totalValue: 11475,
    supplier: "Steel Industries Ltd",
    location: "Metal Yard A",
    hsnCode: "7213.10.00",
    status: "Active",
    lastPurchase: "2024-01-10",
    qualityCertificate: "TC-001-2024",
  },
  {
    id: "MTL-002",
    name: "Aluminum Sheet - 4x8",
    code: "AS-4X8-002",
    type: "Aluminum",
    grade: "6061-T6",
    specification: "ASTM B209",
    diameter: "N/A",
    length: "8ft",
    weight: "12.8 kg/sheet",
    density: "2.70 g/cm³",
    tensileStrength: "310 MPa",
    yieldStrength: "276 MPa",
    currentStock: 78,
    minStock: 50,
    maxStock: 200,
    unitPrice: 145.0,
    totalValue: 11310,
    supplier: "Aluminum Corp",
    location: "Metal Yard B",
    hsnCode: "7606.12.00",
    status: "Active",
    lastPurchase: "2024-01-05",
    qualityCertificate: "TC-002-2024",
  },
  {
    id: "MTL-003",
    name: "Copper Wire - 2.5mm",
    code: "CW-2.5MM-003",
    type: "Copper",
    grade: "ETP Grade",
    specification: "IS 8130",
    diameter: "2.5mm",
    length: "100m/coil",
    weight: "0.025 kg/m",
    density: "8.96 g/cm³",
    tensileStrength: "220 MPa",
    yieldStrength: "70 MPa",
    currentStock: 1200,
    minStock: 500,
    maxStock: 2000,
    unitPrice: 8.75,
    totalValue: 10500,
    supplier: "Copper Solutions",
    location: "Metal Yard C",
    hsnCode: "7408.11.00",
    status: "Active",
    lastPurchase: "2023-12-20",
    qualityCertificate: "TC-003-2023",
  },
  {
    id: "MTL-004",
    name: "Stainless Steel Pipe - 25mm",
    code: "SSP-25MM-004",
    type: "Stainless Steel",
    grade: "SS 304",
    specification: "ASTM A312",
    diameter: "25mm",
    length: "6m",
    weight: "3.2 kg/m",
    density: "8.00 g/cm³",
    tensileStrength: "515 MPa",
    yieldStrength: "205 MPa",
    currentStock: 35,
    minStock: 50,
    maxStock: 150,
    unitPrice: 85.0,
    totalValue: 2975,
    supplier: "SS Pipes Ltd",
    location: "Metal Yard A",
    hsnCode: "7306.40.00",
    status: "Low Stock",
    lastPurchase: "2023-11-15",
    qualityCertificate: "TC-004-2023",
  },
]

const metalTypes = [
  { name: "Steel", count: 45, active: 42, lowStock: 3 },
  { name: "Aluminum", count: 28, active: 26, lowStock: 2 },
  { name: "Copper", count: 34, active: 32, lowStock: 2 },
  { name: "Stainless Steel", count: 23, active: 20, lowStock: 3 },
  { name: "Brass", count: 16, active: 15, lowStock: 1 },
  { name: "Cast Iron", count: 10, active: 9, lowStock: 1 },
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

export default function MetalsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMetals = metals.filter(
    (metal) =>
      metal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metal.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metal.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalValue = metals.reduce((sum, metal) => sum + metal.totalValue, 0)
  const lowStockItems = metals.filter((metal) => metal.currentStock <= metal.minStock).length
  const totalItems = metals.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metal Master</h1>
          <p className="text-muted-foreground">Manage metal materials and specifications</p>
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
            Add Metal
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="metals">Metals</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="metals" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Metals</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">+8 from last month</p>
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
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
                <p className="text-xs text-muted-foreground">Need reordering</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Metal Types</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metalTypes.length}</div>
                <p className="text-xs text-muted-foreground">Different metal types</p>
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
                    placeholder="Search metals..."
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
                    <TableHead>Metal Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type & Grade</TableHead>
                    <TableHead>Specifications</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMetals.map((metal) => (
                    <TableRow key={metal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{metal.name}</div>
                          <div className="text-sm text-muted-foreground">{metal.specification}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{metal.code}</TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline">{metal.type}</Badge>
                          <div className="text-sm text-muted-foreground mt-1">{metal.grade}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Tensile: {metal.tensileStrength}</div>
                          <div>Yield: {metal.yieldStrength}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{metal.currentStock}</span>
                          {metal.currentStock <= metal.minStock && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>${metal.unitPrice}</TableCell>
                      <TableCell>${metal.totalValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(metal.status)}>{metal.status}</Badge>
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
                              Edit Metal
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

        <TabsContent value="types" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Metal Types</CardTitle>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Type
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type Name</TableHead>
                    <TableHead>Total Items</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Low Stock</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metalTypes.map((type) => (
                    <TableRow key={type.name}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>{type.count}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">{type.active}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800">{type.lowStock}</Badge>
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
                              View Metals
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" />
                              Edit Type
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

        <TabsContent value="specifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metal Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metals.map((metal) => (
                  <div key={metal.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{metal.name}</h3>
                      <Badge variant="outline">{metal.type}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Grade:</span>
                        <div className="font-medium">{metal.grade}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Specification:</span>
                        <div className="font-medium">{metal.specification}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tensile Strength:</span>
                        <div className="font-medium">{metal.tensileStrength}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Yield Strength:</span>
                        <div className="font-medium">{metal.yieldStrength}</div>
                      </div>
                    </div>
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
                <CardTitle>Metal Distribution by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metalTypes.map((type) => (
                    <div key={type.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{type.name}</span>
                        <span>{type.count} items</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${(type.count / 156) * 100}%` }}
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
                    <span className="font-semibold">144</span>
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
                    <span className="font-semibold">0</span>
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
