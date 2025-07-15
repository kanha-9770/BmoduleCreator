import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  History,
  Settings,
  Wrench,
  Store,
  Zap,
} from "lucide-react"

export default function InventoryPage() {
  const inventoryStats = [
    { title: "Total Items", value: "1,267", change: "+12%", icon: Package },
    { title: "Low Stock Items", value: "28", change: "-5%", icon: AlertTriangle },
    { title: "Total Value", value: "₹52.8M", change: "+8%", icon: TrendingUp },
    { title: "Active Items", value: "1,218", change: "+3%", icon: CheckCircle },
  ]

  const inventoryItems = [
    // Machine Master Items
    {
      id: "MAC-001",
      name: "PCM NS-1900 (90 SPEED)",
      category: "Machines",
      sku: "PCM-NS1900-001",
      currentStock: 1,
      minStock: 1,
      maxStock: 2,
      unit: "PCS",
      unitPrice: 2500000,
      totalValue: 2500000,
      location: "Jaipur Warehouse",
      supplier: "PCM Manufacturing",
      lastUpdated: "2024-01-15",
      status: "Active",
      stockStatus: "Normal",
      type: "Machine",
      specifications: "90 Speed, High Precision",
      icon: Settings,
    },
    {
      id: "MAC-002",
      name: "PCM NS-200 (STANDARD)",
      category: "Machines",
      sku: "PCM-NS200-002",
      currentStock: 2,
      minStock: 1,
      maxStock: 3,
      unit: "PCS",
      unitPrice: 1800000,
      totalValue: 3600000,
      location: "Mumbai Warehouse",
      supplier: "PCM Manufacturing",
      lastUpdated: "2024-01-14",
      status: "Active",
      stockStatus: "Normal",
      type: "Machine",
      specifications: "Standard Speed, Reliable",
      icon: Settings,
    },
    {
      id: "MAC-003",
      name: "PCM 22 OZ (CHAIN)",
      category: "Machines",
      sku: "PCM-22OZ-003",
      currentStock: 1,
      minStock: 1,
      maxStock: 2,
      unit: "PCS",
      unitPrice: 2200000,
      totalValue: 2200000,
      location: "Jaipur Warehouse",
      supplier: "PCM Manufacturing",
      lastUpdated: "2024-01-13",
      status: "Active",
      stockStatus: "Normal",
      type: "Machine",
      specifications: "22 OZ Capacity, Chain Drive",
      icon: Settings,
    },

    // Mold Master Items
    {
      id: "MLD-001",
      name: "Injection Mold - Type A",
      category: "Molds",
      sku: "INJ-MOLD-A001",
      currentStock: 5,
      minStock: 2,
      maxStock: 10,
      unit: "PCS",
      unitPrice: 150000,
      totalValue: 750000,
      location: "Jaipur Warehouse",
      supplier: "Precision Molds Ltd",
      lastUpdated: "2024-01-15",
      status: "Active",
      stockStatus: "Normal",
      type: "Mold",
      specifications: "High precision injection mold",
      icon: Wrench,
    },
    {
      id: "MLD-002",
      name: "Compression Mold - Type B",
      category: "Molds",
      sku: "COMP-MOLD-B002",
      currentStock: 3,
      minStock: 2,
      maxStock: 8,
      unit: "PCS",
      unitPrice: 120000,
      totalValue: 360000,
      location: "Mumbai Warehouse",
      supplier: "Advanced Tooling Co",
      lastUpdated: "2024-01-14",
      status: "Active",
      stockStatus: "Normal",
      type: "Mold",
      specifications: "Compression molding tool",
      icon: Wrench,
    },
    {
      id: "MLD-003",
      name: "Blow Mold - Type C",
      category: "Molds",
      sku: "BLOW-MOLD-C003",
      currentStock: 1,
      minStock: 2,
      maxStock: 6,
      unit: "PCS",
      unitPrice: 180000,
      totalValue: 180000,
      location: "On The Way",
      supplier: "Mold Masters Inc",
      lastUpdated: "2024-01-13",
      status: "Active",
      stockStatus: "Low Stock",
      type: "Mold",
      specifications: "Blow molding equipment",
      icon: Wrench,
    },

    // Store Master Items
    {
      id: "STR-001",
      name: "Raw Material Store",
      category: "Stores",
      sku: "RM-STORE-001",
      currentStock: 1,
      minStock: 1,
      maxStock: 1,
      unit: "UNIT",
      unitPrice: 500000,
      totalValue: 500000,
      location: "Jaipur Warehouse",
      supplier: "Internal Setup",
      lastUpdated: "2024-01-15",
      status: "Active",
      stockStatus: "Normal",
      type: "Store",
      specifications: "Climate controlled storage",
      icon: Store,
    },
    {
      id: "STR-002",
      name: "Finished Goods Store",
      category: "Stores",
      sku: "FG-STORE-002",
      currentStock: 1,
      minStock: 1,
      maxStock: 1,
      unit: "UNIT",
      unitPrice: 750000,
      totalValue: 750000,
      location: "Mumbai Warehouse",
      supplier: "Internal Setup",
      lastUpdated: "2024-01-14",
      status: "Active",
      stockStatus: "Normal",
      type: "Store",
      specifications: "Automated storage system",
      icon: Store,
    },
    {
      id: "STR-003",
      name: "Tool Store",
      category: "Stores",
      sku: "TOOL-STORE-003",
      currentStock: 1,
      minStock: 1,
      maxStock: 1,
      unit: "UNIT",
      unitPrice: 300000,
      totalValue: 300000,
      location: "Jaipur Warehouse",
      supplier: "Internal Setup",
      lastUpdated: "2024-01-13",
      status: "Active",
      stockStatus: "Normal",
      type: "Store",
      specifications: "Organized tool storage",
      icon: Store,
    },

    // Metal Master Items
    {
      id: "MTL-001",
      name: "Stainless Steel 316L",
      category: "Metals",
      sku: "SS-316L-001",
      currentStock: 2500,
      minStock: 500,
      maxStock: 5000,
      unit: "KG",
      unitPrice: 450,
      totalValue: 1125000,
      location: "Jaipur Warehouse",
      supplier: "Steel Industries Ltd",
      lastUpdated: "2024-01-15",
      status: "Active",
      stockStatus: "Normal",
      type: "Metal",
      specifications: "High grade stainless steel",
      icon: Zap,
    },
    {
      id: "MTL-002",
      name: "Aluminum Alloy 6061",
      category: "Metals",
      sku: "AL-6061-002",
      currentStock: 1800,
      minStock: 400,
      maxStock: 4000,
      unit: "KG",
      unitPrice: 280,
      totalValue: 504000,
      location: "Mumbai Warehouse",
      supplier: "Mumbai Metals Co",
      lastUpdated: "2024-01-14",
      status: "Active",
      stockStatus: "Normal",
      type: "Metal",
      specifications: "Aircraft grade aluminum",
      icon: Zap,
    },
    {
      id: "MTL-003",
      name: "Carbon Steel A36",
      category: "Metals",
      sku: "CS-A36-003",
      currentStock: 150,
      minStock: 300,
      maxStock: 2000,
      unit: "KG",
      unitPrice: 85,
      totalValue: 12750,
      location: "On The Way",
      supplier: "Rajasthan Minerals",
      lastUpdated: "2024-01-13",
      status: "Active",
      stockStatus: "Low Stock",
      type: "Metal",
      specifications: "Structural carbon steel",
      icon: Zap,
    },
    {
      id: "MTL-004",
      name: "Copper C101",
      category: "Metals",
      sku: "CU-C101-004",
      currentStock: 800,
      minStock: 200,
      maxStock: 1500,
      unit: "KG",
      unitPrice: 650,
      totalValue: 520000,
      location: "Mumbai Warehouse",
      supplier: "Gujarat Chemicals",
      lastUpdated: "2024-01-12",
      status: "Active",
      stockStatus: "Normal",
      type: "Metal",
      specifications: "Pure copper for electrical",
      icon: Zap,
    },

    // Regular Inventory Items
    {
      id: "INV-001",
      name: "Steel Rod 12mm",
      category: "Raw Materials",
      sku: "SR-12MM-001",
      currentStock: 450,
      minStock: 100,
      maxStock: 1000,
      unit: "KG",
      unitPrice: 85.5,
      totalValue: 38475,
      location: "Jaipur Warehouse",
      supplier: "Steel Industries Ltd",
      lastUpdated: "2024-01-15",
      status: "Active",
      stockStatus: "Normal",
      type: "Raw Material",
      specifications: "12mm diameter steel rod",
      icon: Package,
    },
    {
      id: "INV-002",
      name: "Hydraulic Oil SAE 32",
      category: "Consumables",
      sku: "HO-SAE32-003",
      currentStock: 200,
      minStock: 50,
      maxStock: 300,
      unit: "LTR",
      unitPrice: 45.75,
      totalValue: 9150,
      location: "Jaipur Warehouse",
      supplier: "Gujarat Chemicals",
      lastUpdated: "2024-01-13",
      status: "Active",
      stockStatus: "Normal",
      type: "Consumable",
      specifications: "SAE 32 hydraulic fluid",
      icon: Package,
    },
    {
      id: "INV-003",
      name: "Bearing 6205-2RS",
      category: "Spare Parts",
      sku: "BR-6205-004",
      currentStock: 150,
      minStock: 25,
      maxStock: 200,
      unit: "PCS",
      unitPrice: 185.0,
      totalValue: 27750,
      location: "Mumbai Warehouse",
      supplier: "Bearing Solutions",
      lastUpdated: "2024-01-12",
      status: "Active",
      stockStatus: "Normal",
      type: "Spare Part",
      specifications: "Deep groove ball bearing",
      icon: Package,
    },
  ]

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "Low Stock":
        return "destructive"
      case "Out of Stock":
        return "destructive"
      case "Normal":
        return "default"
      case "Overstock":
        return "secondary"
      default:
        return "default"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Machine":
        return Settings
      case "Mold":
        return Wrench
      case "Store":
        return Store
      case "Metal":
        return Zap
      default:
        return Package
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Machine":
        return "bg-blue-100 text-blue-800"
      case "Mold":
        return "bg-purple-100 text-purple-800"
      case "Store":
        return "bg-green-100 text-green-800"
      case "Metal":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Master</h1>
          <p className="text-muted-foreground">
            Manage all inventory items including machines, molds, stores, metals, and materials
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>Create a new inventory item with complete details</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="stock">Stock Details</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="additional">Additional</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemName">Item Name</Label>
                      <Input id="itemName" placeholder="Enter item name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" placeholder="Enter SKU" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="machines">Machines</SelectItem>
                          <SelectItem value="molds">Molds</SelectItem>
                          <SelectItem value="stores">Stores</SelectItem>
                          <SelectItem value="metals">Metals</SelectItem>
                          <SelectItem value="raw-materials">Raw Materials</SelectItem>
                          <SelectItem value="consumables">Consumables</SelectItem>
                          <SelectItem value="spare-parts">Spare Parts</SelectItem>
                          <SelectItem value="tools">Tools</SelectItem>
                          <SelectItem value="finished-goods">Finished Goods</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="machine">Machine</SelectItem>
                          <SelectItem value="mold">Mold</SelectItem>
                          <SelectItem value="store">Store</SelectItem>
                          <SelectItem value="metal">Metal</SelectItem>
                          <SelectItem value="raw-material">Raw Material</SelectItem>
                          <SelectItem value="consumable">Consumable</SelectItem>
                          <SelectItem value="spare-part">Spare Part</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uom">Unit of Measure</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select UOM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">KG</SelectItem>
                          <SelectItem value="pcs">PCS</SelectItem>
                          <SelectItem value="ltr">LTR</SelectItem>
                          <SelectItem value="mtr">MTR</SelectItem>
                          <SelectItem value="unit">UNIT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specifications">Specifications</Label>
                    <Textarea id="specifications" placeholder="Enter item specifications" />
                  </div>
                </TabsContent>
                <TabsContent value="stock" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentStock">Current Stock</Label>
                      <Input id="currentStock" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minStock">Minimum Stock</Label>
                      <Input id="minStock" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxStock">Maximum Stock</Label>
                      <Input id="maxStock" type="number" placeholder="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Primary Location</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jaipur">Jaipur Warehouse</SelectItem>
                          <SelectItem value="mumbai">Mumbai Warehouse</SelectItem>
                          <SelectItem value="otw">On The Way</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Primary Supplier</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="steel-ind">Steel Industries Ltd</SelectItem>
                          <SelectItem value="mumbai-metals">Mumbai Metals Co</SelectItem>
                          <SelectItem value="gujarat-chem">Gujarat Chemicals</SelectItem>
                          <SelectItem value="pcm-mfg">PCM Manufacturing</SelectItem>
                          <SelectItem value="precision-molds">Precision Molds Ltd</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                      <Input id="unitPrice" type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select defaultValue="inr">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inr">INR (₹)</SelectItem>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="additional" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hsn">HSN Code</Label>
                      <Input id="hsn" placeholder="Enter HSN code" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select defaultValue="active">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Additional notes or specifications" />
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {inventoryStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>{stat.change}</span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Filter Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Categories</CardTitle>
          <CardDescription>Quick filter by inventory type</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="machines">Machines</TabsTrigger>
              <TabsTrigger value="molds">Molds</TabsTrigger>
              <TabsTrigger value="stores">Stores</TabsTrigger>
              <TabsTrigger value="metals">Metals</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                Complete inventory including machines, molds, stores, metals, and materials
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search items..." className="pl-8 w-64" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Item Details</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Stock Info</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Pricing</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Location</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => {
                    const TypeIcon = getTypeIcon(item.type)
                    return (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <TypeIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.sku} • {item.category}
                              </div>
                              {item.specifications && (
                                <div className="text-xs text-muted-foreground mt-1">{item.specifications}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">
                              {item.currentStock.toLocaleString()} {item.unit}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Min: {item.minStock} • Max: {item.maxStock}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">₹{item.unitPrice.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              Total: ₹{item.totalValue.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{item.location}</div>
                            <div className="text-sm text-muted-foreground">{item.supplier}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <Badge variant={item.status === "Active" ? "default" : "secondary"}>{item.status}</Badge>
                            <Badge variant={getStockStatusColor(item.stockStatus)}>{item.stockStatus}</Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <TypeIcon className="h-5 w-5" />
                                    {item.name} Details
                                  </DialogTitle>
                                  <DialogDescription>Complete information for {item.name}</DialogDescription>
                                </DialogHeader>
                                <Tabs defaultValue="overview" className="w-full">
                                  <TabsList className="grid w-full grid-cols-5">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="stock">Stock History</TabsTrigger>
                                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                    <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="overview" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-semibold mb-2">Basic Information</h4>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Item ID:</span>
                                              <span>{item.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">SKU:</span>
                                              <span>{item.sku}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Category:</span>
                                              <span>{item.category}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Type:</span>
                                              <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Unit:</span>
                                              <span>{item.unit}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Status:</span>
                                              <Badge variant={item.status === "Active" ? "default" : "secondary"}>
                                                {item.status}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="font-semibold mb-2">Specifications</h4>
                                          <div className="text-sm text-muted-foreground">
                                            {item.specifications || "No specifications available"}
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="font-semibold mb-2">Location & Supplier</h4>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Primary Location:</span>
                                              <span>{item.location}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Primary Supplier:</span>
                                              <span>{item.supplier}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Last Updated:</span>
                                              <span>{item.lastUpdated}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-semibold mb-2">Stock Information</h4>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Current Stock:</span>
                                              <span className="font-medium">
                                                {item.currentStock.toLocaleString()} {item.unit}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Minimum Stock:</span>
                                              <span>
                                                {item.minStock} {item.unit}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Maximum Stock:</span>
                                              <span>
                                                {item.maxStock} {item.unit}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Stock Status:</span>
                                              <Badge variant={getStockStatusColor(item.stockStatus)}>
                                                {item.stockStatus}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="font-semibold mb-2">Pricing Information</h4>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Unit Price:</span>
                                              <span className="font-medium">₹{item.unitPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Total Value:</span>
                                              <span className="font-medium">₹{item.totalValue.toLocaleString()}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="stock" className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-4">Stock Movement History</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between p-3 border rounded">
                                          <div className="flex items-center gap-3">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            <div>
                                              <div className="font-medium">Stock In</div>
                                              <div className="text-sm text-muted-foreground">
                                                Purchase Order #PO-2024-001
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-medium">
                                              +{Math.floor(item.currentStock * 0.2)} {item.unit}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Jan 15, 2024</div>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 border rounded">
                                          <div className="flex items-center gap-3">
                                            <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                                            <div>
                                              <div className="font-medium">Stock Out</div>
                                              <div className="text-sm text-muted-foreground">
                                                {item.type === "Machine"
                                                  ? "Installation"
                                                  : "Production Order #PRO-2024-005"}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-medium">
                                              -{Math.floor(item.currentStock * 0.1)} {item.unit}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Jan 14, 2024</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="transactions" className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-4">Recent Transactions</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between p-3 border rounded">
                                          <div>
                                            <div className="font-medium">Purchase - PO-2024-001</div>
                                            <div className="text-sm text-muted-foreground">From: {item.supplier}</div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-medium">
                                              ₹{Math.floor(item.totalValue * 0.3).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Jan 15, 2024</div>
                                          </div>
                                        </div>
                                        {item.type !== "Machine" && item.type !== "Store" && (
                                          <div className="flex items-center justify-between p-3 border rounded">
                                            <div>
                                              <div className="font-medium">Issue - PRO-2024-005</div>
                                              <div className="text-sm text-muted-foreground">To: Production Dept</div>
                                            </div>
                                            <div className="text-right">
                                              <div className="font-medium">
                                                ₹{Math.floor(item.totalValue * 0.15).toLocaleString()}
                                              </div>
                                              <div className="text-sm text-muted-foreground">Jan 14, 2024</div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="suppliers" className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-4">Supplier Information</h4>
                                      <div className="space-y-3">
                                        <div className="p-3 border rounded">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium">{item.supplier}</div>
                                            <Badge>Primary</Badge>
                                          </div>
                                          <div className="text-sm text-muted-foreground space-y-1">
                                            <div>Last Purchase: Jan 15, 2024</div>
                                            <div>Average Lead Time: {item.type === "Machine" ? "30" : "5"} days</div>
                                            <div>Rating: 4.5/5</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="analytics" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <Card>
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-sm">
                                            {item.type === "Machine" ? "Utilization Rate" : "Stock Turnover"}
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="text-2xl font-bold">
                                            {item.type === "Machine" ? "85%" : "2.4x"}
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                            {item.type === "Machine" ? "Machine utilization" : "Annual turnover rate"}
                                          </p>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-sm">Average Lead Time</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="text-2xl font-bold">
                                            {item.type === "Machine" ? "30" : "5"} days
                                          </div>
                                          <p className="text-xs text-muted-foreground">From order to receipt</p>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-sm">
                                            {item.type === "Machine" ? "Maintenance Cost" : "Reorder Point"}
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="text-2xl font-bold">
                                            {item.type === "Machine"
                                              ? `₹${Math.floor(item.unitPrice * 0.05).toLocaleString()}`
                                              : `${Math.floor(item.minStock * 1.5)} ${item.unit}`}
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                            {item.type === "Machine"
                                              ? "Annual maintenance"
                                              : "Calculated reorder level"}
                                          </p>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-sm">
                                            {item.type === "Machine" ? "Efficiency" : "Safety Stock"}
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="text-2xl font-bold">
                                            {item.type === "Machine"
                                              ? "92%"
                                              : `${Math.floor(item.minStock * 0.5)} ${item.unit}`}
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                            {item.type === "Machine" ? "Overall efficiency" : "Recommended buffer"}
                                          </p>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <History className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
