"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Download, Upload, Filter, Eye, Edit, Trash2 } from "lucide-react"

// Sample machine data with all the columns you requested
const machineData = [
  {
    // Product Identification Details
    productCategory: "Paper Cup Machine",
    productName: "PCM NS-1900",
    nesscoModelNo: "NS-1900",
    variant: "90 SPEED",
    productId: "PCM-NS1900-001",
    modelPrefix: "PCM",
    productStatus: "Active",
    hsnCode: "84775900",

    // Internal Details
    machineSpeed: "90",
    stableSpeed: "85",
    uomSpeed: "cups/min",
    weight: "2500",
    power: "15",
    p1Dimension: "2500",
    p2Dimension: "1800",
    p3Dimension: "2200",
    machineImage: "ns1900.jpg",
    websiteDisplayStatus: "Active",
    remark: "High Speed Production",

    // Product Size Limits
    bottomDiaMin: "50",
    bottomDiaMax: "120",
    topDiaMin: "60",
    topDiaMax: "140",
    heightMin: "80",
    heightMax: "200",
    knurlingDepthMax: "2",
    otherSpecifications: "Auto Lubrication",
    overallSpecifications: "Fully Automatic",

    // Product Dimensional Data
    productWeight: "2500",
    noOfPackages: "3",
    package1: "3000x2000x2500",
    package2: "1500x1000x800",
    package3: "1200x800x600",
    package4: "",
    dispatchP1: "3000x2000x2500",
    dispatchP2: "1500x1000x800",
    dispatchP3: "1200x800x600",

    // Product Financial Data
    domesticPriceMin: "2200000",
    domesticPriceMax: "2800000",
    domesticPriceAvg: "2500000",
    domesticPricingRemarks: "Standard Configuration",
    exportPriceMin: "28000",
    exportPriceMax: "35000",
    exportPriceAvg: "31500",
    exportPricingRemarks: "FOB Price",
    currency: "USD",
    salesChannel: "Direct/Dealer",

    // Sales Data
    productCatalogueDomestic: "PCM_Domestic_2024.pdf",
    productCatalogueExport: "PCM_Export_2024.pdf",
    product1PageFlyer: "NS1900_Flyer.pdf",
    nesscoVideo: "NS1900_Demo.mp4",
    youtubeLink: "https://youtube.com/watch?v=ns1900",
    allProductVideo: "All_PCM_Video.mp4",
    defaultAddOns: "Auto Stacker, Counter",
    extraAddOns: "Servo Motor, Touch Screen",
    productFaqSheetLink: "NS1900_FAQ.pdf",

    // Service Data
    packagingItemList: "Packaging_List_NS1900.pdf",
    preRequisiteItemDetail: "Installation_Guide.pdf",
    operationsManual: "NS1900_Manual.pdf",
    electricalDiagram: "NS1900_Electrical.pdf",
    toolBoxItems: "Standard Tool Kit",
    freeSpares: "Belts, Filters, Gaskets",
    payableSpareDomestic: "Spare_List_Domestic.pdf",
    payableSparesExport: "Spare_List_Export.pdf",
    productTopViewLayoutFile: "NS1900_Layout.dwg",

    // Technical Details (Nessco)
    operatingVoltage: "415V",
    phaseRequirement: "3 Phase",
    productStartingLoad: "25",
    productRunningLoad: "15",
    stabilizerLoad: "30",
    airFlowRateRequired: "500",
    airFlowRateUom: "CFM",
    airPressureRequired: "6",
    airPressureUom: "Bar",
    workingDimensionBasic: "12x8x10",
    workingDimensionTopModel: "14x10x12",
    technicalRemarks: "Servo Drive System",

    // Technical Details (OEM)
    oemCode: "OEM-NS1900",
    oemModelNo: "OEM-1900-90",
    productRawDescription: "High Speed Paper Cup Making Machine",
    oemProductTopViewLayoutFile: "OEM_NS1900_Layout.dwg",
    oemOperatingVoltage: "415V",
    oemPhaseRequirement: "3 Phase",
    oemProductStartingLoad: "25",
    oemProductRunningLoad: "15",
    oemStabilizerLoad: "30",
    oemAirFlowRateRequired: "500",
    oemAirFlowRateUom: "CFM",
    oemAirPressureRequired: "6",
    oemAirPressureUom: "Bar",
    oemPreRequisiteItemDetail: "OEM_Installation.pdf",
    oemOperationManual: "OEM_Manual.pdf",
    oemElectricalDiagram: "OEM_Electrical.pdf",
    oemToolBoxItems: "OEM Tool Kit",
    oemSpares: "OEM Spare Parts List",
    internalTeamFaq: "Internal_FAQ.pdf",
    technicalAssemblyDrawings: "Assembly_Drawings_Folder",
    technicalInternalRemarks: "Internal Technical Notes",
    oemRemarks: "OEM Specific Requirements",

    // Software Input
    speed: "90 cups/min",
    powerDetails: "15kW Running Load",
    pressureRequirements: "6 Bar Air Pressure",
    packageDimension: "3000x2000x2500mm",
    routes: "Production -> QC -> Dispatch",
  },
  {
    // Second machine with similar structure
    productCategory: "Paper Cup Machine",
    productName: "PCM NS-200",
    nesscoModelNo: "NS-200",
    variant: "STANDARD",
    productId: "PCM-NS200-001",
    modelPrefix: "PCM",
    productStatus: "Active",
    hsnCode: "84775900",
    machineSpeed: "60",
    stableSpeed: "55",
    uomSpeed: "cups/min",
    weight: "1800",
    power: "10",
    p1Dimension: "2200",
    p2Dimension: "1600",
    p3Dimension: "2000",
    machineImage: "ns200.jpg",
    websiteDisplayStatus: "Active",
    remark: "Standard Production",
    bottomDiaMin: "40",
    bottomDiaMax: "100",
    topDiaMin: "50",
    topDiaMax: "120",
    heightMin: "60",
    heightMax: "180",
    knurlingDepthMax: "1.5",
    otherSpecifications: "Manual Lubrication",
    overallSpecifications: "Semi Automatic",
    productWeight: "1800",
    noOfPackages: "2",
    package1: "2500x1800x2200",
    package2: "1200x800x600",
    package3: "",
    package4: "",
    dispatchP1: "2500x1800x2200",
    dispatchP2: "1200x800x600",
    dispatchP3: "",
    domesticPriceMin: "1600000",
    domesticPriceMax: "2000000",
    domesticPriceAvg: "1800000",
    domesticPricingRemarks: "Basic Configuration",
    exportPriceMin: "20000",
    exportPriceMax: "25000",
    exportPriceAvg: "22500",
    exportPricingRemarks: "FOB Price",
    currency: "USD",
    salesChannel: "Direct/Dealer",
    productCatalogueDomestic: "PCM_Domestic_2024.pdf",
    productCatalogueExport: "PCM_Export_2024.pdf",
    product1PageFlyer: "NS200_Flyer.pdf",
    nesscoVideo: "NS200_Demo.mp4",
    youtubeLink: "https://youtube.com/watch?v=ns200",
    allProductVideo: "All_PCM_Video.mp4",
    defaultAddOns: "Counter",
    extraAddOns: "Auto Stacker",
    productFaqSheetLink: "NS200_FAQ.pdf",
    packagingItemList: "Packaging_List_NS200.pdf",
    preRequisiteItemDetail: "Installation_Guide.pdf",
    operationsManual: "NS200_Manual.pdf",
    electricalDiagram: "NS200_Electrical.pdf",
    toolBoxItems: "Basic Tool Kit",
    freeSpares: "Belts, Filters",
    payableSpareDomestic: "Spare_List_Domestic.pdf",
    payableSparesExport: "Spare_List_Export.pdf",
    productTopViewLayoutFile: "NS200_Layout.dwg",
    operatingVoltage: "415V",
    phaseRequirement: "3 Phase",
    productStartingLoad: "18",
    productRunningLoad: "10",
    stabilizerLoad: "20",
    airFlowRateRequired: "400",
    airFlowRateUom: "CFM",
    airPressureRequired: "5",
    airPressureUom: "Bar",
    workingDimensionBasic: "10x7x9",
    workingDimensionTopModel: "12x8x10",
    technicalRemarks: "Standard Drive System",
    oemCode: "OEM-NS200",
    oemModelNo: "OEM-200-60",
    productRawDescription: "Standard Paper Cup Making Machine",
    oemProductTopViewLayoutFile: "OEM_NS200_Layout.dwg",
    oemOperatingVoltage: "415V",
    oemPhaseRequirement: "3 Phase",
    oemProductStartingLoad: "18",
    oemProductRunningLoad: "10",
    oemStabilizerLoad: "20",
    oemAirFlowRateRequired: "400",
    oemAirFlowRateUom: "CFM",
    oemAirPressureRequired: "5",
    oemAirPressureUom: "Bar",
    oemPreRequisiteItemDetail: "OEM_Installation.pdf",
    oemOperationManual: "OEM_Manual.pdf",
    oemElectricalDiagram: "OEM_Electrical.pdf",
    oemToolBoxItems: "OEM Tool Kit",
    oemSpares: "OEM Spare Parts List",
    internalTeamFaq: "Internal_FAQ.pdf",
    technicalAssemblyDrawings: "Assembly_Drawings_Folder",
    technicalInternalRemarks: "Internal Technical Notes",
    oemRemarks: "OEM Specific Requirements",
    speed: "60 cups/min",
    powerDetails: "10kW Running Load",
    pressureRequirements: "5 Bar Air Pressure",
    packageDimension: "2500x1800x2200mm",
    routes: "Production -> QC -> Dispatch",
  },
]

// Define all column headers
const columnHeaders = [
  // Product Identification Details
  { key: "productCategory", label: "Product Category", width: 150 },
  { key: "productName", label: "Product Name", width: 150 },
  { key: "nesscoModelNo", label: "Nessco Model No.", width: 150 },
  { key: "variant", label: "Variant", width: 120 },
  { key: "productId", label: "Product ID", width: 150 },
  { key: "modelPrefix", label: "Model Prefix", width: 120 },
  { key: "productStatus", label: "Product Status", width: 120 },
  { key: "hsnCode", label: "HSN Code", width: 120 },

  // Internal Details
  { key: "machineSpeed", label: "Machine Speed", width: 120 },
  { key: "stableSpeed", label: "Stable Speed", width: 120 },
  { key: "uomSpeed", label: "UoM Speed", width: 120 },
  { key: "weight", label: "Weight (kg)", width: 120 },
  { key: "power", label: "Power (kW)", width: 120 },
  { key: "p1Dimension", label: "P1 Dimension (mm)", width: 150 },
  { key: "p2Dimension", label: "P2 Dimension (mm)", width: 150 },
  { key: "p3Dimension", label: "P3 Dimension (mm)", width: 150 },
  { key: "machineImage", label: "Machine Image", width: 150 },
  { key: "websiteDisplayStatus", label: "Website Display Status", width: 180 },
  { key: "remark", label: "Remark", width: 150 },

  // Product Size Limits
  { key: "bottomDiaMin", label: "Bottom Dia Min (mm)", width: 150 },
  { key: "bottomDiaMax", label: "Bottom Dia Max (mm)", width: 150 },
  { key: "topDiaMin", label: "Top Dia Min (mm)", width: 150 },
  { key: "topDiaMax", label: "Top Dia Max (mm)", width: 150 },
  { key: "heightMin", label: "Height Min (mm)", width: 150 },
  { key: "heightMax", label: "Height Max (mm)", width: 150 },
  { key: "knurlingDepthMax", label: "Knurling Depth Max (mm)", width: 180 },
  { key: "otherSpecifications", label: "Other Specifications", width: 180 },
  { key: "overallSpecifications", label: "Overall Specifications", width: 180 },

  // Product Dimensional Data
  { key: "productWeight", label: "Product Weight (kgs)", width: 150 },
  { key: "noOfPackages", label: "No of Packages", width: 150 },
  { key: "package1", label: "Package 1 (LxWxH)", width: 180 },
  { key: "package2", label: "Package 2 (LxWxH)", width: 180 },
  { key: "package3", label: "Package 3 (LxWxH)", width: 180 },
  { key: "package4", label: "Package 4 (LxWxH)", width: 180 },
  { key: "dispatchP1", label: "Dispatch P1 (LxWxH)", width: 180 },
  { key: "dispatchP2", label: "Dispatch P2 (LxWxH)", width: 180 },
  { key: "dispatchP3", label: "Dispatch P3 (LxWxH)", width: 180 },

  // Product Financial Data
  { key: "domesticPriceMin", label: "Domestic Price (min)", width: 150 },
  { key: "domesticPriceMax", label: "Domestic Price (max)", width: 150 },
  { key: "domesticPriceAvg", label: "Domestic Price (Avg)", width: 150 },
  { key: "domesticPricingRemarks", label: "Domestic Pricing Remarks", width: 200 },
  { key: "exportPriceMin", label: "Export Price (min)", width: 150 },
  { key: "exportPriceMax", label: "Export Price (max)", width: 150 },
  { key: "exportPriceAvg", label: "Export Price (avg)", width: 150 },
  { key: "exportPricingRemarks", label: "Export Pricing Remarks", width: 200 },
  { key: "currency", label: "Currency", width: 100 },
  { key: "salesChannel", label: "Sales Channel", width: 150 },

  // Sales Data
  { key: "productCatalogueDomestic", label: "Product Catalogue Domestic", width: 200 },
  { key: "productCatalogueExport", label: "Product Catalogue Export", width: 200 },
  { key: "product1PageFlyer", label: "Product 1 Page Flyer", width: 180 },
  { key: "nesscoVideo", label: "Nessco Video", width: 150 },
  { key: "youtubeLink", label: "YouTube Link", width: 200 },
  { key: "allProductVideo", label: "All Product Video", width: 180 },
  { key: "defaultAddOns", label: "Default Add Ons", width: 180 },
  { key: "extraAddOns", label: "Extra Add Ons", width: 150 },
  { key: "productFaqSheetLink", label: "Product FAQ Sheet Link", width: 200 },

  // Service Data
  { key: "packagingItemList", label: "Packaging Item List", width: 180 },
  { key: "preRequisiteItemDetail", label: "Pre Requisite Item Detail", width: 200 },
  { key: "operationsManual", label: "Operations Manual", width: 180 },
  { key: "electricalDiagram", label: "Electrical Diagram", width: 180 },
  { key: "toolBoxItems", label: "Tool Box Items", width: 150 },
  { key: "freeSpares", label: "Free Spares", width: 150 },
  { key: "payableSpareDomestic", label: "Payable Spare Domestic", width: 200 },
  { key: "payableSparesExport", label: "Payable Spares Export", width: 200 },
  { key: "productTopViewLayoutFile", label: "Product Top View Layout File", width: 220 },

  // Technical Details (Nessco)
  { key: "operatingVoltage", label: "Operating Voltage", width: 150 },
  { key: "phaseRequirement", label: "Phase Requirement", width: 150 },
  { key: "productStartingLoad", label: "Product Starting Load (kW)", width: 200 },
  { key: "productRunningLoad", label: "Product Running Load (kW)", width: 200 },
  { key: "stabilizerLoad", label: "Stabilizer Load (KVA)", width: 180 },
  { key: "airFlowRateRequired", label: "Air Flow Rate Required", width: 180 },
  { key: "airFlowRateUom", label: "Air Flow Rate (UoM)", width: 150 },
  { key: "airPressureRequired", label: "Air Pressure Required", width: 180 },
  { key: "airPressureUom", label: "Air Pressure (UoM)", width: 150 },
  { key: "workingDimensionBasic", label: "Working Dimension Basic (Feet)", width: 220 },
  { key: "workingDimensionTopModel", label: "Working Dimension Top Model (Feet)", width: 240 },
  { key: "technicalRemarks", label: "Technical Remarks", width: 180 },

  // Technical Details (OEM)
  { key: "oemCode", label: "OEM Code", width: 120 },
  { key: "oemModelNo", label: "OEM Model No", width: 150 },
  { key: "productRawDescription", label: "Product Raw Description", width: 200 },
  { key: "oemProductTopViewLayoutFile", label: "OEM Product Top View Layout File", width: 250 },
  { key: "oemOperatingVoltage", label: "OEM Operating Voltage", width: 180 },
  { key: "oemPhaseRequirement", label: "OEM Phase Requirement", width: 180 },
  { key: "oemProductStartingLoad", label: "OEM Product Starting Load (kW)", width: 220 },
  { key: "oemProductRunningLoad", label: "OEM Product Running Load (kW)", width: 220 },
  { key: "oemStabilizerLoad", label: "OEM Stabilizer Load (KVA)", width: 200 },
  { key: "oemAirFlowRateRequired", label: "OEM Air Flow Rate Required", width: 200 },
  { key: "oemAirFlowRateUom", label: "OEM Air Flow Rate (UoM)", width: 180 },
  { key: "oemAirPressureRequired", label: "OEM Air Pressure Required", width: 200 },
  { key: "oemAirPressureUom", label: "OEM Air Pressure (UoM)", width: 180 },
  { key: "oemPreRequisiteItemDetail", label: "OEM Pre Requisite Item Detail", width: 220 },
  { key: "oemOperationManual", label: "OEM Operation Manual", width: 180 },
  { key: "oemElectricalDiagram", label: "OEM Electrical Diagram", width: 180 },
  { key: "oemToolBoxItems", label: "OEM Tool Box Items", width: 180 },
  { key: "oemSpares", label: "OEM Spares", width: 150 },
  { key: "internalTeamFaq", label: "Internal Team FAQ", width: 180 },
  { key: "technicalAssemblyDrawings", label: "Technical Assembly Drawings", width: 220 },
  { key: "technicalInternalRemarks", label: "Technical Internal Remarks", width: 200 },
  { key: "oemRemarks", label: "OEM Remarks", width: 150 },

  // Software Input
  { key: "speed", label: "Speed", width: 120 },
  { key: "powerDetails", label: "Power Details", width: 150 },
  { key: "pressureRequirements", label: "Pressure Requirements", width: 180 },
  { key: "packageDimension", label: "Package Dimension", width: 180 },
  { key: "routes", label: "Routes", width: 200 },
]

export default function MachineMaster() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState(machineData)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = machineData.filter((machine) =>
      Object.values(machine).some((field) => field?.toString().toLowerCase().includes(value.toLowerCase())),
    )
    setFilteredData(filtered)
  }

  // Calculate total width for the table
  const totalWidth = columnHeaders.reduce((sum, header) => sum + header.width, 0) + 120 // +120 for actions column

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Machine Master</h1>
          <p className="text-muted-foreground">Complete machine specifications and details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Machine
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search machines..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Google Sheets-like Table */}
      <Card>
        <CardHeader>
          <CardTitle>Machine Details - Google Sheets View</CardTitle>
          <p className="text-sm text-muted-foreground">
            Scroll horizontally to view all {columnHeaders.length} columns of machine data. Total width: {totalWidth}px
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-hidden">
            {/* Horizontal scrollable container */}
            <div className="overflow-x-auto overflow-y-auto max-h-[600px]" style={{ width: "100%" }}>
              <div style={{ minWidth: `${totalWidth}px` }}>
                {/* Table Header */}
                <div className="flex bg-gray-50 border-b sticky top-0 z-10">
                  {columnHeaders.map((header, index) => (
                    <div
                      key={header.key}
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 flex-shrink-0"
                      style={{ width: `${header.width}px`, minWidth: `${header.width}px` }}
                    >
                      <div className="truncate" title={header.label}>
                        {header.label}
                      </div>
                    </div>
                  ))}
                  <div className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 flex-shrink-0">
                    Actions
                  </div>
                </div>

                {/* Table Body */}
                <div className="bg-white divide-y divide-gray-200">
                  {filteredData.map((machine, rowIndex) => (
                    <div key={rowIndex} className="flex hover:bg-gray-50">
                      {columnHeaders.map((header, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 flex-shrink-0"
                          style={{ width: `${header.width}px`, minWidth: `${header.width}px` }}
                        >
                          <div className="truncate" title={machine[header.key as keyof typeof machine]?.toString()}>
                            {header.key === "productStatus" ? (
                              <Badge variant={machine[header.key] === "Active" ? "default" : "secondary"}>
                                {machine[header.key]}
                              </Badge>
                            ) : header.key === "websiteDisplayStatus" ? (
                              <Badge variant={machine[header.key] === "Active" ? "default" : "secondary"}>
                                {machine[header.key]}
                              </Badge>
                            ) : header.key.includes("Price") && machine[header.key as keyof typeof machine] ? (
                              `₹${Number.parseInt(machine[header.key as keyof typeof machine]?.toString() || "0").toLocaleString()}`
                            ) : (
                              machine[header.key as keyof typeof machine] || "-"
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="px-3 py-4 text-sm font-medium w-32 flex-shrink-0">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <p className="text-xs text-muted-foreground">Total Machines</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{columnHeaders.length}</div>
            <p className="text-xs text-muted-foreground">Data Columns</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredData.filter((m) => m.productStatus === "Active").length}</div>
            <p className="text-xs text-muted-foreground">Active Machines</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalWidth.toLocaleString()}px</div>
            <p className="text-xs text-muted-foreground">Table Width</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
