"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, Check, X, Eye, CalendarDays, Clock, Users } from "lucide-react"

const leaveRequests = [
  {
    id: "LR001",
    employeeName: "John Smith",
    employeeId: "EMP001",
    department: "IT",
    leaveType: "Annual Leave",
    startDate: "2024-01-15",
    endDate: "2024-01-19",
    days: 5,
    reason: "Family vacation",
    status: "Pending",
    appliedDate: "2024-01-05",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "LR002",
    employeeName: "Sarah Wilson",
    employeeId: "EMP002",
    department: "Sales",
    leaveType: "Sick Leave",
    startDate: "2024-01-12",
    endDate: "2024-01-14",
    days: 3,
    reason: "Medical treatment",
    status: "Approved",
    appliedDate: "2024-01-10",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "LR003",
    employeeName: "Mike Johnson",
    employeeId: "EMP003",
    department: "Production",
    leaveType: "Personal Leave",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    days: 3,
    reason: "Personal matters",
    status: "Rejected",
    appliedDate: "2024-01-08",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "LR004",
    employeeName: "Emily Davis",
    employeeId: "EMP004",
    department: "Finance",
    leaveType: "Maternity Leave",
    startDate: "2024-02-01",
    endDate: "2024-05-01",
    days: 90,
    reason: "Maternity leave",
    status: "Approved",
    appliedDate: "2024-01-01",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "LR005",
    employeeName: "Robert Brown",
    employeeId: "EMP005",
    department: "HR",
    leaveType: "Annual Leave",
    startDate: "2024-01-25",
    endDate: "2024-01-26",
    days: 2,
    reason: "Weekend extension",
    status: "Pending",
    appliedDate: "2024-01-12",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function LeavePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedLeaveType, setSelectedLeaveType] = useState("all")

  const filteredLeaves = leaveRequests.filter((leave) => {
    const matchesSearch =
      leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || leave.status === selectedStatus
    const matchesLeaveType = selectedLeaveType === "all" || leave.leaveType === selectedLeaveType

    return matchesSearch && matchesStatus && matchesLeaveType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">Leave Report</Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee">Employee</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMP001">John Smith (EMP001)</SelectItem>
                        <SelectItem value="EMP002">Sarah Wilson (EMP002)</SelectItem>
                        <SelectItem value="EMP003">Mike Johnson (EMP003)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="personal">Personal Leave</SelectItem>
                        <SelectItem value="maternity">Maternity Leave</SelectItem>
                        <SelectItem value="emergency">Emergency Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea id="reason" placeholder="Enter reason for leave" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Submit Application</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">23</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">198</div>
            <p className="text-xs text-muted-foreground">80.2% approval rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">3.6% of workforce</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Balance Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leave Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Annual Leave</span>
                <span className="text-sm text-muted-foreground">45% (112 requests)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sick Leave</span>
                <span className="text-sm text-muted-foreground">28% (69 requests)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Personal Leave</span>
                <span className="text-sm text-muted-foreground">18% (44 requests)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Emergency Leave</span>
                <span className="text-sm text-muted-foreground">6% (15 requests)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Maternity Leave</span>
                <span className="text-sm text-muted-foreground">3% (7 requests)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Leave Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">January 2024</span>
                <span className="text-sm text-muted-foreground">247 requests</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">December 2023</span>
                <span className="text-sm text-muted-foreground">189 requests</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">November 2023</span>
                <span className="text-sm text-muted-foreground">156 requests</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">October 2023</span>
                <span className="text-sm text-muted-foreground">203 requests</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leave requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Leave Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leave Types</SelectItem>
                <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={leave.avatar || "/placeholder.svg"} alt={leave.employeeName} />
                          <AvatarFallback>
                            {leave.employeeName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{leave.employeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {leave.employeeId} • {leave.department}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{leave.startDate}</div>
                        <div className="text-muted-foreground">to {leave.endDate}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{leave.days} days</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                    <TableCell>{leave.appliedDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                          {leave.status === "Pending" && (
                            <>
                              <DropdownMenuItem className="text-green-600">
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
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
