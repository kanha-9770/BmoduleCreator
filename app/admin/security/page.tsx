"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, AlertTriangle, CheckCircle, XCircle, Lock, Wifi, Activity, Users } from "lucide-react"

export default function SecurityCenter() {
  const securityAlerts = [
    {
      id: 1,
      type: "warning",
      title: "Multiple Failed Login Attempts",
      description: "User 'mike.davis' has 5 failed login attempts in the last 10 minutes",
      timestamp: "2 minutes ago",
      severity: "high",
    },
    {
      id: 2,
      type: "info",
      title: "Password Policy Updated",
      description: "System password policy has been updated to require 12 character minimum",
      timestamp: "1 hour ago",
      severity: "medium",
    },
    {
      id: 3,
      type: "error",
      title: "Suspicious IP Activity",
      description: "Unusual activity detected from IP address 203.0.113.45",
      timestamp: "3 hours ago",
      severity: "high",
    },
  ]

  const securityMetrics = {
    overallScore: 85,
    activeThreats: 2,
    blockedAttempts: 47,
    secureConnections: 98.5,
    lastScan: "2024-01-15 09:30 AM",
  }

  const systemSecurity = [
    { name: "Firewall", status: "active", description: "Network firewall protection" },
    { name: "SSL/TLS", status: "active", description: "Encrypted connections" },
    { name: "Two-Factor Auth", status: "inactive", description: "Additional login security" },
    { name: "IP Whitelist", status: "active", description: "Restricted IP access" },
    { name: "Session Timeout", status: "active", description: "Automatic logout" },
    { name: "Password Policy", status: "active", description: "Strong password requirements" },
  ]

  const activeConnections = [
    {
      id: 1,
      user: "John Smith",
      ipAddress: "192.168.1.100",
      location: "New York, US",
      device: "Windows Desktop",
      loginTime: "09:30 AM",
      status: "active",
    },
    {
      id: 2,
      user: "Sarah Johnson",
      ipAddress: "192.168.1.101",
      location: "California, US",
      device: "MacBook Pro",
      loginTime: "08:45 AM",
      status: "active",
    },
    {
      id: 3,
      user: "Mike Davis",
      ipAddress: "203.0.113.45",
      location: "Unknown",
      device: "Mobile Device",
      loginTime: "10:15 AM",
      status: "suspicious",
    },
  ]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    return status === "active" ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getConnectionStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "suspicious":
        return <Badge className="bg-red-100 text-red-800">Suspicious</Badge>
      case "blocked":
        return <Badge className="bg-gray-100 text-gray-800">Blocked</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Center</h1>
          <p className="text-gray-600">Monitor and manage system security</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Run Security Scan
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Security Report
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.overallScore}%</div>
            <Progress value={securityMetrics.overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityMetrics.activeThreats}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.blockedAttempts}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secure Connections</CardTitle>
            <Wifi className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{securityMetrics.secureConnections}%</div>
            <p className="text-xs text-muted-foreground">SSL/TLS encrypted</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
          <CardDescription>Recent security events requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityAlerts.map((alert) => (
              <Alert
                key={alert.id}
                className={
                  alert.type === "error"
                    ? "border-red-200"
                    : alert.type === "warning"
                      ? "border-yellow-200"
                      : "border-blue-200"
                }
              >
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <AlertTitle className="flex items-center justify-between">
                      {alert.title}
                      <div className="flex items-center space-x-2">
                        <Badge variant={alert.severity === "high" ? "destructive" : "secondary"}>
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-gray-500">{alert.timestamp}</span>
                      </div>
                    </AlertTitle>
                    <AlertDescription>{alert.description}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Security Status</TabsTrigger>
          <TabsTrigger value="connections">Active Connections</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Security Status</CardTitle>
              <CardDescription>Current status of all security components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemSecurity.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <Switch checked={item.status === "active"} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active User Connections</CardTitle>
              <CardDescription>Monitor current user sessions and connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeConnections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium">{connection.user}</h4>
                        <div className="text-sm text-gray-500">
                          <p>
                            IP: {connection.ipAddress} • {connection.location}
                          </p>
                          <p>
                            Device: {connection.device} • Login: {connection.loginTime}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getConnectionStatusBadge(connection.status)}
                      {connection.status === "suspicious" && (
                        <Button variant="outline" size="sm" className="text-red-600">
                          Block
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>Configure access control policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ipWhitelist">IP Address Whitelist</Label>
                    <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                  </div>
                  <Switch id="ipWhitelist" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="geoBlocking">Geographic Blocking</Label>
                    <p className="text-sm text-gray-500">Block access from specific countries</p>
                  </div>
                  <Switch id="geoBlocking" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deviceTracking">Device Tracking</Label>
                    <p className="text-sm text-gray-500">Track and manage user devices</p>
                  </div>
                  <Switch id="deviceTracking" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sessionLimits">Session Limits</Label>
                    <p className="text-sm text-gray-500">Limit concurrent user sessions</p>
                  </div>
                  <Switch id="sessionLimits" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Monitoring</CardTitle>
                <CardDescription>Configure security monitoring and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="loginMonitoring">Login Monitoring</Label>
                    <p className="text-sm text-gray-500">Monitor failed login attempts</p>
                  </div>
                  <Switch id="loginMonitoring" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dataAccess">Data Access Monitoring</Label>
                    <p className="text-sm text-gray-500">Track sensitive data access</p>
                  </div>
                  <Switch id="dataAccess" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="privilegeEscalation">Privilege Escalation Alerts</Label>
                    <p className="text-sm text-gray-500">Alert on permission changes</p>
                  </div>
                  <Switch id="privilegeEscalation" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="anomalyDetection">Anomaly Detection</Label>
                    <p className="text-sm text-gray-500">Detect unusual user behavior</p>
                  </div>
                  <Switch id="anomalyDetection" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>Live security monitoring dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Monitoring</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last Security Scan</span>
                    <span className="text-sm text-gray-600">{securityMetrics.lastScan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Threat Detection</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Intrusion Prevention</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
                <CardDescription>Key security performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>System Hardening</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Vulnerability Coverage</span>
                      <span>88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Compliance Score</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Incident Response</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
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
