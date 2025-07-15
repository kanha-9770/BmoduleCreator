"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Search,
  Filter,
  Download,
  User,
  Shield,
  Database,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedModule, setSelectedModule] = useState("all")
  const [selectedAction, setSelectedAction] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  const auditLogs = [
    {
      id: 1,
      timestamp: "2024-01-15 10:30:25",
      user: "John Smith",
      userId: "admin001",
      action: "User Created",
      module: "User Management",
      details: "Created new user account for Sarah Johnson",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
      severity: "medium",
    },
    {
      id: 2,
      timestamp: "2024-01-15 10:25:12",
      user: "Sarah Johnson",
      userId: "mgr002",
      action: "Permission Modified",
      module: "Role Management",
      details: "Updated role permissions for Employee role",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      status: "success",
      severity: "high",
    },
    {
      id: 3,
      timestamp: "2024-01-15 10:20:45",
      user: "Mike Davis",
      userId: "emp003",
      action: "Login Failed",
      module: "Authentication",
      details: "Failed login attempt - incorrect password",
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "failed",
      severity: "high",
    },
    {
      id: 4,
      timestamp: "2024-01-15 10:15:30",
      user: "System",
      userId: "system",
      action: "Backup Completed",
      module: "System",
      details: "Automated database backup completed successfully",
      ipAddress: "127.0.0.1",
      userAgent: "System Process",
      status: "success",
      severity: "low",
    },
    {
      id: 5,
      timestamp: "2024-01-15 10:10:18",
      user: "Emily Wilson",
      userId: "hr004",
      action: "Data Export",
      module: "HR",
      details: "Exported employee payroll data for December 2023",
      ipAddress: "192.168.1.103",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
      severity: "medium",
    },
    {
      id: 6,
      timestamp: "2024-01-15 10:05:55",
      user: "David Brown",
      userId: "sup005",
      action: "Settings Changed",
      module: "System Settings",
      details: "Modified system notification settings",
      ipAddress: "192.168.1.104",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      status: "success",
      severity: "medium",
    },
  ]

  const modules = [
    "User Management",
    "Role Management",
    "Authentication",
    "System",
    "HR",
    "System Settings",
    "Sales",
    "Production",
  ]
  const actions = [
    "User Created",
    "Permission Modified",
    "Login Failed",
    "Backup Completed",
    "Data Export",
    "Settings Changed",
    "Login Success",
    "Data Modified",
  ]

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesModule = selectedModule === "all" || log.module === selectedModule
    const matchesAction = selectedAction === "all" || log.action === selectedAction
    return matchesSearch && matchesModule && matchesAction
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case "warning":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes("Login")) return <User className="h-4 w-4" />
    if (action.includes("Permission") || action.includes("Role")) return <Shield className="h-4 w-4" />
    if (action.includes("Backup") || action.includes("System")) return <Database className="h-4 w-4" />
    if (action.includes("Settings")) return <Settings className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const auditStats = {
    totalLogs: auditLogs.length,
    successfulActions: auditLogs.filter((log) => log.status === "success").length,
    failedActions: auditLogs.filter((log) => log.status === "failed").length,
    highSeverity: auditLogs.filter((log) => log.severity === "high").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Monitor system activities and security events</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
          </Button>
        </div>
      </div>

      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Actions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{auditStats.successfulActions}</div>
            <p className="text-xs text-muted-foreground">
              {((auditStats.successfulActions / auditStats.totalLogs) * 100).toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{auditStats.failedActions}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{auditStats.highSeverity}</div>
            <p className="text-xs text-muted-foreground">Critical events</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="system">System Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Audit Trail</CardTitle>
                  <CardDescription>Complete log of all system activities and user actions</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      {modules.map((module) => (
                        <SelectItem key={module} value={module}>
                          {module}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {actions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          {log.timestamp}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.user}</div>
                          <div className="text-sm text-gray-500">{log.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getActionIcon(log.action)}
                          <span className="ml-2">{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.module}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={log.details}>
                          {log.details}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Authentication failures, permission changes, and security alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs
                  .filter(
                    (log) =>
                      log.action.includes("Login") || log.action.includes("Permission") || log.severity === "high",
                  )
                  .map((log) => (
                    <div key={log.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {log.status === "failed" ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Shield className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{log.action}</h4>
                          <div className="flex items-center space-x-2">
                            {getSeverityBadge(log.severity)}
                            {getStatusBadge(log.status)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{log.details}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>User: {log.user}</span>
                          <span>IP: {log.ipAddress}</span>
                          <span>Time: {log.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Events</CardTitle>
              <CardDescription>System operations, backups, and maintenance activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs
                  .filter((log) => log.user === "System" || log.module === "System" || log.action.includes("Backup"))
                  .map((log) => (
                    <div key={log.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Database className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{log.action}</h4>
                          <div className="flex items-center space-x-2">
                            {getSeverityBadge(log.severity)}
                            {getStatusBadge(log.status)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{log.details}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>Module: {log.module}</span>
                          <span>Time: {log.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity by Module</CardTitle>
                <CardDescription>Distribution of activities across system modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modules.slice(0, 6).map((module) => {
                    const moduleCount = auditLogs.filter((log) => log.module === module).length
                    const percentage = (moduleCount / auditLogs.length) * 100
                    return (
                      <div key={module} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{module}</span>
                          <span>{moduleCount} events</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Recent activity patterns and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-sm text-green-600">
                      {((auditStats.successfulActions / auditStats.totalLogs) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Failed Actions</span>
                    <span className="text-sm text-red-600">{auditStats.failedActions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">High Severity Events</span>
                    <span className="text-sm text-orange-600">{auditStats.highSeverity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Unique Users</span>
                    <span className="text-sm">{new Set(auditLogs.map((log) => log.user)).size}</span>
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
