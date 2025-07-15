"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  sex: string;
  department: string;
  designation: string;
  dob: string;
  native: string;
  belongsCountry: string;
  permanentAddress: string;
  currentAddress: string;
  contact: string;
  altNo1: string;
  altNo2: string;
  email1: string;
  email2: string;
  adharCardUpload: string;
  adharCardNo: string;
  panCardUpload: string;
  passportUpload: string;
  bankName: string;
  bankAccountNo: string;
  ifscCode: string;
  status: string;
  shiftType: string;
  timeIn: string;
  timeOut: string;
  dateOfJoining: string;
  dateOfLeaving: string;
  incrementMonth: string;
  yearsOfAgreement: string;
  bonus: string;
  companyName: string;
  totalSalary: string;
  givenSalary: string;
  bonusAmount: string;
  nightAllowance: string;
  overTime: string;
  extra1Hour: string;
  companySim: string;
  avatar: string;
  deleted: string;
}

interface EmployeeTableProps {
  onEdit: (employee: Employee) => void;
}

export function EmployeeTable({ onEdit }: EmployeeTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/hrEmployee/add-employee-data", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.values) {
          const employees: Employee[] = data.values.map((row: string[], index: number) => {
            const employee = {
              id: row[0] || "",
              name: row[1] || "",
              sex: row[2] || "",
              department: row[3] || "",
              designation: row[4] || "",
              dob: row[5] || "",
              native: row[6] || "",
              belongsCountry: row[7] || "",
              permanentAddress: row[8] || "",
              currentAddress: row[9] || "",
              contact: row[10] || "",
              altNo1: row[11] || "",
              altNo2: row[12] || "",
              email1: row[13] || "",
              email2: row[14] || "",
              adharCardUpload: row[15] || "",
              adharCardNo: row[16] || "",
              panCardUpload: row[17] || "",
              passportUpload: row[18] || "",
              bankName: row[19] || "",
              bankAccountNo: row[20] || "",
              ifscCode: row[21] || "",
              status: row[22] || "",
              shiftType: row[23] || "",
              timeIn: row[24] || "",
              timeOut: row[25] || "",
              dateOfJoining: row[26] || "",
              dateOfLeaving: row[27] || "",
              incrementMonth: row[28] || "",
              yearsOfAgreement: row[29] || "",
              bonus: row[30] || "",
              companyName: row[31] || "",
              totalSalary: row[32] || "",
              givenSalary: row[33] || "",
              bonusAmount: row[34] || "",
              nightAllowance: row[35] || "",
              overTime: row[36] || "",
              extra1Hour: row[37] || "",
              companySim: row[38] || "",
              deleted: row[39] || "",
              avatar: "/placeholder.svg?height=40&width=40",
            };
            if (employee.deleted === "Deleted") {
              console.log(`Client-side: Detected deleted row for employee ID: ${employee.id}`); // Debug log
            }
            return employee;
          });
          console.log("Fetched employees:", employees); // Debug log
          setEmployeesList(employees);
        }
      } else {
        console.error("Failed to fetch employees:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (employeeId: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      const response = await fetch("/api/hrEmployee/add-employee-data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });

      if (response.ok) {
        setEmployeesList((prev) => prev.filter((employee) => employee.id !== employeeId));
        alert("Employee deleted successfully!");
      } else {
        alert("Failed to delete employee.");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("An error occurred while deleting the employee.");
    }
  };

  const filteredEmployees = employeesList.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" ||
      employee.department === selectedDepartment;
    const matchesStatus =
      selectedStatus === "all" || employee.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Directory</CardTitle>
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
              <SelectItem value="Production">Production</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
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
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Employee Name</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Native</TableHead>
                <TableHead>Belongs Country</TableHead>
                <TableHead>Permanent Address</TableHead>
                <TableHead>Current Address</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Alt. No 1</TableHead>
                <TableHead>Alt. No 2</TableHead>
                <TableHead>Email Address 1</TableHead>
                <TableHead>Email Address 2</TableHead>
                <TableHead>Adhar Card Upload</TableHead>
                <TableHead>Adhar Card No</TableHead>
                <TableHead>PAN Card Upload</TableHead>
                <TableHead>Passport Upload</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>Bank Account No</TableHead>
                <TableHead>IFSC Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Shift Type</TableHead>
                <TableHead>Time In</TableHead>
                <TableHead>Time Out</TableHead>
                <TableHead>Date of Joining</TableHead>
                <TableHead>Date of Leaving</TableHead>
                <TableHead>Increment Month</TableHead>
                <TableHead>Years of Agreement</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Total Salary</TableHead>
                <TableHead>Given Salary</TableHead>
                <TableHead>Bonus Amount</TableHead>
                <TableHead>Night Allowance</TableHead>
                <TableHead>Over Time</TableHead>
                <TableHead>Extra 1 Hour</TableHead>
                <TableHead>Company SIM</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="uppercase">{employee.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={employee.avatar || "/placeholder.svg"}
                          alt={employee.name}
                        />
                        <AvatarFallback>
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.sex}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{employee.dob}</TableCell>
                  <TableCell>{employee.native}</TableCell>
                  <TableCell>{employee.belongsCountry}</TableCell>
                  <TableCell>{employee.permanentAddress}</TableCell>
                  <TableCell>{employee.currentAddress}</TableCell>
                  <TableCell>{employee.contact}</TableCell>
                  <TableCell>{employee.altNo1}</TableCell>
                  <TableCell>{employee.altNo2}</TableCell>
                  <TableCell className="normal-case">{employee.email1}</TableCell>
                  <TableCell className="normal-case">{employee.email2}</TableCell>
                  <TableCell>{employee.adharCardUpload}</TableCell>
                  <TableCell>{employee.adharCardNo}</TableCell>
                  <TableCell>{employee.panCardUpload}</TableCell>
                  <TableCell>{employee.passportUpload}</TableCell>
                  <TableCell className="uppercase">{employee.bankName}</TableCell>
                  <TableCell>{employee.bankAccountNo}</TableCell>
                  <TableCell className="normal-case">{employee.ifscCode}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.shiftType}</TableCell>
                  <TableCell>{employee.timeIn}</TableCell>
                  <TableCell>{employee.timeOut}</TableCell>
                  <TableCell>{employee.dateOfJoining}</TableCell>
                  <TableCell>{employee.dateOfLeaving}</TableCell>
                  <TableCell>{employee.incrementMonth}</TableCell>
                  <TableCell>{employee.yearsOfAgreement}</TableCell>
                  <TableCell>{employee.bonus}</TableCell>
                  <TableCell>{employee.companyName}</TableCell>
                  <TableCell>{employee.totalSalary}</TableCell>
                  <TableCell>{employee.givenSalary}</TableCell>
                  <TableCell>{employee.bonusAmount}</TableCell>
                  <TableCell>{employee.nightAllowance}</TableCell>
                  <TableCell>{employee.overTime}</TableCell>
                  <TableCell>{employee.extra1Hour}</TableCell>
                  <TableCell>{employee.companySim}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(employee)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Employee
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Employee
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
  );
}