"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Phone,
  Star,
  Building,
  CreditCard,
  FileText,
  Download,
  Upload,
} from "lucide-react"

const vendors = [
  {
    id: "VEN001",
    name: "Steel Industries Ltd",
    category: "Raw Materials",
    type: "Manufacturer",
    contact: "Amit Sharma",
    phone: "+91 98765 43210",
    email: "amit@steelindustries.com",
    address: "Plot 45, Industrial Area, Gurgaon, Haryana",
    gst: "06ABCDE1234F1Z5",
    pan: "ABCDE1234F",
    rating: 4.5,
    status: "Active",
    paymentTerms: "30 Days",
    creditLimit: 500000,
    totalOrders: 45,
    totalValue: 2500000,
    lastOrder: "2024-01-15",
  },
  {
    id: "VEN002",
    name: "Mumbai Logistics Co",
    category: "Transportation",
    type: "Service Provider",
    contact: "Priya Patel",
    phone: "+91 87654 32109",
    email: "priya@mumbailogistics.com",
    address: "Warehouse 12, JNPT Road, Mumbai, Maharashtra",
    gst: "27FGHIJ5678K2L6",
    pan: "FGHIJ5678K",
    rating: 4.2,
    status: "Active",
    paymentTerms: "15 Days",
    creditLimit: 200000,
    totalOrders: 78,
    totalValue: 1800000,
    lastOrder: "2024-01-18",
  },
  {
    id: "VEN003",
    name: "Rajasthan Minerals",
    category: "Raw Materials",
    type: "Supplier",
    contact: "Rajesh Kumar",
    phone: "+91 76543 21098",
    email: "rajesh@rajminerals.com",
    address: "Mining Complex, Udaipur, Rajasthan",
    gst: "08KLMNO9012P3Q4",
    pan: "KLMNO9012P",
    rating: 4.0,
    status: "Active",
    paymentTerms: "45 Days",
    creditLimit: 750000,
    totalOrders: 32,
    totalValue: 3200000,
    lastOrder: "2024-01-12",
  },
  {
    id: "VEN004",
    name: "Tech Solutions Pvt Ltd",
    category: "IT Services",
    type: "Service Provider",
    contact: "Neha Singh",
    phone: "+91 65432 10987",
    email: "neha@techsolutions.com",
    address: "IT Park, Sector 62, Noida, UP",
    gst: "09PQRST3456U7V8",
    pan: "PQRST3456U",
    rating: 4.8,
    status: "Active",
    paymentTerms: "30 Days",
    creditLimit: 300000,
    totalOrders: 15,
    totalValue: 850000,
    lastOrder: "2024-01-20",
  },
  {
    id: "VEN005",
    name: "Gujarat Chemicals",
    category: "Chemicals",
    type: "Manufacturer",
    contact: "Kiran Modi",
    phone: "+91 54321 09876",
    email: "kiran@gujaratchem.com",
    address: "Chemical Zone, Vadodara, Gujarat",
    gst: "24UVWXY7890Z1A2",
    pan: "UVWXY7890Z",
    rating: 3.8,
    status: "Inactive",
    paymentTerms: "60 Days",
    creditLimit: 400000,
    totalOrders: 28,
    totalValue: 1600000,
    lastOrder: "2023-12-05",
  },
]

const vendorCategories = [
  "Raw Materials",
  "Transportation",
  "IT Services",
  "Chemicals",
  "Packaging",
  "Machinery",
  "Consulting",
  "Maintenance",
]

const vendorTypes = ["Manufacturer", "Supplier", "Service Provider", "Distributor", "Contractor"]

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || vendor.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || vendor.status.toLowerCase() === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalVendors = vendors.length
  const activeVendors = vendors.filter((v) => v.status === "Active").length
  const totalValue = vendors.reduce((sum, vendor) => sum + vendor.totalValue, 0)
  const avgRating = vendors.reduce((sum, vendor) => sum + vendor.rating, 0) / vendors.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Master</h1>
          <p className="text-muted-foreground mt-2">Manage all your suppliers and service providers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendorName">Vendor Name *</Label>
                      <Input id="vendorName" placeholder="Enter vendor name" />
                    </div>
                    <div>
                      <Label htmlFor="vendorCode">Vendor Code</Label>
                      <Input id="vendorCode" placeholder="Auto-generated" disabled />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendorCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Vendor Type *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendorTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Brief description of vendor services" />
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input id="contactPerson" placeholder="Primary contact name" />
                    </div>
                    <div>
                      <Label htmlFor="designation">Designation</Label>
                      <Input id="designation" placeholder="Job title" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="contact@vendor.com" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Textarea id="address" placeholder="Complete business address" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="City" />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="State" />
                    </div>
                    <div>
                      <Label htmlFor="pincode">PIN Code</Label>
                      <Input id="pincode" placeholder="000000" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gst">GST Number</Label>
                      <Input id="gst" placeholder="GSTIN" />
                    </div>
                    <div>
                      <Label htmlFor="pan">PAN Number</Label>
                      <Input id="pan" placeholder="PAN" />
                    </div>
                    <div>
                      <Label htmlFor="paymentTerms">Payment Terms</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select terms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 Days</SelectItem>
                          <SelectItem value="30">30 Days</SelectItem>
                          <SelectItem value="45">45 Days</SelectItem>
                          <SelectItem value="60">60 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                      <Input id="creditLimit" type="number" placeholder="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input id="bankName" placeholder="Bank name" />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input id="accountNumber" placeholder="Account number" />
                    </div>
                    <div>
                      <Label htmlFor="ifsc">IFSC Code</Label>
                      <Input id="ifsc" placeholder="IFSC code" />
                    </div>
                    <div>
                      <Label htmlFor="branch">Branch</Label>
                      <Input id="branch" placeholder="Branch name" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>GST Certificate</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB</p>
                      </div>
                    </div>
                    <div>
                      <Label>PAN Card</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB</p>
                      </div>
                    </div>
                    <div>
                      <Label>Bank Details</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>Save Vendor</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendors}</div>
            <p className="text-xs text-muted-foreground">{activeVendors} active vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalValue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Total business value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Vendor performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorCategories.length}</div>
            <p className="text-xs text-muted-foreground">Service categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {vendorCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-muted-foreground">{vendor.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vendor.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vendor.contact}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {vendor.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{vendor.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>{vendor.totalOrders}</TableCell>
                    <TableCell>₹{(vendor.totalValue / 100000).toFixed(1)}L</TableCell>
                    <TableCell>
                      <Badge variant={vendor.status === "Active" ? "default" : "secondary"}>{vendor.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Vendor
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View Orders
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
