"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  LogOut,
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  Building,
  Users,
  Briefcase,
  Phone,
  MapPin,
  Smartphone,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Organization {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
}

interface UnitAssignment {
  unit: Unit;
  role: Role;
  notes: string | null;
}

interface Employee {
  employeeName: string;
  gender: string | null;
  department: string | null;
  designation: string | null;
  dob: string | null;
  nativePlace: string | null;
  country: string | null;
  permanentAddress: string | null;
  currentAddress: string | null;
  personalContact: string | null;
  alternateNo1: string | null;
  alternateNo2: string | null;
  emailAddress1: string | null;
  emailAddress2: string | null;
  aadharCardNo: string | null;
  bankName: string | null;
  bankAccountNo: string | null;
  ifscCode: string | null;
  status: string | null;
  shiftType: string | null;
  inTime: string | null;
  outTime: string | null;
  dateOfJoining: string | null;
  dateOfLeaving: string | null;
  incrementMonth: number | null;
  yearsOfAgreement: number | null;
  bonusAfterYears: number | null;
  companyName: string | null;
  totalSalary: number | null;
  givenSalary: number | null;
  bonusAmount: number | null;
  nightAllowance: number | null;
  overTime: number | null;
  oneHourExtra: number | null;
  companySimIssue: boolean | null;
}

interface User {
  id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  email_verified: boolean;
  status: string;
  createdAt: string;
  mobile: string | null;
  mobile_verified: boolean | null;
  avatar: string | null;
  department: string | null;
  phone: string | null;
  location: string | null;
  joinDate: string | null;
  organization: Organization | null;
  unitAssignments: UnitAssignment[];
  employee: Employee | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Profile component mounted, fetching user data");
    fetchUser();
  }, []);

  const fetchUser = async () => {
    console.log("Fetching user data from /api/auth/me");
    try {
      const response = await fetch("/api/auth/me");
      console.log("User fetch response status:", response.status);
      const result = await response.json();
      console.log("User fetch result:", result);

      if (!response.ok) {
        console.log("User fetch failed, redirecting to login");
        router.push("/login");
        return;
      }

      console.log("User data loaded successfully:", result.user);
      setUser(result.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out",
        });
        router.push("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading Profile...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getInitials = (name: string) => {
    return name.substring(0, 1).toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fullName =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            </div>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              {isLoggingOut ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Logging out...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-20 w-20 border-4 border-blue-100">
                <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back!
              </h2>
              <p className="text-lg text-gray-600 mt-2">{fullName}</p>
            </div>
          </div>

          {/* Account Information Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Account Status Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base font-medium">
                    Account Status
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-medium text-green-600 capitalize">
                      {user.status.toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Email Verified
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {user.email_verified ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Mobile Verified
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {user.mobile_verified ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base font-medium">
                    Email Address
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-900 break-all">{user.email}</p>
              </CardContent>
            </Card>

            {/* Account Created Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-base font-medium">
                    Member Since
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-900">
                  {formatDate(user.createdAt)}
                </p>
              </CardContent>
            </Card>

            {/* Phone and Mobile Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-base font-medium">
                    Contact Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Phone</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mobile</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.mobile || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location and Department Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-base font-medium">
                    Location & Department
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Location</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.location || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Department</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.department || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Join Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(user.joinDate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Username Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-base font-medium">
                    Username
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-900">
                  {user.username || "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Organization Section */}
          {user.organization && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-base font-medium">
                    Organization
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Name</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.organization.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ID</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.organization.id}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unit Assignments Section */}
          {user.unitAssignments.length > 0 && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-base font-medium">
                    Roles and Units
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit ID</TableHead>
                      <TableHead>Unit Name</TableHead>
                      <TableHead>Role ID</TableHead>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.unitAssignments.map((ua, index) => (
                      <TableRow key={index}>
                        <TableCell>{ua.unit.id}</TableCell>
                        <TableCell>{ua.unit.name}</TableCell>
                        <TableCell>{ua.role.id}</TableCell>
                        <TableCell>{ua.role.name}</TableCell>
                        <TableCell>{ua.notes || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Employee Details Section */}
          {user.employee && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-teal-600" />
                  <CardTitle className="text-base font-medium">
                    Employee Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Name</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.employeeName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Gender</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.gender || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Department</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.department || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Designation</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.designation || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">DOB</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(user.employee.dob)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Native Place
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.nativePlace || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Country</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.country || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Permanent Address
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.permanentAddress || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Current Address
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.currentAddress || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Personal Contact
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.personalContact || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Alternate No 1
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.alternateNo1 || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Alternate No 2
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.alternateNo2 || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email 1</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.emailAddress1 || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email 2</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.emailAddress2 || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Aadhar No</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.aadharCardNo || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bank Name</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.bankName || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Account No</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.bankAccountNo || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">IFSC</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.ifscCode || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.status || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Shift Type</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.shiftType || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">In Time</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.inTime || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Out Time</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.outTime || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Joining Date
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(user.employee.dateOfJoining)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Leaving Date
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(user.employee.dateOfLeaving)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Increment Month
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.incrementMonth || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Years of Agreement
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.yearsOfAgreement || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Bonus After Years
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.bonusAfterYears || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Company Name
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.companyName || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Total Salary
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.totalSalary || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Given Salary
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.givenSalary || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Bonus Amount
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.bonusAmount || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Night Allowance
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.nightAllowance || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Over Time</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.overTime || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        One Hour Extra
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.oneHourExtra || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Company SIM Issued
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.employee.companySimIssue ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-12 justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
                <Button variant="outline" className="h-12 justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                <Button variant="outline" className="h-12 justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Account Created
                    </p>
                    <p className="text-xs text-gray-600">
                      Your account was successfully created and verified on{" "}
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email Verified
                    </p>
                    <p className="text-xs text-gray-600">
                      Your email address has been successfully verified
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
