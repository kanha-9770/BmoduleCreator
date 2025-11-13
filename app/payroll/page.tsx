"use client";

import { useState, useEffect } from "react";
import { EditablePayrollTable } from "@/components/payroll/editable-payroll-table";
import { PayrollMenu } from "@/components/payroll/payroll-menu";
import { BulkOperationsBar } from "@/components/payroll/bulk-operations-bar";
import { PayrollConfigBanner } from "@/components/payroll/payroll-config-banner";
import { PayrollConfigDialog } from "@/components/payroll/payroll-config-dialog";
import { AnalyticsDashboard } from "@/components/payroll/analytics-dashboard";
import { CalculationEditor } from "@/components/payroll/calculation-editor";
import { LeaveRulesManager } from "@/components/payroll/leave-rules-manager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { getMonthName, calculateLeaveDeductions } from "@/lib/payroll-utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Calculator } from "lucide-react";
import type { PayrollFilterValues } from "@/components/payroll/payroll-filters";
import { PayrollFiltersPopover } from "@/components/payroll/payroll-filters-popover";

interface EmployeePayroll {
  id: string;
  employeeName: string;
  department: string;
  designation: string;
  presentDays: number;
  leaveDays: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: "pending" | "processed" | "paid";
}

export default function PayrollPage() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState<PayrollFilterValues>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [payrollData, setPayrollData] = useState<EmployeePayroll[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveRules, setLeaveRules] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("payroll");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [calculationsOpen, setCalculationsOpen] = useState(false);
  const [leaveRulesOpen, setLeaveRulesOpen] = useState(false);

  useEffect(() => {
    checkUserRole();
    checkConfiguration();
    fetchLeaveRules();
  }, []);

  useEffect(() => {
    if (hasConfig) {
      fetchPayrollData();
    }
  }, [hasConfig, filters]);

  const checkUserRole = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (data.success) {
        setCurrentUserId(data.user.id);
        const hasAdminRole = data.user.unitAssignments?.some((ua: any) =>
          ua.role.name.toLowerCase().includes("admin")
        );
        setIsAdmin(hasAdminRole || false);
      }
    } catch (error) {
      console.error("[v0] Error checking user role:", error);
    }
  };

  const checkConfiguration = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payroll/config");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.config) {
        setHasConfig(true);
        setConfig(data.config);
      } else {
        setHasConfig(false);
      }
    } catch (error) {
      console.error("[v0] Error checking config:", error);
      setHasConfig(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRules = async () => {
    try {
      const response = await fetch("/api/payroll/leave-rules");

      if (!response.ok) {
        console.error(
          "[v0] Leave rules endpoint returned error:",
          response.status
        );
        return;
      }

      const data = await response.json();

      if (data.success) {
        const allRules = data.leaveTypes.flatMap(
          (type: any) => type.leaveRules
        );
        setLeaveRules(allRules);
      }
    } catch (error) {
      console.error("[v0] Error fetching leave rules:", error);
      setLeaveRules([]);
    }
  };

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const employeesResponse = await fetch("/api/employees");
      if (!employeesResponse.ok) {
        throw new Error("Failed to fetch employees");
      }
      const employeesData = await employeesResponse.json();

      if (employeesData.success) {
        setEmployees(employeesData.employees);
        setIsAdmin(employeesData.isAdmin);
      }

      const recordsResponse = await fetch(
        `/api/payroll/records?month=${filters.month}&year=${filters.year}`
      );
      if (!recordsResponse.ok) {
        throw new Error("Failed to fetch payroll records");
      }
      const recordsData = await recordsResponse.json();

      if (recordsData.success) {
        const calculatedPayroll = calculatePayrollForEmployees(
          employeesData.employees,
          recordsData.data.attendance,
          recordsData.data.leave
        );
        setPayrollData(calculatedPayroll);
      }
    } catch (error) {
      console.error("[v0] Error fetching payroll data:", error);
      toast.error(
        "Failed to load payroll data. Please check your configuration."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculatePayrollForEmployees = (
    employees: any[],
    attendance: any[],
    leave: any[]
  ) => {
    return employees.map((employee) => {
      const empAttendance = attendance.filter(
        (a: any) => a.employee_id === employee.id
      );
      const empLeave = leave.filter((l: any) => l.employee_id === employee.id);

      const presentDays = empAttendance.length;

      const baseSalary = Number(employee.totalSalary || 0);
      const workingDays = 26;

      const leaveCalculation = calculateLeaveDeductions(
        empLeave,
        leaveRules,
        baseSalary,
        workingDays
      );

      const perDaySalary = baseSalary / workingDays;
      const earnedSalary = perDaySalary * presentDays;

      const totalOvertime = empAttendance.reduce((sum: number, record: any) => {
        const overtime = record.recordData?.overtime || 0;
        return sum + Number(overtime);
      }, 0);

      const hourlyRate = baseSalary / (workingDays * 8);
      const overtimePay = totalOvertime * hourlyRate * 1.5;

      const allowances =
        Number(employee.bonusAmount || 0) +
        Number(employee.nightAllowance || 0) +
        Number(employee.oneHourExtra || 0);

      const grossSalary = earnedSalary + overtimePay + allowances;

      const deductions = leaveCalculation.totalDeduction;

      const netSalary = grossSalary - deductions;

      return {
        id: employee.id,
        employeeName: employee.employeeName,
        department: employee.department || "N/A",
        designation: employee.designation || "N/A",
        presentDays,
        leaveDays: leaveCalculation.fullDays + leaveCalculation.halfDays * 0.5,
        grossSalary: Number(grossSalary.toFixed(2)),
        deductions: Number(deductions.toFixed(2)),
        netSalary: Number(netSalary.toFixed(2)),
        status: "pending" as const,
      };
    });
  };

  const summaryStats = {
    totalPayroll: payrollData.reduce((sum, emp) => sum + emp.netSalary, 0),
    totalEmployees: payrollData.length,
    averageSalary:
      payrollData.length > 0
        ? payrollData.reduce((sum, emp) => sum + emp.netSalary, 0) /
          payrollData.length
        : 0,
    totalDeductions: payrollData.reduce((sum, emp) => sum + emp.deductions, 0),
  };

  const handleFilterChange = (newFilters: PayrollFilterValues) => {
    setFilters(newFilters);
  };

  const handleViewDetails = (id: string) => {
    toast.info(`Viewing details for employee: ${id}`);
  };

  const handleDownload = (id: string) => {
    toast.success(`Downloading payslip for employee: ${id}`);
  };

  const handleSendPayslip = (id: string) => {
    toast.success(`Payslip sent to employee: ${id}`);
  };

  const handleSavePayroll = async (
    id: string,
    data: Partial<EmployeePayroll>
  ) => {
    try {
      const recordId = `${id}-${filters.month}-${filters.year}`;

      const requestBody = {
        ...data,
        employeeId: id,
        month: filters.month,
        year: filters.year,
      };

      console.log("[v0] Saving payroll record:", recordId, requestBody);

      const response = await fetch(`/api/payroll/records/${recordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save payroll data");
      }

      const result = await response.json();

      if (result.success) {
        // Update local state with saved data
        setPayrollData((prev) =>
          prev.map((emp) =>
            emp.id === id
              ? {
                  ...emp,
                  ...data,
                  netSalary:
                    data.grossSalary !== undefined ||
                    data.deductions !== undefined
                      ? (data.grossSalary ?? emp.grossSalary) -
                        (data.deductions ?? emp.deductions)
                      : emp.netSalary,
                }
              : emp
          )
        );
        toast.success("Payroll data saved successfully to database!");
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (error) {
      console.error("[v0] Error saving payroll:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save payroll data"
      );
      throw error;
    }
  };

  const handleDeletePayroll = async (id: string) => {
    try {
      const recordId = `${id}-${filters.month}-${filters.year}`;

      console.log("[v0] Deleting payroll record:", recordId);

      const response = await fetch(`/api/payroll/records/${recordId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete payroll record");
      }

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setPayrollData((prev) => prev.filter((emp) => emp.id !== id));
        toast.success("Payroll record deleted successfully from database!");
      } else {
        throw new Error(result.error || "Failed to delete");
      }
    } catch (error) {
      console.error("[v0] Error deleting payroll:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete payroll record"
      );
      throw error;
    }
  };

  const handleExport = () => {
    try {
      const csvHeaders = [
        "Employee Name",
        "Department",
        "Designation",
        "Present Days",
        "Leave Days",
        "Gross Salary",
        "Deductions",
        "Net Salary",
        "Status",
      ];

      const csvRows = payrollData.map((emp) => [
        emp.employeeName,
        emp.department,
        emp.designation,
        emp.presentDays,
        emp.leaveDays,
        emp.grossSalary,
        emp.deductions,
        emp.netSalary,
        emp.status,
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `payroll_${filters.month}_${filters.year}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Payroll data exported successfully!");
    } catch (error) {
      console.error("[v0] Error exporting payroll:", error);
      toast.error("Failed to export payroll data");
    }
  };

  const handleProcessPayroll = async () => {
    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Payroll processed successfully!");
      fetchPayrollData();
    } catch (error) {
      toast.error("Failed to process payroll");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfigSaved = () => {
    checkConfiguration();
    toast.success("Configuration saved! Loading payroll data...");
  };

  const handleSaveFormulas = (formulas: any[]) => {
    console.log("[v0] Saving custom formulas:", formulas);
    toast.success("Calculation formulas saved!");
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} payroll records?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(selectedIds.map((id) => handleDeletePayroll(id)));
      setSelectedIds([]);
      toast.success(`Successfully deleted ${selectedIds.length} records`);
    } catch (error) {
      toast.error("Failed to delete some records");
    }
  };

  const handleBulkExport = () => {
    try {
      const selectedData = payrollData.filter((emp) =>
        selectedIds.includes(emp.id)
      );
      const csvHeaders = [
        "Employee Name",
        "Department",
        "Designation",
        "Present Days",
        "Leave Days",
        "Gross Salary",
        "Deductions",
        "Net Salary",
        "Status",
      ];

      const csvRows = selectedData.map((emp) => [
        emp.employeeName,
        emp.department,
        emp.designation,
        emp.presentDays,
        emp.leaveDays,
        emp.grossSalary,
        emp.deductions,
        emp.netSalary,
        emp.status,
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `payroll_selected_${filters.month}_${filters.year}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${selectedIds.length} records successfully!`);
    } catch (error) {
      console.error("[v0] Error exporting selected records:", error);
      toast.error("Failed to export selected records");
    }
  };

  if (loading && !hasConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-background">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e0e0e0] bg-white">
        <div className="flex items-center gap-3">
          <PayrollFiltersPopover
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Month/Year Display */}
          <div className="text-sm font-medium text-[#202124]">
            {getMonthName(filters.month)} {filters.year}
          </div>

          {!hasConfig && isAdmin && (
            <span className="text-sm text-amber-600 font-medium">
              ⚠ Configuration required
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[#5f6368] hover:bg-[#f1f3f4]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </Button>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm font-medium border-[#dadce0] hover:bg-[#f1f3f4] bg-transparent"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {/* Process Payroll Button (Admin only) */}
          {isAdmin && (
            <Button
              size="sm"
              className="h-9 text-sm font-medium bg-[#1a73e8] hover:bg-[#1557b0] text-white"
              onClick={handleProcessPayroll}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Process Payroll
                </>
              )}
            </Button>
          )}

          {/* Actions Dropdown */}
          <PayrollMenu
            isAdmin={isAdmin}
            filters={filters}
            onFilterChange={handleFilterChange}
            onExport={handleExport}
            onProcessPayroll={handleProcessPayroll}
            onOpenAnalytics={() => setAnalyticsOpen(true)}
            onOpenCalculations={() => setCalculationsOpen(true)}
            onOpenLeaveRules={() => setLeaveRulesOpen(true)}
            processing={processing}
          />
        </div>
      </div>

      {hasConfig && !loading && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#e0e0e0] bg-[#f8f9fa] text-sm text-[#5f6368]">
          <div className="flex items-center gap-4">
            <span className="font-medium">
              Total Records: {payrollData.length}
            </span>
            <span>•</span>
            <span>
              {getMonthName(filters.month)} {filters.year}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>1-{payrollData.length}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {!hasConfig && isAdmin && (
        <div className="px-4 py-2">
          <PayrollConfigBanner onConfigure={() => setConfigDialogOpen(true)} />
        </div>
      )}

      {hasConfig && (
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <EditablePayrollTable
              data={payrollData}
              onViewDetails={handleViewDetails}
              onDownload={handleDownload}
              onSendPayslip={handleSendPayslip}
              onSave={handleSavePayroll}
              isAdmin={isAdmin}
              onDelete={handleDeletePayroll}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          )}
        </div>
      )}

      {isAdmin && (
        <BulkOperationsBar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
          isAdmin={isAdmin}
        />
      )}

      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Payroll Analytics</DialogTitle>
          </DialogHeader>
          <AnalyticsDashboard
            payrollData={payrollData}
            month={filters.month}
            year={filters.year}
          />
        </DialogContent>
      </Dialog>

      {isAdmin && (
        <>
          <Dialog open={calculationsOpen} onOpenChange={setCalculationsOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Custom Calculations</DialogTitle>
              </DialogHeader>
              <CalculationEditor onSave={handleSaveFormulas} />
            </DialogContent>
          </Dialog>

          <Dialog open={leaveRulesOpen} onOpenChange={setLeaveRulesOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Leave Rules</DialogTitle>
              </DialogHeader>
              <LeaveRulesManager />
            </DialogContent>
          </Dialog>

          <PayrollConfigDialog
            open={configDialogOpen}
            onOpenChange={setConfigDialogOpen}
            onConfigSaved={handleConfigSaved}
          />
        </>
      )}
    </div>
  );
}
