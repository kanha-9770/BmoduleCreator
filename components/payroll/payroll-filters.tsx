"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Download } from "lucide-react"
import { getMonthName } from "@/lib/payroll-utils"

interface PayrollFiltersProps {
  onFilterChange: (filters: PayrollFilterValues) => void
  onExport: () => void
}

export interface PayrollFilterValues {
  month: number
  year: number
  department?: string
  status?: string
  search?: string
}

export function PayrollFilters({ onFilterChange, onExport }: PayrollFiltersProps) {
  const currentDate = new Date()
  const [filters, setFilters] = useState<PayrollFilterValues>({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  })

  const handleFilterUpdate = (key: keyof PayrollFilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            className="pl-9"
            value={filters.search || ""}
            onChange={(e) => handleFilterUpdate("search", e.target.value)}
          />
        </div>

        <Select
          value={filters.month.toString()}
          onValueChange={(value) => handleFilterUpdate("month", Number.parseInt(value))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month.toString()}>
                {getMonthName(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.year.toString()}
          onValueChange={(value) => handleFilterUpdate("year", Number.parseInt(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.department || "all"}
          onValueChange={(value) => handleFilterUpdate("department", value === "all" ? undefined : value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || "all"}
          onValueChange={(value) => handleFilterUpdate("status", value === "all" ? undefined : value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onExport} variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  )
}
