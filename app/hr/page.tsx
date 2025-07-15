import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  UserCheck,
  CalendarDays,
  Building2,
} from "lucide-react"
import Link from "next/link"

export default function HRDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">HR Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline">Generate Report</Button>
          <Button>Add Employee</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12 new hires
              </span>
              this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +2.1%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                -5 from yesterday
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$847K</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +3.2%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* HR Modules */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/hr/employees">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employee Management</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <p className="text-xs text-muted-foreground">Active Employees</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Full-time: 1,089</span>
                  <span>Part-time: 158</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/hr/attendance">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Clock className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">94.2%</div>
              <p className="text-xs text-muted-foreground">Today's Attendance</p>
              <div className="mt-2">
                <Progress value={94.2} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/hr/leave">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leave Management</CardTitle>
              <CalendarDays className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">23</div>
              <p className="text-xs text-muted-foreground">Pending Requests</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Approved: 156</span>
                  <span>Rejected: 12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/hr/payroll">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payroll</CardTitle>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">$847K</div>
              <p className="text-xs text-muted-foreground">This Month</p>
              <div className="mt-2">
                <Badge variant="secondary">Processing</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activities & Department Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">John Smith joined</p>
                <p className="text-sm text-muted-foreground">Software Engineer - IT Dept</p>
              </div>
              <Badge variant="secondary">New Hire</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sarah Wilson promoted</p>
                <p className="text-sm text-muted-foreground">Senior Manager - Sales</p>
              </div>
              <Badge>Promotion</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mike Johnson on leave</p>
                <p className="text-sm text-muted-foreground">Annual Leave - 5 days</p>
              </div>
              <Badge variant="outline">Leave</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Training completed</p>
                <p className="text-sm text-muted-foreground">Safety Training - 25 employees</p>
              </div>
              <Badge variant="secondary">Training</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>IT Department</span>
                <span>245 employees</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sales & Marketing</span>
                <span>189 employees</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Production</span>
                <span>312 employees</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Finance</span>
                <span>78 employees</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>HR</span>
                <span>23 employees</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              Add New Employee
            </Button>
            <Button variant="outline" className="justify-start">
              <Clock className="h-4 w-4 mr-2" />
              Mark Attendance
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Process Leave Request
            </Button>
            <Button variant="outline" className="justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Generate Payslips
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
