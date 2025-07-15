"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2, MapPin } from "lucide-react"

interface Warehouse {
  id: string
  name: string
  code: string
  type: string
  address: string
  city: string
  state: string
  country: string
  pincode: string
  manager: string
  phone: string
  email: string
  capacity: number
  currentUtilization: number
  zones: number
  locations: number
  bins: number
  status: string
  establishedDate: string
}

interface WarehouseTableProps {
  warehouses: Warehouse[]
}

export function WarehouseTable({ warehouses }: WarehouseTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.city.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-red-600"
    if (utilization >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search warehouses..."
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
              <TableHead>Warehouse Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Utilization</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWarehouses.map((warehouse) => {
              const utilization = (warehouse.currentUtilization / warehouse.capacity) * 100
              return (
                <TableRow key={warehouse.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{warehouse.name}</div>
                      <div className="text-sm text-muted-foreground">{warehouse.id}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{warehouse.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{warehouse.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {warehouse.city}, {warehouse.state}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{warehouse.manager}</div>
                      <div className="text-sm text-muted-foreground">{warehouse.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{warehouse.capacity.toLocaleString()} sq ft</TableCell>
                  <TableCell>
                    <div>
                      <div className={`font-medium ${getUtilizationColor(utilization)}`}>{utilization.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">
                        {warehouse.currentUtilization.toLocaleString()} sq ft
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{warehouse.locations} locations</div>
                      <div className="text-muted-foreground">{warehouse.bins} bins</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(warehouse.status)}>{warehouse.status}</Badge>
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
                          Edit Warehouse
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <MapPin className="h-4 w-4" />
                          View Locations
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-600">
                          <Trash2 className="h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
