"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  FileText,
  Calculator,
  TrendingUp,
  Users,
  Building2,
  Save,
} from "lucide-react";

type Payroll = {
  id: string;
  name: string;
  department: string;
  designation: string;
  month: string;
  monthDays: number;
  totalSalary: number;
  bonus: number;
  workingDays: number;
  leaves: number;
  halfDays: number;
  workingDayAmount: number;
  leaveAmount: number;
  halfDayAmount: number;
  overtime: number;
  totalAmount: number;
  advanceTaken: number;
  givenSalary: number;
  status: string;
  avatar: string;
};

export default function PayrollPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [payrollData, setPayrollData] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayrollData() {
      try {
        // Fetch employee data
        const employeeResponse = await fetch(
          "/api/hrEmployee/add-employee-data"
        );
        const employeeResult = await employeeResponse.json();
        if (employeeResult.error) {
          throw new Error(employeeResult.error);
        }

        // Fetch payroll data (excluding status)
        let payrollRecords: any[] = [];
        try {
          const payrollResponse = await fetch(
            "/api/hrPayroll/add-payroll-data"
          );
          const payrollResult = await payrollResponse.json();
          if (payrollResult.error) {
            console.warn(
              "Payroll data fetch failed, using placeholders:",
              payrollResult.error
            );
          } else {
            payrollRecords = payrollResult.values || [];
          }
        } catch (payrollError) {
          console.warn(
            "Error fetching payroll data, using placeholders:",
            payrollError instanceof Error ? payrollError.message : payrollError
          );
        }

        // Map employee data
        const employeeData = employeeResult.values.map(
          (
            row: [
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any
            ]
          ) => ({
            id: row[0] || "",
            name: row[1] || "",
            department: row[3] || "",
            designation: row[4] || "",
            totalSalary: parseFloat(row[32] || 0),
            bonus: parseFloat(row[34] || 0),
            overtime: parseFloat(row[36] || 0),
          })
        );

        // Map payroll data (exclude status)
        const mappedPayroll = payrollRecords.map(
          (
            row: [
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any,
              any
            ]
          ) => ({
            id: row[0] || "",
            name: row[1] || "",
            department: row[2] || "",
            designation: row[3] || "",
            month: row[4] || "January 2025",
            monthDays: parseInt(row[5] || 31),
            totalSalary: parseFloat(row[6] || 0),
            bonus: parseFloat(row[7] || 0),
            workingDays: parseInt(row[8] || 22),
            leaves: parseInt(row[9] || 2),
            halfDays: parseInt(row[10] || 1),
            workingDayAmount: parseFloat(row[11] || 0),
            leaveAmount: parseFloat(row[12] || 0),
            halfDayAmount: parseFloat(row[13] || 0),
            overtime: parseFloat(row[14] || 0),
            totalAmount: parseFloat(row[15] || 0),
            advanceTaken: parseFloat(row[16] || 0),
            givenSalary: parseFloat(row[17] || 0),
            avatar: "/placeholder.svg?height=40&width=40",
          })
        );

        // Merge employee and payroll data, set status to "Pending" by default
        const mergedData = employeeData.map(
          (employee: {
            id: any;
            totalSalary: number;
            bonus: any;
            overtime: any;
            name: any;
            department: any;
            designation: any;
          }) => {
            const payroll = mappedPayroll.find(
              (p) => p.id === employee.id && p.month === "January 2025"
            );
            const month = payroll ? payroll.month : "January 2025";
            const monthDays = payroll ? payroll.monthDays : 31;
            const workingDays = payroll ? payroll.workingDays : 22;
            const leaves = payroll ? payroll.leaves : 2;
            const halfDays = payroll ? payroll.halfDays : 1;
            const advanceTaken = payroll ? payroll.advanceTaken : 0;
            const workingDayAmount = payroll
              ? payroll.workingDayAmount
              : (employee.totalSalary * workingDays) / monthDays;
            const leaveAmount = payroll
              ? payroll.leaveAmount
              : (employee.totalSalary * leaves) / monthDays;
            const halfDayAmount = payroll
              ? payroll.halfDayAmount
              : (employee.totalSalary * halfDays) / (2 * monthDays);
            const totalAmount = payroll
              ? payroll.totalAmount
              : employee.totalSalary +
                employee.bonus +
                employee.overtime -
                leaveAmount -
                halfDayAmount;
            const givenSalary = payroll
              ? payroll.givenSalary
              : totalAmount - advanceTaken;

            return {
              id: employee.id,
              name: employee.name,
              department: employee.department,
              designation: employee.designation,
              month,
              monthDays,
              totalSalary: employee.totalSalary,
              bonus: employee.bonus,
              workingDays,
              leaves,
              halfDays,
              workingDayAmount,
              leaveAmount,
              halfDayAmount,
              overtime: employee.overtime,
              totalAmount,
              advanceTaken,
              givenSalary,
              status: "Pending",
            };
          }
        );

        setPayrollData(mergedData);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          console.error("Error fetching data:", err.message);
          setError(`Failed to load data: ${err.message}`);
        } else {
          console.error("Error fetching data:", err);
          setError("Failed to load data: Unknown error");
        }
        setLoading(false);
      }
    }

    fetchPayrollData();
  }, []);

  const handleProcessPayroll = async () => {
    try {
      setLoading(true);
      const payload = payrollData.map((payroll) => ({
        ...payroll,
        status: "Pending",
      }));
      const response = await fetch("/api/hrPayroll/add-payroll-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payrollData: payload }),
      });

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      alert("Payroll data successfully saved to Google Sheet!");
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error saving payroll data:", err.message);
        setError(`Failed to save payroll data: ${err.message}`);
      } else {
        console.error("Error saving payroll data:", err);
        setError(`Failed to save payroll data: ${String(err)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (payroll: Payroll, newStatus: string) => {
    try {
      setLoading(true);
      const updatedPayroll = { ...payroll, status: newStatus };
      const response = await fetch("/api/hrPayroll/add-payroll-data", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payrollData: updatedPayroll }),
      });

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      // Update local state
      setPayrollData((prev) =>
        prev.map((p) =>
          p.id === payroll.id && p.month === payroll.month ? updatedPayroll : p
        )
      );
      alert(`Payroll status updated to ${newStatus}!`);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error updating payroll status:", err.message);
        setError(`Failed to update payroll status: ${err.message}`);
      } else {
        console.error("Error updating payroll status:", err);
        setError(`Failed to update payroll status: ${String(err)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredPayroll = payrollData.filter((payroll) => {
    const matchesSearch =
      payroll.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" || payroll.department === selectedDepartment;
    const matchesStatus =
      selectedStatus === "all" || payroll.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Processed":
        return "bg-green-100 hover:bg-green-100 text-green-800";
      case "Processing":
        return "bg-blue-100 hover:bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 hover:bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 hover:bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: string | number | bigint) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(numericAmount);
  };

  const totalTotalSalary = payrollData.reduce(
    (sum, emp) => sum + emp.totalSalary,
    0
  );
  const totalBonus = payrollData.reduce((sum, emp) => sum + emp.bonus, 0);
  const totalGivenSalary = payrollData.reduce(
    (sum, emp) => sum + emp.givenSalary,
    0
  );

  if (loading) {
    return <div>Loading payroll data...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        {error}
        <Button
          onClick={() => {
            setError(null);
            setLoading(true);
            setPayrollData([]);
          }}
          className="ml-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payroll Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Payroll
          </Button>
          <Button onClick={handleProcessPayroll}>
            <Calculator className="h-4 w-4 mr-2" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salary</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalTotalSalary)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonus</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalBonus)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
            <span className="h-4 w-4 text-green-600">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalGivenSalary)}
            </div>
            <p className="text-xs text-muted-foreground">Final payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollData.length}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Payroll */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department-wise Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["IT", "Sales", "Production", "Finance", "HR"].map((dept) => {
                const deptTotal = payrollData
                  .filter((emp) => emp.department === dept)
                  .reduce((sum, emp) => sum + emp.totalSalary, 0);
                return (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dept}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(deptTotal)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Processing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Processed", "Processing", "Pending"].map((status) => {
                const statusCount = payrollData.filter(
                  (emp) => emp.status === status
                ).length;
                const colorClass =
                  status === "Processed"
                    ? "bg-green-500"
                    : status === "Processing"
                    ? "bg-blue-500"
                    : "bg-yellow-500";
                return (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 ${colorClass} rounded-full`}
                      ></div>
                      <span className="text-sm font-medium">{status}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {statusCount} employees
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Payroll - January 2025</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Production">Production</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Processed">Processed</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Month Days</TableHead>
                  <TableHead>Total Salary</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Working Days</TableHead>
                  <TableHead>Leaves</TableHead>
                  <TableHead>Half Days</TableHead>
                  <TableHead>Working Day Amt</TableHead>
                  <TableHead>Leave Amt</TableHead>
                  <TableHead>Half Day Amt</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Total Amt</TableHead>
                  <TableHead>Advance Taken</TableHead>
                  <TableHead>Given Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayroll.map((payroll) => (
                  <TableRow key={`${payroll.id}-${payroll.month}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={payroll.avatar || "/placeholder.svg"}
                            alt={payroll.name}
                          />
                          <AvatarFallback>
                            {payroll.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{payroll.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {payroll.id} • {payroll.department} •{" "}
                            {payroll.designation}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{payroll.month}</TableCell>
                    <TableCell>{payroll.monthDays}</TableCell>
                    <TableCell>{formatCurrency(payroll.totalSalary)}</TableCell>
                    <TableCell>{formatCurrency(payroll.bonus)}</TableCell>
                    <TableCell>{payroll.workingDays}</TableCell>
                    <TableCell>{payroll.leaves}</TableCell>
                    <TableCell>{payroll.halfDays}</TableCell>
                    <TableCell>
                      {formatCurrency(payroll.workingDayAmount)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {formatCurrency(payroll.leaveAmount)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {formatCurrency(payroll.halfDayAmount)}
                    </TableCell>
                    <TableCell>{formatCurrency(payroll.overtime)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payroll.totalAmount)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {formatCurrency(payroll.advanceTaken)}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(payroll.givenSalary)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payroll.status)}>
                        {payroll.status}
                      </Badge>
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
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Payslip
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Payslip
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(payroll, "Processed")
                            }
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Mark as Processed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(payroll, "Processing")
                            }
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Mark as Processing
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(payroll, "Pending")
                            }
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Mark as Pending
                          </DropdownMenuItem>
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
  );
}
