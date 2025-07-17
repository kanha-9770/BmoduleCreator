"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Download,
  Calendar,
  Users,
  FileText,
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FormRecordsSheetProps {
  formId: string | null
  isOpen: boolean
  onClose: () => void
}

interface FormRecord {
  id: string
  submittedAt: string
  status: string
  recordData: Record<string, any>
}

interface Form {
  id: string
  name: string
  description?: string
}

interface StatsData {
  totalRecords: number
  todayRecords: number
  weekRecords: number
  monthRecords: number
}

export function FormRecordsSheet({ formId, isOpen, onClose }: FormRecordsSheetProps) {
  const { toast } = useToast()
  const [form, setForm] = useState<Form | null>(null)
  const [records, setRecords] = useState<FormRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState<StatsData>({
    totalRecords: 0,
    todayRecords: 0,
    weekRecords: 0,
    monthRecords: 0,
  })

  useEffect(() => {
    if (formId && isOpen) {
      fetchFormAndRecords()
    }
  }, [formId, isOpen])

  useEffect(() => {
    if (!isOpen) {
      setForm(null)
      setRecords([])
      setError(null)
      setSearchTerm("")
    }
  }, [isOpen])

  const fetchFormAndRecords = async () => {
    if (!formId) return

    setLoading(true)
    setError(null)

    try {
      // Fetch form details
      const formResponse = await fetch(`/api/forms/${formId}`)
      const formResult = await formResponse.json()

      if (!formResult.success) {
        throw new Error(formResult.error)
      }

      setForm(formResult.data)

      // Fetch records
      const recordsResponse = await fetch(`/api/forms/${formId}/records`)
      const recordsResult = await recordsResponse.json()

      if (!recordsResult.success) {
        throw new Error(recordsResult.error)
      }

      setRecords(recordsResult.records || [])

      // Calculate stats
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      const allRecords = recordsResult.records || []
      setStats({
        totalRecords: recordsResult.total || 0,
        todayRecords: allRecords.filter((r: FormRecord) => new Date(r.submittedAt) >= today).length,
        weekRecords: allRecords.filter((r: FormRecord) => new Date(r.submittedAt) >= weekAgo).length,
        monthRecords: allRecords.filter((r: FormRecord) => new Date(r.submittedAt) >= monthAgo).length,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-green-100 text-green-800 border-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return CheckCircle
      case "draft":
        return AlertCircle
      case "processing":
        return Clock
      default:
        return XCircle
    }
  }

  const handleExport = async (format: "csv" | "json") => {
    try {
      const response = await fetch(`/api/forms/${formId}/export?format=${format}`)
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${form?.name || "form"}-records.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      toast({
        title: "Export Error",
        description: "Failed to export records",
        variant: "destructive",
      })
    }
  }

  const filteredRecords = records.filter((record) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      record.id.toLowerCase().includes(searchLower) ||
      record.status.toLowerCase().includes(searchLower) ||
      JSON.stringify(record.recordData).toLowerCase().includes(searchLower)
    )
  })

  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) return ""
    if (typeof value === "object") {
      return JSON.stringify(value).substring(0, 50) + "..."
    }
    return String(value)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[800px] sm:w-[900px] overflow-y-auto">
        {loading ? (
          <div className="py-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : !form ? (
          <div className="py-8">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Form not found</AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {form.name} - Records
              </SheetTitle>
              {form.description && <p className="text-muted-foreground">{form.description}</p>}
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRecords}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.todayRecords}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Week</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.weekRecords}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Month</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.monthRecords}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={() => handleExport("csv")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {/* Records Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Records ({filteredRecords.length})</CardTitle>
                  <CardDescription>All submitted form records</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredRecords.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Record ID</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data Summary</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRecords.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-mono text-sm">{record.id.slice(-8)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {new Date(record.submittedAt).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn("border", getStatusColor(record.status || "submitted"))}
                                >
                                  {React.createElement(getStatusIcon(record.status || "submitted"), {
                                    className: "h-3 w-3 mr-1",
                                  })}
                                  {record.status || "submitted"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 max-w-md">
                                  {Object.entries(record.recordData || {})
                                    .slice(0, 3)
                                    .map(([key, value]) => (
                                      <div key={key} className="text-sm">
                                        <span className="font-medium text-gray-600">{key}:</span>{" "}
                                        <span className="text-gray-900">{formatFieldValue(value)}</span>
                                      </div>
                                    ))}
                                  {Object.keys(record.recordData || {}).length > 3 && (
                                    <div className="text-xs text-gray-500">
                                      +{Object.keys(record.recordData || {}).length - 3} more fields
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No records found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm ? "Try adjusting your search criteria." : "No records have been submitted yet."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
