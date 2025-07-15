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
  FileText,
  Settings,
  Zap,
  Package,
  DollarSign,
  Wrench,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Sample machine data based on your format
const machineData = [
  {
    srNo: 1,
    // Product Identification
    productCategory: "PAPER CUP MACHINE",
    productName: "PCM NS-1900 (90 SPEED)",
    nesscoModelNo: "NS-1900",
    variant: "",
    productId: "NS-1900",
    modelPrefix: "M",
    productStatus: "INACTIVE",
    hsnCode: "84418000",

    // Technical Specs
    machineSpeed: 90,
    stableSpeed: 70,
    uomSpeed: "Pcs/Min.",
    weight: 2300,
    power: 3.5,

    // Dimensions
    p1Dimension: "2700X1100X1828",
    p2Dimension: "N/A",
    p3Dimension: "N/A",

    // Product Size Limits
    bottomDiaMin: 30,
    bottomDiaMax: 75,
    topDiaMin: "XX",
    topDiaMax: 90,
    heightMin: 30,
    heightMax: 115,
    knurlingDepthMax: 12,

    // Financial Data
    domesticPriceMin: null,
    domesticPriceMax: null,
    domesticPriceAvg: null,
    exportPriceMin: null,
    exportPriceMax: null,
    exportPriceAvg: null,
    currency: "BOTH",

    // Technical Details
    operatingVoltage: "380VAC-400VAC",
    phaseRequirement: "3P",
    startingLoad: 8,
    runningLoad: 5,
    stabilizerLoad: 15,
    airFlowRate: null,
    airFlowRateUom: "",
    airPressure: null,
    airPressureUom: "",

    // Package Details
    productWeight: null,
    noOfPackages: 1,
    package1: "2616*1041*1778",
    package2: "",
    package3: "",
    package4: "",

    // Remarks
    remark:
      "THIS MACHINE HAVE TWO MODEL- ONE IS SMALL FRAME (WHICH CAN MAKE MAX. HEIGHT-74 MM ) AND SECOND IS BIG FRAME ( MAX.HEIGHT- 115) . PAPER GSM - 140-270 GSM.",
    websiteDisplayStatus: "NO",

    // Links and Documentation
    catalogueDomestic: "https://drive.google.com/drive/folders/1FvfnqpIM6t0ZgkYwBm_nrkhUWAYSccXp",
    catalogueExport: "https://drive.google.com/drive/folders/13iS8DFP74o2EGmwUl4itJueoFn2om_PI",
    youtubeLink: "https://youtu.be/6uOtCQ5BHWI?si=-KHtiQ1rQB9ji0nr",

    // Add-ons
    defaultAddOns: "",
    extraAddOns: "",
  },
  {
    srNo: 2,
    productCategory: "PAPER CUP MACHINE",
    productName: "PCM 22 OZ (CHAIN)",
    nesscoModelNo: "NS-B2200",
    variant: "",
    productId: "NS-B2200",
    modelPrefix: "M",
    productStatus: "OLD PRODUCT - BASED ON DEMAND",
    hsnCode: "84418000",

    machineSpeed: 75,
    stableSpeed: 55,
    uomSpeed: "Pcs/Min.",
    weight: 2600,
    power: 5,

    p1Dimension: "2900X1300X1750",
    p2Dimension: "N/A",
    p3Dimension: "N/A",

    bottomDiaMin: 59,
    bottomDiaMax: 95,
    topDiaMin: 90,
    topDiaMax: 120,
    heightMin: 100,
    heightMax: 180,
    knurlingDepthMax: null,

    domesticPriceMin: null,
    domesticPriceMax: null,
    domesticPriceAvg: null,
    exportPriceMin: null,
    exportPriceMax: null,
    exportPriceAvg: null,
    currency: "BOTH",

    operatingVoltage: "380VAC-400VAC",
    phaseRequirement: "3P",
    startingLoad: 14,
    runningLoad: 10,
    stabilizerLoad: 20,
    airFlowRate: 22,
    airFlowRateUom: "CFM",
    airPressure: "6 TO 8",
    airPressureUom: "bar",

    productWeight: null,
    noOfPackages: null,
    package1: "",
    package2: "",
    package3: "",
    package4: "",

    remark:
      "THIS MACHINE CAN MAKE BIG HEIGHT CUP LIKE COLD DRINK CUP. THIS IS CHAIN BASED MODEL.PAPER GSM- 150-350GSM.",
    websiteDisplayStatus: "NO",

    catalogueDomestic: "https://drive.google.com/drive/folders/10Jjrulq424Q7wmz0_POUQcgfPxWnpUNe",
    catalogueExport: "https://drive.google.com/drive/folders/1Z7XvGEQ978CKjvOaGodJK0UHDadD5MGN",
    youtubeLink: "https://youtu.be/8wEGS8ZInU0?si=7SrtwfYTqIvZKQ6J",

    defaultAddOns: "",
    extraAddOns: "",
  },
  {
    srNo: 3,
    productCategory: "PAPER CUP MACHINE",
    productName: "PCM NS-200 (STANDARD)",
    nesscoModelNo: "NS-200",
    variant: "NS-200(S)",
    productId: "NS-200NS-200(S)",
    modelPrefix: "Q",
    productStatus: "ACTIVE",
    hsnCode: "84418000",

    machineSpeed: 120,
    stableSpeed: 85,
    uomSpeed: "Pcs/Min.",
    weight: 2500,
    power: 3.5,

    p1Dimension: "2300X1100",
    p2Dimension: "N/A",
    p3Dimension: "N/A",

    bottomDiaMin: 30,
    bottomDiaMax: 70,
    topDiaMin: "XX",
    topDiaMax: 90,
    heightMin: 30,
    heightMax: 130,
    knurlingDepthMax: null,

    domesticPriceMin: null,
    domesticPriceMax: null,
    domesticPriceAvg: null,
    exportPriceMin: null,
    exportPriceMax: null,
    exportPriceAvg: null,
    currency: "BOTH",

    operatingVoltage: "380VAC-400VAC",
    phaseRequirement: "3P",
    startingLoad: 8,
    runningLoad: 6,
    stabilizerLoad: 15,
    airFlowRate: 0.3,
    airFlowRateUom: "m3/min",
    airPressure: "0.5-0.8",
    airPressureUom: "Mpa",

    productWeight: null,
    noOfPackages: 1,
    package1: "2300*1200*1700",
    package2: "",
    package3: "",
    package4: "",

    remark:
      "THIS IS OUR STANDARD NS-200 MODEL WITHOUT ULTRASONIC AND HOT BLOWER. OPERATING CONTROL SYSTEM - STANDARD. PAPER GSM - 130-450 GSM.",
    websiteDisplayStatus: "NO",

    catalogueDomestic: "https://drive.google.com/drive/folders/1PtWtsf3KV518ioA2Sj38GuBEaTbhZr7Q",
    catalogueExport: "https://drive.google.com/drive/folders/1kSZQrw9TP__29uAD5fVXtutpco1j4Si7",
    youtubeLink: "https://youtu.be/nX2WmoFkDoc?si=j44NQVmoBI15X1XD",

    defaultAddOns:
      "RING HEATER, SEALING PENCIL HEATER, WASTE BOTTOM REEL CUTTER, WASTE BOTTOM CONVEYOR OUT, MANUAL COLLECTION, CYLINDER BASED SUCTION",
    extraAddOns:
      "RING HOT AIR BLOWER, ELEMENT HOT AIR BLOWER, LEISTER ELEMENT HOT AIR BLOWER, ULTRASONIC, WASTE BOTTOM REEL DIRECT, AUTO BOTTOM FEEDER (STEPPER), PRE BOTTOM FEEDER (GEAR MOTOR), PRE-FOLD PARAFFIN DISPENSOR (2PE), 2PE COOLING KIT, AUTO COLLECTION, PACKING TRANSFER TABLE, TRANSFER TABLE, PLC + HMI",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800"
    case "INACTIVE":
      return "bg-red-100 text-red-800"
    case "OLD PRODUCT - BASED ON DEMAND":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function MachineMasterPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMachine, setSelectedMachine] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const filteredMachines = machineData.filter(
    (machine) =>
      machine.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.nesscoModelNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.productCategory.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const openMachineDetails = (machine: any) => {
    setSelectedMachine(machine)
    setIsDetailDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Machine Master</h1>
          <p className="text-muted-foreground">Comprehensive machine specifications and details</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Machine
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Machines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{machineData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{machineData.filter((m) => m.productStatus === "ACTIVE").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paper Cup Machines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {machineData.filter((m) => m.productCategory === "PAPER CUP MACHINE").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(machineData.reduce((sum, m) => sum + m.machineSpeed, 0) / machineData.length)} pcs/min
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search machines..."
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
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sr No</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Model No</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Power</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachines.map((machine) => (
                <TableRow key={machine.srNo}>
                  <TableCell className="font-medium">{machine.srNo}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{machine.productName}</div>
                      <div className="text-sm text-muted-foreground">{machine.productId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{machine.nesscoModelNo}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{machine.productCategory}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {machine.machineSpeed} {machine.uomSpeed}
                      </div>
                      <div className="text-muted-foreground">Stable: {machine.stableSpeed}</div>
                    </div>
                  </TableCell>
                  <TableCell>{machine.power} kW</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(machine.productStatus)}>{machine.productStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openMachineDetails(machine)} className="gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <FileText className="h-4 w-4" />
                          Generate Report
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

      {/* Machine Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {selectedMachine?.productName} - Complete Specifications
            </DialogTitle>
          </DialogHeader>

          {selectedMachine && (
            <Tabs defaultValue="identification" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="identification">Identification</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="service">Service</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
              </TabsList>

              <TabsContent value="identification" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Product Identification Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Product Category</label>
                      <p className="font-medium">{selectedMachine.productCategory}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                      <p className="font-medium">{selectedMachine.productName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nessco Model No</label>
                      <p className="font-medium">{selectedMachine.nesscoModelNo}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Variant</label>
                      <p className="font-medium">{selectedMachine.variant || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Product ID</label>
                      <p className="font-medium">{selectedMachine.productId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">HSN Code</label>
                      <p className="font-medium">{selectedMachine.hsnCode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Product Status</label>
                      <Badge className={getStatusColor(selectedMachine.productStatus)}>
                        {selectedMachine.productStatus}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Website Display</label>
                      <p className="font-medium">{selectedMachine.websiteDisplayStatus}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Size Limits</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bottom Diameter</label>
                      <p className="font-medium">
                        {selectedMachine.bottomDiaMin} - {selectedMachine.bottomDiaMax} mm
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Top Diameter</label>
                      <p className="font-medium">
                        {selectedMachine.topDiaMin} - {selectedMachine.topDiaMax} mm
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Height Range</label>
                      <p className="font-medium">
                        {selectedMachine.heightMin} - {selectedMachine.heightMax} mm
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Remarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedMachine.remark}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Technical Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Machine Speed</label>
                      <p className="font-medium">
                        {selectedMachine.machineSpeed} {selectedMachine.uomSpeed}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Stable Speed</label>
                      <p className="font-medium">
                        {selectedMachine.stableSpeed} {selectedMachine.uomSpeed}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Weight</label>
                      <p className="font-medium">{selectedMachine.weight} kg</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Power</label>
                      <p className="font-medium">{selectedMachine.power} kW</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Operating Voltage</label>
                      <p className="font-medium">{selectedMachine.operatingVoltage}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phase Requirement</label>
                      <p className="font-medium">{selectedMachine.phaseRequirement}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Starting Load</label>
                      <p className="font-medium">{selectedMachine.startingLoad} kW</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Running Load</label>
                      <p className="font-medium">{selectedMachine.runningLoad} kW</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Stabilizer Load</label>
                      <p className="font-medium">{selectedMachine.stabilizerLoad} KVA</p>
                    </div>
                    {selectedMachine.airFlowRate && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Air Flow Rate</label>
                        <p className="font-medium">
                          {selectedMachine.airFlowRate} {selectedMachine.airFlowRateUom}
                        </p>
                      </div>
                    )}
                    {selectedMachine.airPressure && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Air Pressure</label>
                        <p className="font-medium">
                          {selectedMachine.airPressure} {selectedMachine.airPressureUom}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dimensions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Dimensional Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">P1 Dimension</label>
                      <p className="font-medium">{selectedMachine.p1Dimension} mm</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">P2 Dimension</label>
                      <p className="font-medium">{selectedMachine.p2Dimension}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">P3 Dimension</label>
                      <p className="font-medium">{selectedMachine.p3Dimension}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Number of Packages</label>
                      <p className="font-medium">{selectedMachine.noOfPackages || "N/A"}</p>
                    </div>
                    {selectedMachine.package1 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Package 1 Dimensions</label>
                        <p className="font-medium">{selectedMachine.package1} mm³</p>
                      </div>
                    )}
                    {selectedMachine.productWeight && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Product Weight</label>
                        <p className="font-medium">{selectedMachine.productWeight} kg</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financial Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Currency</label>
                      <p className="font-medium">{selectedMachine.currency}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Domestic Price Range</label>
                      <p className="font-medium">
                        {selectedMachine.domesticPriceMin && selectedMachine.domesticPriceMax
                          ? `${selectedMachine.domesticPriceMin} - ${selectedMachine.domesticPriceMax}`
                          : "Not Available"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Export Price Range</label>
                      <p className="font-medium">
                        {selectedMachine.exportPriceMin && selectedMachine.exportPriceMax
                          ? `${selectedMachine.exportPriceMin} - ${selectedMachine.exportPriceMax}`
                          : "Not Available"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="service" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Service & Add-ons
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Default Add-ons</label>
                      <p className="text-sm mt-1">{selectedMachine.defaultAddOns || "None specified"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Extra Add-ons</label>
                      <p className="text-sm mt-1">{selectedMachine.extraAddOns || "None specified"}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documentation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentation & Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Domestic Catalogue</label>
                        {selectedMachine.catalogueDomestic ? (
                          <a
                            href={selectedMachine.catalogueDomestic}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm block"
                          >
                            View Catalogue
                          </a>
                        ) : (
                          <p className="text-sm">Not Available</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Export Catalogue</label>
                        {selectedMachine.catalogueExport ? (
                          <a
                            href={selectedMachine.catalogueExport}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm block"
                          >
                            View Catalogue
                          </a>
                        ) : (
                          <p className="text-sm">Not Available</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">YouTube Video</label>
                        {selectedMachine.youtubeLink ? (
                          <a
                            href={selectedMachine.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm block"
                          >
                            Watch Video
                          </a>
                        ) : (
                          <p className="text-sm">Not Available</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
