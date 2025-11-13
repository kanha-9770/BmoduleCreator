// Utility functions for payroll calculations

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month - 1] || "Unknown";
}

interface LeaveRecord {
  recordData: any;
}

interface LeaveRule {
  id: string;
  leaveTypeId: string;
  durationType: string;
  deductionType: string;
  deductionAmount: number;
}

export function calculateLeaveDeductions(
  leaveRecords: LeaveRecord[],
  leaveRules: LeaveRule[],
  baseSalary: number,
  workingDays: number
): {
  totalDeduction: number;
  fullDays: number;
  halfDays: number;
  shortLeaves: number;
} {
  let totalDeduction = 0;
  let fullDays = 0;
  let halfDays = 0;
  let shortLeaves = 0;

  const perDaySalary = baseSalary / workingDays;

  for (const leave of leaveRecords) {
    const leaveType = leave.recordData?.leaveType || leave.recordData?.type;
    const duration = leave.recordData?.duration || leave.recordData?.days || 1;

    // Find matching leave rule
    const rule = leaveRules.find((r) => r.leaveTypeId === leaveType);

    if (!rule) {
      // Default: full day deduction if no rule found
      fullDays += Number(duration);
      totalDeduction += perDaySalary * Number(duration);
      continue;
    }

    // Apply rule based on duration type
    if (rule.durationType === "full_day") {
      fullDays += Number(duration);
      if (rule.deductionType === "percentage") {
        totalDeduction += (baseSalary * rule.deductionAmount) / 100;
      } else {
        totalDeduction += rule.deductionAmount;
      }
    } else if (rule.durationType === "half_day") {
      halfDays += Number(duration);
      if (rule.deductionType === "percentage") {
        totalDeduction += (baseSalary * rule.deductionAmount) / 100;
      } else {
        totalDeduction += rule.deductionAmount;
      }
    } else if (rule.durationType === "short_leave") {
      shortLeaves += Number(duration);
      if (rule.deductionType === "percentage") {
        totalDeduction += (baseSalary * rule.deductionAmount) / 100;
      } else {
        totalDeduction += rule.deductionAmount;
      }
    }
  }

  return {
    totalDeduction,
    fullDays,
    halfDays,
    shortLeaves,
  };
}
