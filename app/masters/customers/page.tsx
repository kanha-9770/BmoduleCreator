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
  Users,
  MapPin,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react"

const customers = [
  {
    id: "CUST-001",
    name: "Acme Corporation",
    code: "ACME001",
    category: "Enterprise",
    group: "Tier 1",
    contactPerson: "John Smith",
    email: "john.smith@acme.com",
    phone: "+1-555-0123",
    address: "123 Business Ave, New York, NY 10001",
    city: "New York",
    state: "NY",
    country: "USA",
    pincode: "10001",
    gstNumber: "29ABCDE1234F1Z5",
    panNumber: "ABCDE1234F",
    creditLimit: 500000,
    creditDays: 30,
    priceList: "Standard",
    territory: "North East",
    status: "Active",
    totalOrders: 156,
    totalValue: 2847392,
    lastOrderDate: "2024-01-15",
  },
  {
    id: "CUST-002",
    name: "Tech Solutions Ltd",
    code: "TECH002",
    category: "SME",
    group: "Tier 2",
    contactPerson: "Sarah Johnson",
    email: "sarah@techsolutions.com",
    phone: "+1-555-0456",
    address: "456 Tech Park, San Francisco, CA 94105",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    pincode: "94105",
    gstNumber: "06FGHIJ5678K2L9",
    panNumber: "FGHIJ5678K",
    creditLimit: 250000,
    creditDays: 45,
    priceList: "Premium",
    territory: "West Coast",
    status: "Active",
    totalOrders: 89,
    totalValue: 1456789,
    lastOrderDate: "2024-01-12",
  },
  {
    id: "CUST-003",
    name: "Global Industries",
    code: "GLOB003",
    category: "Enterprise",
    group: "Tier 1",
    contactPerson: "Michael Brown",
    email: "m.brown@globalind.com",
    phone: "+1-555-0789",
    address: "789 Industrial Blvd, Chicago, IL 60601",
    city: "Chicago",
    state: "IL",
    country: "USA",
    pincode: "60601",
    gstNumber: "27KLMNO9012P3Q4",
    panNumber: "KLMNO9012P",
    creditLimit: 750000,
    creditDays: 60,
    priceList: "Enterprise",
    territory: "Midwest",
    status: "Active",
    totalOrders: 234,
    totalValue: 4567890,
    lastOrderDate: "2024-01-18",
  },
  {
    id: "CUST-004",
    name: "Manufacturing Co",
    code: "MANU004",
    category: "SME",
    group: "Tier 2",
    contactPerson: "Lisa Davis",
    email: "lisa@manufacturingco.com",
    phone: "+1-555-0321",
    address: "321 Factory St, Detroit, MI 48201",
    city: "Detroit",
    state: "MI",
    country: "USA",
    pincode: "48201",
    gstNumber: "23RSTUV3456W7X8",
    panNumber: "RSTUV3456W",
    creditLimit: 300000,
    creditDays: 30,
    priceList: "Standard",
    territory: "Midwest",
    status: "Inactive",
    totalOrders: 67,
    totalValue: 987654,
    lastOrderDate: "2023-12-20",
  },
]

const customerCategories = [
  { name: "Enterprise", count: 45, active: 42, inactive: 3 },
  { name: "SME", count: 156, active: 148, inactive: 8 },
  { name: "Startup", count: 89, active: 85, inactive: 4 },
  { name: "Government", count: 23, active: 23, inactive: 0 },
  { name: "Individual", count: 29, active: 27, inactive: 2 },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800"
    case "Inactive":
      return "bg-red-100 text-red-800"
    case "Suspended":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Masters</h1>
          <p className="text-muted-foreground">Manage customer information and relationships</p>
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
            Add Customer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-muted-foreground">+23 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">325</div>
                <p className="text-xs text-muted-foreground">95.0% of total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Credit Limit</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12.5M</div>
                <p className="text-xs text-muted-foreground">Approved credit limits</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$18,450</div>
                <p className="text-xs text-muted-foreground">Per customer</p>
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
                    placeholder="Search customers..."
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
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Credit Limit</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{customer.code}</TableCell>
                      <TableCell>
                        <div>
                          <div>{customer.contactPerson}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {customer.city}, {customer.state}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{customer.category}</Badge>
                      </TableCell>
                      <TableCell>${customer.creditLimit.toLocaleString()}</TableCell>
                      <TableCell>
                        <div>
                          <div>{customer.totalOrders}</div>
                          <div className="text-sm text-muted-foreground">${customer.totalValue.toLocaleString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
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
                              Edit Customer
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

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Categories</CardTitle>
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
                    <TableHead>Total Customers</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Inactive</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerCategories.map((category) => (
                    <TableRow key={category.name}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.count}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">{category.active}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category.inactive}</Badge>
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
                              View Customers
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

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerCategories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category.name}</span>
                        <span>{category.count} customers</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(category.count / 342) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Active Customers</span>
                    </div>
                    <span className="font-semibold">325</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Inactive Customers</span>
                    </div>
                    <span className="font-semibold">17</span>
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
