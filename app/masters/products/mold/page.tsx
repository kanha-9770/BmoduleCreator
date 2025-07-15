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
  Hammer,
  Calendar,
  AlertTriangle,
} from "lucide-react"

const molds = [
  {
    id: "MLD-001",
    name: "Injection Mold - Housing",
    code: "IM-HSG-001",
    type: "Injection Mold",
    category: "Plastic Housing",
    partNumber: "HSG-001",
    material: "P20 Steel",
    cavities: 4,
    cycleTime: 45,
    shotWeight: 125,
    manufacturer: "MoldTech Solutions",
    purchaseDate: "2023-03-15",
    cost: 45000,
    location: "Mold Storage A",
    assignedMachine: "IM-300-001",
    status: "Active",
    condition: "Good",
    totalShots: 125000,
    maxShots: 500000,
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-04-15",
    efficiency: 94,
    defectRate: 2.1,
  },
  {
    id: "MLD-002",
    name: "Die Cast Mold - Bracket",
    code: "DC-BRK-002",
    type: "Die Cast Mold",
    category: "Metal Bracket",
    partNumber: "BRK-002",
    material: "H13 Steel",
    cavities: 2,
    cycleTime: 60,
    shotWeight: 250,
    manufacturer: "Precision Molds Inc",
    purchaseDate: "2022-11-20",
    cost: 65000,
    location: "Mold Storage B",
    assignedMachine: "DC-500-002",
    status: "Active",
    condition: "Excellent",
    totalShots: 85000,
    maxShots: 300000,
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-04-10",
    efficiency: 97,
    defectRate: 1.5,
  },
  {
    id: "MLD-003",
    name: "Compression Mold - Gasket",
    code: "CM-GSK-003",
    type: "Compression Mold",
    category: "Rubber Gasket",
    partNumber: "GSK-003",
    material: "Tool Steel",
    cavities: 8,
    cycleTime: 120,
    shotWeight: 75,
    manufacturer: "RubberMold Co",
    purchaseDate: "2021-08-10",
    cost: 28000,
    location: "Mold Storage A",
    assignedMachine: "CM-200-001",
    status: "Maintenance",
    condition: "Fair",
    totalShots: 245000,
    maxShots: 400000,
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-02-20",
    efficiency: 82,
    defectRate: 4.2,
  },
]

const moldTypes = [
  { name: "Injection Mold", count: 25, active: 23, maintenance: 2 },
  { name: "Die Cast Mold", count: 18, active: 16, maintenance: 2 },
  { name: "Compression Mold", count: 15, active: 13, maintenance: 2 },
  { name: "Blow Mold", count: 12, active: 11, maintenance: 1 },
  { name: "Transfer Mold", count: 8, active: 7, maintenance: 1 },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800"
    case "Maintenance":
      return "bg-yellow-100 text-yellow-800"
    case "Inactive":
      return "bg-red-100 text-red-800"
    case "Repair":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getConditionColor = (condition: string) => {
  switch (condition) {
    case "Excellent":
      return "text-green-600"
    case "Good":
      return "text-blue-600"
    case "Fair":
      return "text-yellow-600"
    case "Poor":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

export default function MoldsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMolds = molds.filter(
    (mold) =>
      mold.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mold.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mold.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mold Master</h1>
          <p className="text-muted-foreground">Manage molds and tooling equipment</p>
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
            Add Mold
          </Button>
        </div>
      </div>

      <Tabs defaultValue="molds" className="space-y-6">
        <TabsList>
          <TabsTrigger value="molds">Molds</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="molds" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Molds</CardTitle>
                <Hammer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78</div>
                <p className="text-xs text-muted-foreground">+5 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Molds</CardTitle>
                <Hammer className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">70</div>
                <p className="text-xs text-muted-foreground">89.7% operational</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
                <Calendar className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">8</div>
                <p className="text-xs text-muted-foreground">Scheduled maintenance</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
                <Hammer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">91.0%</div>
                <p className="text-xs text-muted-foreground">Overall performance</p>
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
                    placeholder="Search molds..."
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
                    <TableHead>Mold Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Cavities</TableHead>
                    <TableHead>Assigned Machine</TableHead>
                    <TableHead>Shot Count</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMolds.map((mold) => (
                    <TableRow key={mold.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{mold.name}</div>
                          <div className="text-sm text-muted-foreground">{mold.partNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{mold.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{mold.type}</Badge>
                      </TableCell>
                      <TableCell>{mold.cavities}</TableCell>
                      <TableCell>{mold.assignedMachine}</TableCell>
                      <TableCell>
                        <div>
                          <div>{mold.totalShots.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {((mold.totalShots / mold.maxShots) * 100).toFixed(1)}% of max
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={getConditionColor(mold.condition)}>{mold.efficiency}%</span>
                          {mold.efficiency < 85 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getConditionColor(mold.condition)}>{mold.condition}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(mold.status)}>{mold.status}</Badge>
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
                              Edit Mold
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Calendar className="h-4 w-4" />
                              Schedule Maintenance
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-red-600">
                              <Trash2 className="h-4 w-4" />
                              Deactivate
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
                <CardTitle>Mold Types</CardTitle>
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
                    <TableHead>Total Molds</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Under Maintenance</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moldTypes.map((type) => (
                    <TableRow key={type.name}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>{type.count}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">{type.active}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800">{type.maintenance}</Badge>
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
                              View Molds
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

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mold Maintenance Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {molds
                  .filter(
                    (mold) =>
                      mold.status === "Maintenance" ||
                      new Date(mold.nextMaintenance) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  )
                  .map((mold) => (
                    <div key={mold.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${mold.status === "Maintenance" ? "bg-yellow-100" : "bg-blue-100"}`}
                        >
                          <Hammer
                            className={`h-5 w-5 ${mold.status === "Maintenance" ? "text-yellow-600" : "text-blue-600"}`}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{mold.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {mold.status === "Maintenance"
                              ? "Currently under maintenance"
                              : `Next maintenance: ${mold.nextMaintenance}`}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={
                          mold.status === "Maintenance" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                        }
                      >
                        {mold.status === "Maintenance" ? "In Progress" : "Scheduled"}
                      </Badge>
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
                <CardTitle>Mold Distribution by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moldTypes.map((type) => (
                    <div key={type.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{type.name}</span>
                        <span>{type.count} molds</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(type.count / 78) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mold Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Active Molds</span>
                    </div>
                    <span className="font-semibold">70</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Under Maintenance</span>
                    </div>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Inactive/Repair</span>
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
