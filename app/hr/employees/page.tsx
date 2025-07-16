"use client";

import { Button } from "@/components/ui/button";
import { Download, Plus, ExternalLink } from "lucide-react";
import { EmployeeStats } from "@/components/hr/employee-stats";
import { EmployeeTable } from "@/components/hr/employee-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PublicFormDialog } from "@/components/public-form-dialog";

interface FormData {
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
  deleted?: string;
}

interface Form {
  id: string;
  name: string;
  isPublished: boolean;
  publishedUrl?: string;
}

export default function EmployeesPage() {
  const [formData, setFormData] = useState<FormData>({
    id: "",
    name: "",
    sex: "",
    department: "",
    designation: "",
    dob: "",
    native: "",
    belongsCountry: "",
    permanentAddress: "",
    currentAddress: "",
    contact: "",
    altNo1: "",
    altNo2: "",
    email1: "",
    email2: "",
    adharCardUpload: "",
    adharCardNo: "",
    panCardUpload: "",
    passportUpload: "",
    bankName: "",
    bankAccountNo: "",
    ifscCode: "",
    status: "",
    shiftType: "",
    timeIn: "",
    timeOut: "",
    dateOfJoining: "",
    dateOfLeaving: "",
    incrementMonth: "",
    yearsOfAgreement: "",
    bonus: "",
    companyName: "",
    totalSalary: "",
    givenSalary: "",
    bonusAmount: "",
    nightAllowance: "",
    overTime: "",
    extra1Hour: "",
    companySim: "",
    deleted: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [forms, setForms] = useState<Form[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // State for form dialog (for form links)
  const [selectedFormForFilling, setSelectedFormForFilling] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchForms() {
      if (!id) {
        setError("Module ID is missing");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/modules/${id}`);
        const result = await response.json();
        console.log("Fetched module data:", result);

        if (result.success && result.data && Array.isArray(result.data.forms)) {
          setForms(result.data.forms);
          setError(null);
        } else {
          setError(result.error || "No forms found for this module");
          setForms([]);
        }
      } catch (err) {
        setError("Failed to fetch forms");
        setForms([]);
      } finally {
        setLoading(false);
      }
    }
    fetchForms();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleEditEmployee = (employee: FormData) => {
    setFormData({ ...employee, deleted: "" });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      sex: "",
      department: "",
      designation: "",
      dob: "",
      native: "",
      belongsCountry: "",
      permanentAddress: "",
      currentAddress: "",
      contact: "",
      altNo1: "",
      altNo2: "",
      email1: "",
      email2: "",
      adharCardUpload: "",
      adharCardNo: "",
      panCardUpload: "",
      passportUpload: "",
      bankName: "",
      bankAccountNo: "",
      ifscCode: "",
      status: "",
      shiftType: "",
      timeIn: "",
      timeOut: "",
      dateOfJoining: "",
      dateOfLeaving: "",
      incrementMonth: "",
      yearsOfAgreement: "",
      bonus: "",
      companyName: "",
      totalSalary: "",
      givenSalary: "",
      bonusAmount: "",
      nightAllowance: "",
      overTime: "",
      extra1Hour: "",
      companySim: "",
      deleted: "",
    });
    setIsEditMode(false);
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isEditMode ? "PUT" : "POST";
      const response = await fetch("/api/hrEmployee/add-employee-data", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeData: { ...formData, deleted: "" } }),
      });
      if (response.ok) {
        alert(
          isEditMode
            ? "Employee updated successfully!"
            : "Employee added successfully!"
        );
        resetForm();
        window.location.reload();
      } else {
        alert(
          isEditMode ? "Failed to update employee." : "Failed to add employee."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    }
  };

  // Generate published URL if not provided by the API
  const generatePublishedUrl = (formId: string) => {
    return `${window.location.origin}/forms/${formId}`;
  };

  // Open form dialog
  const openFormDialog = (formId: string) => {
    setSelectedFormForFilling(formId);
    setIsFormDialogOpen(true);
  };

  // Close form dialog
  const closeFormDialog = () => {
    setIsFormDialogOpen(false);
    setSelectedFormForFilling(null);
  };

  // Open employee dialog
  const openEmployeeDialog = () => {
    resetForm(); // Reset form to ensure fresh state
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openEmployeeDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Edit Employee" : "Add New Employee"}
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit}
                className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id">Employee ID</Label>
                    <Input
                      id="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      placeholder="Enter employee ID"
                      disabled={isEditMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Employee Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter employee name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex</Label>
                  <Select
                    value={formData.sex}
                    onValueChange={(value) => handleSelectChange("sex", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleSelectChange("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Production">Production</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="Enter designation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">DOB</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="native">Native</Label>
                    <Input
                      id="native"
                      value={formData.native}
                      onChange={handleInputChange}
                      placeholder="Enter native place"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="belongsCountry">Belongs Country</Label>
                    <Input
                      id="belongsCountry"
                      value={formData.belongsCountry}
                      onChange={handleInputChange}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="permanentAddress">Permanent Address</Label>
                    <Input
                      id="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleInputChange}
                      placeholder="Enter permanent address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentAddress">Current Address</Label>
                    <Input
                      id="currentAddress"
                      value={formData.currentAddress}
                      onChange={handleInputChange}
                      placeholder="Enter current address"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="Enter contact number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="altNo1">Alt. No 1</Label>
                    <Input
                      id="altNo1"
                      value={formData.altNo1}
                      onChange={handleInputChange}
                      placeholder="Enter alternate number 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="altNo2">Alt. No 2</Label>
                    <Input
                      id="altNo2"
                      value={formData.altNo2}
                      onChange={handleInputChange}
                      placeholder="Enter alternate number 2"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email1">Email Address</Label>
                  <Input
                    id="email1"
                    type="email"
                    value={formData.email1}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">Email Address</Label>
                  <Input
                    id="email2"
                    type="email"
                    value={formData.email2}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adharCardUpload">Adhar Card Upload</Label>
                    <Input
                      id="adharCardUpload"
                      value={formData.adharCardUpload}
                      onChange={handleInputChange}
                      placeholder="Enter Adhar Card upload URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adharCardNo">Adhar Card No</Label>
                    <Input
                      id="adharCardNo"
                      value={formData.adharCardNo}
                      onChange={handleInputChange}
                      placeholder="Enter Adhar Card number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="panCardUpload">PAN Card Upload</Label>
                    <Input
                      id="panCardUpload"
                      value={formData.panCardUpload}
                      onChange={handleInputChange}
                      placeholder="Enter PAN Card upload URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportUpload">Passport Upload</Label>
                    <Input
                      id="passportUpload"
                      value={formData.passportUpload}
                      onChange={handleInputChange}
                      placeholder="Enter Passport upload URL"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNo">Bank Account No</Label>
                    <Input
                      id="bankAccountNo"
                      value={formData.bankAccountNo}
                      onChange={handleInputChange}
                      placeholder="Enter bank account number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleInputChange}
                    placeholder="Enter IFSC code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shiftType">Shift Type</Label>
                  <Select
                    value={formData.shiftType}
                    onValueChange={(value) => handleSelectChange("shiftType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Day">Day</SelectItem>
                      <SelectItem value="Night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeIn">Time In</Label>
                    <Input
                      id="timeIn"
                      value={formData.timeIn}
                      onChange={handleInputChange}
                      placeholder="Enter time in"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeOut">Time Out</Label>
                    <Input
                      id="timeOut"
                      value={formData.timeOut}
                      onChange={handleInputChange}
                      placeholder="Enter time out"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfJoining">Date of Joining</Label>
                    <Input
                      id="dateOfJoining"
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfLeaving">Date of Leaving</Label>
                    <Input
                      id="dateOfLeaving"
                      type="date"
                      value={formData.dateOfLeaving}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incrementMonth">Increment Month</Label>
                  <Input
                    id="incrementMonth"
                    type="month"
                    value={formData.incrementMonth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsOfAgreement">Years of Agreement</Label>
                  <Input
                    id="yearsOfAgreement"
                    value={formData.yearsOfAgreement}
                    onChange={handleInputChange}
                    placeholder="Enter years of agreement"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonus">Bonus</Label>
                  <Input
                    id="bonus"
                    value={formData.bonus}
                    onChange={handleInputChange}
                    placeholder="Enter bonus eligibility"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalSalary">Total Salary</Label>
                    <Input
                      id="totalSalary"
                      value={formData.totalSalary}
                      onChange={handleInputChange}
                      placeholder="Enter total salary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="givenSalary">Given Salary</Label>
                    <Input
                      id="givenSalary"
                      value={formData.givenSalary}
                      onChange={handleInputChange}
                      placeholder="Enter given salary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonusAmount">Bonus Amount</Label>
                  <Input
                    id="bonusAmount"
                    value={formData.bonusAmount}
                    onChange={handleInputChange}
                    placeholder="Enter bonus amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nightAllowance">Night Allowance</Label>
                  <Input
                    id="nightAllowance"
                    value={formData.nightAllowance}
                    onChange={handleInputChange}
                    placeholder="Enter night allowance"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overTime">Over Time</Label>
                    <Input
                      id="overTime"
                      value={formData.overTime}
                      onChange={handleInputChange}
                      placeholder="Enter over time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extra1Hour">Extra 1 Hour</Label>
                    <Input
                      id="extra1Hour"
                      value={formData.extra1Hour}
                      onChange={handleInputChange}
                      placeholder="Enter extra 1 hour"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySim">Company SIM</Label>
                  <Input
                    id="companySim"
                    value={formData.companySim}
                    onChange={handleInputChange}
                    placeholder="Enter company SIM number"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" type="button" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditMode ? "Update Employee" : "Add Employee"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <EmployeeStats />

      {/* Display Forms in Tabular Format */}
      {error && <div className="text-red-500">{error}</div>}
      {loading ? (
        <div className="text-gray-500">Loading forms...</div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Forms in Module</h2>
          {forms.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Form ID</TableHead>
                    <TableHead className="font-semibold">Form Name</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Published URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell>{form.id}</TableCell>
                      <TableCell>{form.name}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            form.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {form.isPublished ? "Published" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {form.isPublished ? (
                          <Button
                            variant="link"
                            className="text-blue-500 hover:underline flex items-center gap-1"
                            onClick={() => openFormDialog(form.id)}
                          >
                            <ExternalLink className="h-4 w-4" />
                            {form.publishedUrl || generatePublishedUrl(form.id)}
                          </Button>
                        ) : (
                          <span className="text-gray-500">Not Published</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-gray-500">No forms found in this module.</div>
          )}
        </div>
      )}

      <EmployeeTable onEdit={handleEditEmployee} />

      {/* Form Dialog for Published URLs */}
      <PublicFormDialog
        formId={selectedFormForFilling}
        isOpen={isFormDialogOpen}
        onClose={closeFormDialog}
      />
    </div>
  );
}