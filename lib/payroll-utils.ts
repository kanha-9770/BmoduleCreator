// Utility functions for payroll calculations

export interface PayrollCalculation {
  baseSalary: number
  presentDays: number
  leaveDays: number
  overtimeHours: number
  allowances: Record<string, number>
  deductions: Record<string, number>
}

export function calculateGrossSalary(calc: PayrollCalculation): number {
  const workingDays = 26
  const perDaySalary = calc.baseSalary / workingDays
  const earnedSalary = perDaySalary * calc.presentDays

  const hourlyRate = calc.baseSalary / (workingDays * 8)
  const overtimePay = calc.overtimeHours * hourlyRate * 1.5

  const totalAllowances = Object.values(calc.allowances).reduce((sum, val) => sum + val, 0)

  return earnedSalary + overtimePay + totalAllowances
}

export function calculateNetSalary(calc: PayrollCalculation): number {
  const grossSalary = calculateGrossSalary(calc)
  const totalDeductions = Object.values(calc.deductions).reduce((sum, val) => sum + val, 0)

  return grossSalary - totalDeductions
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
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
  ]
  return months[month - 1] || ""
}

export function getWorkingDaysInMonth(month: number, year: number): number {
  const date = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0).getDate()
  let workingDays = 0

  for (let day = 1; day <= lastDay; day++) {
    date.setDate(day)
    const dayOfWeek = date.getDay()
    // Exclude Sundays (0)
    if (dayOfWeek !== 0) {
      workingDays++
    }
  }

  return workingDays
}
