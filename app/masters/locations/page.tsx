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
  Trash2,
  MapPin,
  Building2,
  Package,
  Truck,
} from "lucide-react"

const locations = [
  {
    id: "LOC-001",
    name: "JAIPUR WAREHOUSE",
    code: "JPR-WH",
    type: "Warehouse",
    category: "Storage Facility",
    address: "Plot No. 45, Industrial Area, Sitapura",
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    pincode: "302022",
    contactPerson: "Rajesh Kumar",
    phone: "+91-141-2345678",
    email: "rajesh.kumar@company.com",
    gstNumber: "08ABCDE1234F1Z5",
    panNumber: "ABCDE1234F",
    isActive: true,
    isDefault: false,
    createdDate: "2023-02-10",
    coordinates: "26.9124, 75.7873",
  },
  {
    id: "LOC-002",
    name: "MUMBAI WAREHOUSE",
    code: "MUM-WH",
    type: "Warehouse",
    category: "Distribution Center",
    address: "Warehouse Complex, JNPT Road, Panvel",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "410206",
    contactPerson: "Priya Sharma",
    phone: "+91-22-27451234",
    email: "priya.sharma@company.com",
    gstNumber: "27FGHIJ5678K2L6",
    panNumber: "FGHIJ5678K",
    isActive: true,
    isDefault: false,
    createdDate: "2022-08-15",
    coordinates: "19.0176, 73.1805",
  },
  {
    id: "LOC-003",
    name: "ON THE WAY",
    code: "OTW",
    type: "Transit",
    category: "Mobile Location",
    address: "Mobile Transit Operations",
    city: "Various",
    state: "Multiple",
    country: "India",
    pincode: "000000",
    contactPerson: "Transit Team",
    phone: "+91-98765-43210",
    email: "transit@company.com",
    gstNumber: "N/A",
    panNumber: "N/A",
    isActive: true,
    isDefault: false,
    createdDate: "2023-01-01",
    coordinates: "Variable",
  },
  {
    id: "LOC-004",
    name: "Head Office",
    code: "HO",
    type: "Office",
    category: "Corporate Office",
    address: "Corporate Tower, Business District",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    pincode: "110001",
    contactPerson: "Admin Team",
    phone: "+91-11-12345678",
    email: "admin@company.com",
    gstNumber: "07KLMNO9012P3Q4",
    panNumber: "KLMNO9012P",
    isActive: true,
    isDefault: true,
    createdDate: "2020-01-01",
    coordinates: "28.6139, 77.2090",
  },
  {
    id: "LOC-005",
    name: "Manufacturing Unit 1",
    code: "MFG-01",
    type: "Factory",
    category: "Production Facility",
    address: "Industrial Estate, Sector 25",
    city: "Gurgaon",
    state: "Haryana",
    country: "India",
    pincode: "122001",
    contactPerson: "Production Manager",
    phone: "+91-124-4567890",
    email: "production@company.com",
    gstNumber: "06PQRST3456U7V8",
    panNumber: "PQRST3456U",
    isActive: true,
    isDefault: false,
    createdDate: "2021-05-20",
    coordinates: "28.4595, 77.0266",
  },
]

const locationTypes = [
  { name: "Warehouse", count: 2, color: "bg-blue-100 text-blue-800" },
  { name: "Transit", count: 1, color: "bg-orange-100 text-orange-800" },
  { name: "Office", count: 1, color: "bg-green-100 text-green-800" },
  { name: "Factory", count: 1, color: "bg-purple-100 text-purple-800" },
  { name: "Retail Store", count: 0, color: "bg-gray-100 text-gray-800" },
  { name: "Service Center", count: 0, color: "bg-gray-100 text-gray-800" },
]

const getStatusColor = (isActive: boolean) => {
  return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Warehouse":
      return <Package className="h-4 w-4" />
    case "Transit":
      return <Truck className="h-4 w-4" />
    case "Office":
      return <Building2 className="h-4 w-4" />
    case "Factory":
      return <Building2 className="h-4 w-4" />
    default:
      return <MapPin className="h-4 w-4" />
  }
}

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeLocations = locations.filter((loc) => loc.isActive).length
  const totalStates = [...new Set(locations.map((loc) => loc.state))].length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Location Masters</h1>
          <p className="text-muted-foreground">Manage all business locations and facilities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <MapPin className="h-4 w-4" />
            View on Map
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-xs text-muted-foreground">Registered locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeLocations}</div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">States Covered</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStates}</div>
            <p className="text-xs text-muted-foreground">Geographic presence</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location Types</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationTypes.filter((t) => t.count > 0).length}</div>
            <p className="text-xs text-muted-foreground">Different facility types</p>
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
                placeholder="Search locations..."
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
                <TableHead>Location Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>GST Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(location.type)}
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-muted-foreground">{location.id}</div>
                      </div>
                      {location.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{location.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={locationTypes.find((t) => t.name === location.type)?.color}>
                      {location.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {location.city}, {location.state}
                      </div>
                      <div className="text-sm text-muted-foreground">{location.pincode}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{location.contactPerson}</div>
                      <div className="text-sm text-muted-foreground">{location.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {location.gstNumber !== "N/A" ? (
                        location.gstNumber
                      ) : (
                        <span className="text-muted-foreground">Not Applicable</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(location.isActive)}>
                      {location.isActive ? "Active" : "Inactive"}
                    </Badge>
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
                          Edit Location
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <MapPin className="h-4 w-4" />
                          View on Map
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

      {/* Location Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Location Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {locationTypes.map((type) => (
              <div key={type.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getTypeIcon(type.name)}
                  <span className="font-medium">{type.name}</span>
                </div>
                <Badge variant="secondary">{type.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
