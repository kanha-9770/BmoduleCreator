"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileSpreadsheet, Download, FileText, Link, Edit } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BomPage() {
  const [open, setOpen] = useState(false)

  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleBulkUpload = async () => {
    if (!uploadFile) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setBulkUploadOpen(false)
          // Show success message
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bill of Materials</h1>
        <div className="space-x-2">
          <Button className="gap-2" onClick={() => setBulkUploadOpen(true)}>
            <Upload className="h-4 w-4" />
            Bulk Upload BOM
          </Button>
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Create New BOM
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>BOM Code</TableHead>
            <TableHead>Product Code</TableHead>
            <TableHead>Machine Code</TableHead>
            <TableHead>Component Code</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>UOM</TableHead>
            <TableHead>Scrap Percentage</TableHead>
            <TableHead>Lead Time</TableHead>
            <TableHead>Cost Per Unit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>BOM-001</TableCell>
            <TableCell>PROD-001</TableCell>
            <TableCell>MACH-001</TableCell>
            <TableCell>COMP-001</TableCell>
            <TableCell>10</TableCell>
            <TableCell>EA</TableCell>
            <TableCell>5%</TableCell>
            <TableCell>2 days</TableCell>
            <TableCell>$10.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>BOM-002</TableCell>
            <TableCell>PROD-002</TableCell>
            <TableCell>MACH-002</TableCell>
            <TableCell>COMP-002</TableCell>
            <TableCell>5</TableCell>
            <TableCell>EA</TableCell>
            <TableCell>2%</TableCell>
            <TableCell>1 day</TableCell>
            <TableCell>$5.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Bill of Materials</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="bom_code" className="text-right">
                BOM Code
              </label>
              <Input id="bom_code" value="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="product_code" className="text-right">
                Product Code
              </label>
              <Input id="product_code" value="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="machine_code" className="text-right">
                Machine Code
              </label>
              <Input id="machine_code" value="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="component_code" className="text-right">
                Component Code
              </label>
              <Input id="component_code" value="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="quantity" className="text-right">
                Quantity
              </label>
              <Input id="quantity" value="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="uom" className="text-right">
                UOM
              </label>
              <Input id="uom" value="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="scrap_percentage" className="text-right">
                Scrap Percentage
              </label>
              <Input id="scrap_percentage" value="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="lead_time" className="text-right">
                Lead Time
              </label>
              <Input id="lead_time" value="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="cost_per_unit" className="text-right">
                Cost Per Unit
              </label>
              <Input id="cost_per_unit" value="" className="col-span-3" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bulk Upload Bill of Materials
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="template">Download Template</TabsTrigger>
              <TabsTrigger value="machine-link">Machine Linking</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upload BOM Data</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload Excel/CSV file with BOM data. Make sure to use the provided template format.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="bom-upload"
                    />
                    <label htmlFor="bom-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400" />
                        <div>
                          <p className="text-lg font-medium">Click to upload BOM file</p>
                          <p className="text-sm text-muted-foreground">Supports Excel (.xlsx, .xls) and CSV files</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {uploadFile && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{uploadFile.name}</span>
                        <Badge variant="secondary">{(uploadFile.size / 1024).toFixed(1)} KB</Badge>
                      </div>
                    </div>
                  )}

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={() => handleBulkUpload()} disabled={!uploadFile || isUploading} className="flex-1">
                      {isUploading ? "Processing..." : "Upload & Process"}
                    </Button>
                    <Button variant="outline" onClick={() => setUploadFile(null)}>
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="template" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Download BOM Template</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Download the standard template to ensure proper data format for bulk upload.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Excel Template</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Complete template with formulas and validation
                      </p>
                      <Button variant="outline" className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Download Excel Template
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">CSV Template</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Simple CSV format for basic data import</p>
                      <Button variant="outline" className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Download CSV Template
                      </Button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Template Columns:</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="grid grid-cols-3 gap-4">
                        <span className="font-medium">BOM_Code</span>
                        <span className="font-medium">Product_Code</span>
                        <span className="font-medium">Machine_Code</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="font-medium">Component_Code</span>
                        <span className="font-medium">Quantity</span>
                        <span className="font-medium">UOM</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="font-medium">Scrap_Percentage</span>
                        <span className="font-medium">Lead_Time</span>
                        <span className="font-medium">Cost_Per_Unit</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="machine-link" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Machine-BOM Linking</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Link BOMs with specific machines from Machine Master for production planning.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Select Machine</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose machine..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NS-1900">PCM NS-1900 (90 SPEED)</SelectItem>
                          <SelectItem value="NS-B2200">PCM 22 OZ (CHAIN)</SelectItem>
                          <SelectItem value="NS-200">PCM NS-200 (STANDARD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Select BOM</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose BOM..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BOM-001">Steel Bracket Assembly</SelectItem>
                          <SelectItem value="BOM-002">Motor Housing Unit</SelectItem>
                          <SelectItem value="BOM-003">Control Panel Kit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Machine-BOM Relationships</label>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Machine Code</TableHead>
                            <TableHead>Machine Name</TableHead>
                            <TableHead>Linked BOMs</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>NS-1900</TableCell>
                            <TableCell>PCM NS-1900 (90 SPEED)</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Badge variant="secondary">BOM-001</Badge>
                                <Badge variant="secondary">BOM-003</Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>NS-200</TableCell>
                            <TableCell>PCM NS-200 (STANDARD)</TableCell>
                            <TableCell>
                              <Badge variant="secondary">BOM-002</Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <Button className="w-full gap-2">
                    <Link className="h-4 w-4" />
                    Create Machine-BOM Link
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
