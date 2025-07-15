"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Shield,
  Activity,
  AlertTriangle,
  Database,
  Server,
  Lock,
  Eye,
  Settings,
  UserCheck,
  Clock,
} from "lucide-react"

export default function AdminDashboard() {
  const systemStats = {
    totalUsers: 156,
    activeUsers: 142,
    totalRoles: 8,
    activeModules: 12,
    systemUptime: "99.8%",
    storageUsed: 68,
    securityAlerts: 3,
    pendingApprovals: 12,
  }

  const recentActivities = [
    {
      id: 1,
      user: "John Smith",
      action: "Created new user account",
      module: "User Management",
      timestamp: "2 minutes ago",
      type: "create",
    },
    {
      id: 2,
      user: "Sarah Johnson",
      action: "Modified role permissions",
      module: "Role Management",
      timestamp: "15 minutes ago",
      type: "update",
    },
    {
      id: 3,
      user: "Mike Davis",
      action: "Accessed sensitive data",
      module: "Security",
      timestamp: "1 hour ago",
      type: "access",
    },
    {
      id: 4,
      user: "System",
      action: "Automated backup completed",
      module: "System",
      timestamp: "2 hours ago",
      type: "system",
    },
  ]

  const moduleStatus = [
    { name: "Sales", status: "active", users: 45, permissions: 12 },
    { name: "Production", status: "active", users: 32, permissions: 8 },
    { name: "Purchase", status: "active", users: 28, permissions: 10 },
    { name: "Inventory", status: "active", users: 38, permissions: 15 },
    { name: "HR", status: "active", users: 25, permissions: 18 },
    { name: "Masters", status: "active", users: 52, permissions: 22 },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "create":
        return <UserCheck className="h-4 w-4 text-green-500" />
      case "update":
        return <Settings className="h-4 w-4 text-blue-500" />
      case "access":
        return <Eye className="h-4 w-4 text-orange-500" />
      case "system":
        return <Server className="h-4 w-4 text-gray-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Complete system control and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Backup System
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Security Scan
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                {((systemStats.activeUsers / systemStats.totalUsers) * 100).toFixed(1)}%
              </span>{" "}
              online rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.systemUptime}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{systemStats.securityAlerts}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="modules">Module Status</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>Current system resource utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Storage Usage</span>
                    <span>{systemStats.storageUsed}%</span>
                  </div>
                  <Progress value={systemStats.storageUsed} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Memory Usage</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>CPU Usage</span>
                    <span>32%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Configure Permissions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  System Backup
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Status & Control</CardTitle>
              <CardDescription>Monitor and control all ERP modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moduleStatus.map((module) => (
                  <div key={module.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">{module.name}</h4>
                        <p className="text-sm text-gray-500">{module.users} active users</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">{module.permissions} permissions</Badge>
                      <Badge variant="outline" className="text-green-600">
                        Active
                      </Badge>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>Latest administrative and user activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">
                        by {activity.user} in {activity.module}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-medium">245ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Queries/sec</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Sessions</span>
                    <span className="font-medium">142</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate</span>
                    <span className="font-medium text-green-600">0.02%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Overall system health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Health</span>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Performance</span>
                    <Badge className="bg-green-100 text-green-800">Good</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security Status</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup Status</span>
                    <Badge className="bg-green-100 text-green-800">Up to Date</Badge>
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
