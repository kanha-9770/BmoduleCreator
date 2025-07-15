"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Factory, Clock, CheckCircle, AlertCircle } from "lucide-react"

const productionOrders = [
  {
    id: "PO-2024-001",
    salesOrder: "SO-2024-156",
    product: "Hydraulic Cylinder Assembly",
    quantity: 50,
    produced: 35,
    startDate: "2024-01-10",
    dueDate: "2024-01-25",
    status: "In Progress",
    priority: "High",
    workCenter: "Assembly Line 1",
    progress: 70,
  },
  {
    id: "PO-2024-002",
    salesOrder: "SO-2024-157",
    product: "Steel Frame Structure",
    quantity: 25,
    produced: 25,
    startDate: "2024-01-08",
    dueDate: "2024-01-20",
    status: "Completed",
    priority: "Medium",
    workCenter: "Welding Station",
    progress: 100,
  },
  {
    id: "PO-2024-003",
    salesOrder: "SO-2024-158",
    product: "Motor Control Panel",
    quantity: 15,
    produced: 0,
    startDate: "2024-01-15",
    dueDate: "2024-01-30",
    status: "Planned",
    priority: "Low",
    workCenter: "Electronics Lab",
    progress: 0,
  },
  {
    id: "PO-2024-004",
    salesOrder: "SO-2024-159",
    product: "Conveyor Belt System",
    quantity: 8,
    produced: 6,
    startDate: "2024-01-12",
    dueDate: "2024-01-28",
    status: "Quality Check",
    priority: "High",
    workCenter: "Assembly Line 2",
    progress: 85,
  },
  {
    id: "PO-2024-005",
    salesOrder: "SO-2024-160",
    product: "Pressure Valve Assembly",
    quantity: 100,
    produced: 20,
    startDate: "2024-01-14",
    dueDate: "2024-02-05",
    status: "In Progress",
    priority: "Medium",
    workCenter: "Machining Center",
    progress: 20,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800"
    case "In Progress":
      return "bg-blue-100 text-blue-800"
    case "Quality Check":
      return "bg-purple-100 text-purple-800"
    case "Planned":
      return "bg-gray-100 text-gray-800"
    case "Delayed":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800"
    case "Medium":
      return "bg-yellow-100 text-yellow-800"
    case "Low":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function ProductionPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrders = productionOrders.filter(
    (order) =>
      order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.salesOrder.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalOrders = productionOrders.length
  const inProgressOrders = productionOrders.filter((order) => order.status === "In Progress").length
  const completedOrders = productionOrders.filter((order) => order.status === "Completed").length
  const plannedOrders = productionOrders.filter((order) => order.status === "Planned").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Production Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">Production Schedule</Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Production Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Active production orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressOrders}</div>
            <p className="text-xs text-muted-foreground">Currently manufacturing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
            <p className="text-xs text-muted-foreground">Finished this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{plannedOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting production</p>
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
                placeholder="Search production orders..."
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
              <Clock className="h-4 w-4" />
              Schedule View
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Production Order</TableHead>
                <TableHead>Sales Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Work Center</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.salesOrder}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {order.produced}/{order.quantity}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={order.progress} className="w-16" />
                      <div className="text-xs text-muted-foreground">{order.progress}%</div>
                    </div>
                  </TableCell>
                  <TableCell>{order.dueDate}</TableCell>
                  <TableCell>{order.workCenter}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
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
                          Edit Order
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Clock className="h-4 w-4" />
                          Update Progress
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
