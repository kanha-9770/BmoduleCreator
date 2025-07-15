"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const quotations = [
  {
    id: "QT-2024-001",
    customer: "Acme Corporation",
    date: "2024-01-15",
    validUntil: "2024-02-15",
    amount: 125000,
    status: "Pending",
    items: 5,
  },
  {
    id: "QT-2024-002",
    customer: "Tech Solutions Ltd",
    date: "2024-01-14",
    validUntil: "2024-02-14",
    amount: 87500,
    status: "Approved",
    items: 3,
  },
  {
    id: "QT-2024-003",
    customer: "Global Industries",
    date: "2024-01-13",
    validUntil: "2024-02-13",
    amount: 245000,
    status: "Rejected",
    items: 8,
  },
  {
    id: "QT-2024-004",
    customer: "Manufacturing Co",
    date: "2024-01-12",
    validUntil: "2024-02-12",
    amount: 156000,
    status: "Draft",
    items: 6,
  },
  {
    id: "QT-2024-005",
    customer: "Construction Corp",
    date: "2024-01-11",
    validUntil: "2024-02-11",
    amount: 198000,
    status: "Sent",
    items: 4,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-800"
    case "Rejected":
      return "bg-red-100 text-red-800"
    case "Pending":
      return "bg-yellow-100 text-yellow-800"
    case "Sent":
      return "bg-blue-100 text-blue-800"
    case "Draft":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function QuotationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewQuotationDialogOpen, setIsNewQuotationDialogOpen] = useState(false)

  const filteredQuotations = quotations.filter(
    (quotation) =>
      quotation.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quotations</h1>
        <Dialog open={isNewQuotationDialogOpen} onOpenChange={setIsNewQuotationDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Quotation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quotation</DialogTitle>
            </DialogHeader>
            {/* <NewQuotationForm onClose={() => setIsNewQuotationDialogOpen(false)} /> */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
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
                placeholder="Search quotations..."
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
                <TableHead>Quotation ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">{quotation.id}</TableCell>
                  <TableCell>{quotation.customer}</TableCell>
                  <TableCell>{quotation.date}</TableCell>
                  <TableCell>{quotation.validUntil}</TableCell>
                  <TableCell>{quotation.items}</TableCell>
                  <TableCell>${quotation.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quotation.status)}>{quotation.status}</Badge>
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
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Download className="h-4 w-4" />
                          Download PDF
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
    </div>
  )
}
