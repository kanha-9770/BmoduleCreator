"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Building,
  Tag,
  Users,
  Download,
  Upload,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

const vendorCategories = [
  {
    id: "CAT001",
    name: "Raw Materials",
    code: "RAW",
    description: "Suppliers of raw materials for manufacturing",
    vendorCount: 15,
    status: "Active",
    createdDate: "2024-01-15",
    lastModified: "2024-01-20",
  },
  {
    id: "CAT002",
    name: "Transportation",
    code: "TRANS",
    description: "Logistics and transportation service providers",
    vendorCount: 8,
    status: "Active",
    createdDate: "2024-01-10",
    lastModified: "2024-01-18",
  },
  {
    id: "CAT003",
    name: "IT Services",
    code: "IT",
    description: "Information technology and software service providers",
    vendorCount: 5,
    status: "Active",
    createdDate: "2024-01-08",
    lastModified: "2024-01-16",
  },
  {
    id: "CAT004",
    name: "Chemicals",
    code: "CHEM",
    description: "Chemical suppliers and manufacturers",
    vendorCount: 12,
    status: "Active",
    createdDate: "2024-01-05",
    lastModified: "2024-01-14",
  },
  {
    id: "CAT005",
    name: "Packaging",
    code: "PKG",
    description: "Packaging materials and solutions providers",
    vendorCount: 7,
    status: "Active",
    createdDate: "2024-01-03",
    lastModified: "2024-01-12",
  },
  {
    id: "CAT006",
    name: "Machinery",
    code: "MACH",
    description: "Industrial machinery and equipment suppliers",
    vendorCount: 9,
    status: "Active",
    createdDate: "2023-12-28",
    lastModified: "2024-01-10",
  },
  {
    id: "CAT007",
    name: "Consulting",
    code: "CONS",
    description: "Business and technical consulting services",
    vendorCount: 3,
    status: "Active",
    createdDate: "2023-12-25",
    lastModified: "2024-01-08",
  },
  {
    id: "CAT008",
    name: "Maintenance",
    code: "MAINT",
    description: "Equipment maintenance and repair services",
    vendorCount: 6,
    status: "Inactive",
    createdDate: "2023-12-20",
    lastModified: "2023-12-30",
  },
]

export default function VendorCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  const filteredCategories = vendorCategories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || category.status.toLowerCase() === selectedStatus

    return matchesSearch && matchesStatus
  })

  const totalCategories = vendorCategories.length
  const activeCategories = vendorCategories.filter((c) => c.status === "Active").length
  const totalVendors = vendorCategories.reduce((sum, category) => sum + category.vendorCount, 0)

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/masters/vendors">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vendors
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Vendor Category Master</h1>
            <p className="text-muted-foreground mt-2">Manage vendor categories and classifications</p>
          </div>
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
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Vendor Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoryName">Category Name *</Label>
                    <Input id="categoryName" placeholder="Enter category name" />
                  </div>
                  <div>
                    <Label htmlFor="categoryCode">Category Code *</Label>
                    <Input id="categoryCode" placeholder="Enter category code" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Brief description of the category" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parentCategory">Parent Category</Label>
                    <Input id="parentCategory" placeholder="Optional parent category" />
                  </div>
                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input id="sortOrder" type="number" placeholder="Display order" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>Save Category</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">{activeCategories} active categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendors}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Category</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Raw Materials</div>
            <p className="text-xs text-muted-foreground">15 vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Category</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalVendors / totalCategories)}</div>
            <p className="text-xs text-muted-foreground">Vendors per category</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vendors</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{category.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={category.description}>
                        {category.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{category.vendorCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.status === "Active" ? "default" : "secondary"}>{category.status}</Badge>
                    </TableCell>
                    <TableCell>{category.lastModified}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEdit(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Category
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            View Vendors
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vendor Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editCategoryName">Category Name *</Label>
                  <Input id="editCategoryName" defaultValue={editingCategory.name} />
                </div>
                <div>
                  <Label htmlFor="editCategoryCode">Category Code *</Label>
                  <Input id="editCategoryCode" defaultValue={editingCategory.code} />
                </div>
              </div>
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea id="editDescription" defaultValue={editingCategory.description} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editParentCategory">Parent Category</Label>
                  <Input id="editParentCategory" placeholder="Optional parent category" />
                </div>
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <select
                    id="editStatus"
                    defaultValue={editingCategory.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>Update Category</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
