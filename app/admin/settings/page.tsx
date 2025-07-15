"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Save, RefreshCw } from "lucide-react"

export default function SystemSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Basic company details and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="Your Company Ltd." />
                </div>
                <div>
                  <Label htmlFor="companyAddress">Address</Label>
                  <Textarea id="companyAddress" defaultValue="123 Business Street, City, State 12345" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue="+1 234 567 8900" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="info@company.com" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue="https://www.company.com" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Core system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                      <SelectItem value="gmt">GMT (Greenwich Mean Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD - US Dollar</SelectItem>
                      <SelectItem value="eur">EUR - Euro</SelectItem>
                      <SelectItem value="gbp">GBP - British Pound</SelectItem>
                      <SelectItem value="inr">INR - Indian Rupee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select defaultValue="mm-dd-yyyy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Temporarily disable system access</p>
                  </div>
                  <Switch id="maintenanceMode" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Password Policy</CardTitle>
                <CardDescription>Configure password requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="minLength">Minimum Password Length</Label>
                  <Input id="minLength" type="number" defaultValue="8" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                    <Switch id="requireUppercase" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                    <Switch id="requireNumbers" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireSpecial">Require Special Characters</Label>
                    <Switch id="requireSpecial" defaultChecked />
                  </div>
                </div>
                <div>
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input id="passwordExpiry" type="number" defaultValue="90" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
                <CardDescription>Control user session behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input id="sessionTimeout" type="number" defaultValue="30" />
                </div>
                <div>
                  <Label htmlFor="maxSessions">Max Concurrent Sessions</Label>
                  <Input id="maxSessions" type="number" defaultValue="3" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="forceLogout">Force Logout on Password Change</Label>
                    <p className="text-sm text-gray-500">Log out all sessions when password is changed</p>
                  </div>
                  <Switch id="forceLogout" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Require 2FA for all users</p>
                  </div>
                  <Switch id="twoFactor" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure email notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input id="smtpServer" defaultValue="smtp.company.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpPort">Port</Label>
                    <Input id="smtpPort" type="number" defaultValue="587" />
                  </div>
                  <div>
                    <Label htmlFor="smtpSecurity">Security</Label>
                    <Select defaultValue="tls">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpUsername">Username</Label>
                    <Input id="smtpUsername" defaultValue="noreply@company.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">Password</Label>
                    <Input id="smtpPassword" type="password" defaultValue="••••••••" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableEmail">Enable Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send system notifications via email</p>
                  </div>
                  <Switch id="enableEmail" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Configure when to send notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="userLogin">User Login Notifications</Label>
                    <Switch id="userLogin" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="systemErrors">System Error Alerts</Label>
                    <Switch id="systemErrors" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="securityAlerts">Security Alerts</Label>
                    <Switch id="securityAlerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="backupStatus">Backup Status</Label>
                    <Switch id="backupStatus" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenanceAlerts">Maintenance Alerts</Label>
                    <Switch id="maintenanceAlerts" defaultChecked />
                  </div>
                </div>
                <Separator />
                <div>
                  <Label htmlFor="adminEmail">Admin Email Recipients</Label>
                  <Textarea
                    id="adminEmail"
                    placeholder="admin1@company.com, admin2@company.com"
                    defaultValue="admin@company.com, it@company.com"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Configuration</CardTitle>
                <CardDescription>Database connection and performance settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="dbHost">Database Host</Label>
                  <Input id="dbHost" defaultValue="localhost" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dbPort">Port</Label>
                    <Input id="dbPort" type="number" defaultValue="5432" />
                  </div>
                  <div>
                    <Label htmlFor="dbName">Database Name</Label>
                    <Input id="dbName" defaultValue="erp_system" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="maxConnections">Max Connections</Label>
                  <Input id="maxConnections" type="number" defaultValue="100" />
                </div>
                <div>
                  <Label htmlFor="connectionTimeout">Connection Timeout (seconds)</Label>
                  <Input id="connectionTimeout" type="number" defaultValue="30" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableSsl">Enable SSL Connection</Label>
                    <p className="text-sm text-gray-500">Use encrypted database connections</p>
                  </div>
                  <Switch id="enableSsl" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup & Maintenance</CardTitle>
                <CardDescription>Automated backup and maintenance settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="backupTime">Backup Time</Label>
                  <Input id="backupTime" type="time" defaultValue="02:00" />
                </div>
                <div>
                  <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
                  <Input id="retentionPeriod" type="number" defaultValue="30" />
                </div>
                <div>
                  <Label htmlFor="backupLocation">Backup Location</Label>
                  <Input id="backupLocation" defaultValue="/var/backups/erp" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoMaintenance">Auto Maintenance</Label>
                    <p className="text-sm text-gray-500">Automatic database optimization</p>
                  </div>
                  <Switch id="autoMaintenance" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>Customize the system appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defaultTheme">Default Theme</Label>
                  <Select defaultValue="light">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Select defaultValue="blue">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowUserThemes">Allow User Theme Selection</Label>
                    <p className="text-sm text-gray-500">Let users choose their own themes</p>
                  </div>
                  <Switch id="allowUserThemes" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compactMode">Compact Mode</Label>
                    <p className="text-sm text-gray-500">Reduce spacing for more content</p>
                  </div>
                  <Switch id="compactMode" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Customize system branding elements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="systemTitle">System Title</Label>
                  <Input id="systemTitle" defaultValue="ERP System" />
                </div>
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input id="logoUrl" placeholder="https://example.com/logo.png" />
                </div>
                <div>
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input id="faviconUrl" placeholder="https://example.com/favicon.ico" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showCompanyName">Show Company Name in Header</Label>
                    <p className="text-sm text-gray-500">Display company name alongside logo</p>
                  </div>
                  <Switch id="showCompanyName" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>External API integrations and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="apiRateLimit">API Rate Limit (requests/minute)</Label>
                  <Input id="apiRateLimit" type="number" defaultValue="1000" />
                </div>
                <div>
                  <Label htmlFor="apiTimeout">API Timeout (seconds)</Label>
                  <Input id="apiTimeout" type="number" defaultValue="30" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableApiLogging">Enable API Logging</Label>
                    <p className="text-sm text-gray-500">Log all API requests and responses</p>
                  </div>
                  <Switch id="enableApiLogging" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireApiAuth">Require API Authentication</Label>
                    <p className="text-sm text-gray-500">All API calls must be authenticated</p>
                  </div>
                  <Switch id="requireApiAuth" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Third-Party Services</CardTitle>
                <CardDescription>Configure external service integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paymentGateway">Payment Gateway</Label>
                  <Select defaultValue="stripe">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cloudStorage">Cloud Storage</Label>
                  <Select defaultValue="aws">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws">Amazon S3</SelectItem>
                      <SelectItem value="gcp">Google Cloud Storage</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                      <SelectItem value="local">Local Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableSso">Single Sign-On (SSO)</Label>
                    <p className="text-sm text-gray-500">Enable SAML/OAuth integration</p>
                  </div>
                  <Switch id="enableSso" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableWebhooks">Webhooks</Label>
                    <p className="text-sm text-gray-500">Send event notifications to external systems</p>
                  </div>
                  <Switch id="enableWebhooks" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
