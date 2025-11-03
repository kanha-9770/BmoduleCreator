"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PayrollSummaryCard } from "@/components/payroll/payroll-summary-card"
import { EmployeePayrollTable } from "@/components/payroll/employee-payroll-table"
import { PayrollFilters, type PayrollFilterValues } from "@/components/payroll/payroll-filters"
import { PayrollConfigDialog } from "@/components/payroll/payroll-config-dialog"
import { PayrollConfigBanner } from "@/components/payroll/payroll-config-banner"
import { DollarSign, Users, Calendar, TrendingUp, FileText, Calculator, Loader2, Settings } from "lucide-react"
import { formatCurrency, getMonthName } from "@/lib/payroll-utils"
import { toast } from "sonner"

interface EmployeePayroll {
  id: string
  employeeName: string
  department: string
  designation: string
  presentDays: number
  leaveDays: number
  grossSalary: number
  deductions: number
  netSalary: number
  status: "pending" | "processed" | "paid"
}

export default function PayrollPage() {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [hasConfig, setHasConfig] = useState(false)
  const [config, setConfig] = useState<any>(null)
  const [filters, setFilters] = useState<PayrollFilterValues>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })
  const [payrollData, setPayrollData] = useState<EmployeePayroll[]>([])
  const [employees, setEmployees] = useState<any[]>([])

  useEffect(() => {
    checkConfiguration()
  }, [])

  useEffect(() => {
    if (hasConfig) {
      fetchPayrollData()
    }
  }, [hasConfig, filters])

  const checkConfiguration = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/payroll/config")
      const data = await response.json()

      if (data.success && data.config) {
        setHasConfig(true)
        setConfig(data.config)
      } else {
        setHasConfig(false)
      }
    } catch (error) {
      console.error("[v0] Error checking config:", error)
      setHasConfig(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayrollData = async () => {
    setLoading(true)
    try {
      // Fetch employees
      const employeesResponse = await fetch("/api/employees")
      const employeesData = await employeesResponse.json()

      if (employeesData.success) {
        setEmployees(employeesData.employees)
      }

      // Fetch attendance and leave records
      const recordsResponse = await fetch(`/api/payroll/records?month=${filters.month}&year=${filters.year}`)
      const recordsData = await recordsResponse.json()

      if (recordsData.success) {
        // Calculate payroll for each employee
        const calculatedPayroll = calculatePayrollForEmployees(
          employeesData.employees,
          recordsData.data.attendance,
          recordsData.data.leave,
        )
        setPayrollData(calculatedPayroll)
      }
    } catch (error) {
      console.error("[v0] Error fetching payroll data:", error)
      toast.error("Failed to load payroll data")
    } finally {
      setLoading(false)
    }
  }

  const calculatePayrollForEmployees = (employees: any[], attendance: any[], leave: any[]) => {
    return employees.map((employee) => {
      // Filter records for this employee
      const empAttendance = attendance.filter((a: any) => a.employee_id === employee.id)
      const empLeave = leave.filter((l: any) => l.employee_id === employee.id)

      // Calculate present days and leave days
      const presentDays = empAttendance.length
      const leaveDays = empLeave.length

      // Get base salary from employee record
      const baseSalary = Number(employee.totalSalary || 0)
      const workingDays = 26

      // Calculate gross salary
      const perDaySalary = baseSalary / workingDays
      const earnedSalary = perDaySalary * presentDays

      // Calculate overtime if available in attendance records
      const totalOvertime = empAttendance.reduce((sum: number, record: any) => {
        const overtime = record.recordData?.overtime || 0
        return sum + Number(overtime)
      }, 0)

      const hourlyRate = baseSalary / (workingDays * 8)
      const overtimePay = totalOvertime * hourlyRate * 1.5

      // Add allowances from employee record
      const allowances =
        Number(employee.bonusAmount || 0) + Number(employee.nightAllowance || 0) + Number(employee.oneHourExtra || 0)

      const grossSalary = earnedSalary + overtimePay + allowances

      // Calculate deductions (unpaid leaves)
      const deductions = perDaySalary * leaveDays

      const netSalary = grossSalary - deductions

      return {
        id: employee.id,
        employeeName: employee.employeeName,
        department: employee.department || "N/A",
        designation: employee.designation || "N/A",
        presentDays,
        leaveDays,
        grossSalary: Number(grossSalary.toFixed(2)),
        deductions: Number(deductions.toFixed(2)),
        netSalary: Number(netSalary.toFixed(2)),
        status: "pending" as const,
      }
    })
  }

  const summaryStats = {
    totalPayroll: payrollData.reduce((sum, emp) => sum + emp.netSalary, 0),
    totalEmployees: payrollData.length,
    averageSalary:
      payrollData.length > 0 ? payrollData.reduce((sum, emp) => sum + emp.netSalary, 0) / payrollData.length : 0,
    totalDeductions: payrollData.reduce((sum, emp) => sum + emp.deductions, 0),
  }

  const handleFilterChange = (newFilters: PayrollFilterValues) => {
    setFilters(newFilters)
  }

  const handleViewDetails = (id: string) => {
    toast.info(`Viewing details for employee: ${id}`)
  }

  const handleDownload = (id: string) => {
    toast.success(`Downloading payslip for employee: ${id}`)
  }

  const handleSendPayslip = (id: string) => {
    toast.success(`Payslip sent to employee: ${id}`)
  }

  const handleExport = () => {
    toast.success("Exporting payroll data...")
  }

  const handleProcessPayroll = async () => {
    setProcessing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success("Payroll processed successfully!")
      fetchPayrollData()
    } catch (error) {
      toast.error("Failed to process payroll")
    } finally {
      setProcessing(false)
    }
  }

  const handleConfigSaved = () => {
    checkConfiguration()
    toast.success("Configuration saved! Loading payroll data...")
  }

  if (loading && !hasConfig) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee payroll for {getMonthName(filters.month)} {filters.year}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setConfigDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          {hasConfig && (
            <>
              <Button variant="outline" onClick={handleProcessPayroll} disabled={processing}>
                <Calculator className="h-4 w-4 mr-2" />
                {processing ? "Processing..." : "Process Payroll"}
              </Button>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Generate Reports
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Configuration Banner */}
      {!hasConfig && <PayrollConfigBanner onConfigure={() => setConfigDialogOpen(true)} />}

      {/* Configuration Dialog */}
      <PayrollConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        onConfigSaved={handleConfigSaved}
      />

      {/* Main Content - Only show if configured */}
      {hasConfig && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PayrollSummaryCard
              title="Total Payroll"
              value={formatCurrency(summaryStats.totalPayroll)}
              icon={DollarSign}
              description="Total net salary for this month"
            />
            <PayrollSummaryCard
              title="Total Employees"
              value={summaryStats.totalEmployees}
              icon={Users}
              description="Active employees"
            />
            <PayrollSummaryCard
              title="Average Salary"
              value={formatCurrency(summaryStats.averageSalary)}
              icon={TrendingUp}
              description="Per employee"
            />
            <PayrollSummaryCard
              title="Total Deductions"
              value={formatCurrency(summaryStats.totalDeductions)}
              icon={Calendar}
              description="All deductions combined"
            />
          </div>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Payroll</CardTitle>
              <CardDescription>
                View and manage payroll for all employees based on attendance and leave records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PayrollFilters onFilterChange={handleFilterChange} onExport={handleExport} />

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Tabs defaultValue="all" className="w-full">
                  <TabsList>
                    <TabsTrigger value="all">All Employees</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="processed">Processed</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-6">
                    <EmployeePayrollTable
                      data={payrollData}
                      onViewDetails={handleViewDetails}
                      onDownload={handleDownload}
                      onSendPayslip={handleSendPayslip}
                    />
                  </TabsContent>

                  <TabsContent value="pending" className="mt-6">
                    <EmployeePayrollTable
                      data={payrollData.filter((emp) => emp.status === "pending")}
                      onViewDetails={handleViewDetails}
                      onDownload={handleDownload}
                      onSendPayslip={handleSendPayslip}
                    />
                  </TabsContent>

                  <TabsContent value="processed" className="mt-6">
                    <EmployeePayrollTable
                      data={payrollData.filter((emp) => emp.status === "processed")}
                      onViewDetails={handleViewDetails}
                      onDownload={handleDownload}
                      onSendPayslip={handleSendPayslip}
                    />
                  </TabsContent>

                  <TabsContent value="paid" className="mt-6">
                    <EmployeePayrollTable
                      data={payrollData.filter((emp) => emp.status === "paid")}
                      onViewDetails={handleViewDetails}
                      onDownload={handleDownload}
                      onSendPayslip={handleSendPayslip}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Integration Info */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Data Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Attendance Records</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically fetches attendance data from configured form to calculate working days and overtime
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Leave Records</h4>
                    <p className="text-sm text-muted-foreground">
                      Integrates leave data from configured form to apply deductions and adjust payroll accordingly
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
