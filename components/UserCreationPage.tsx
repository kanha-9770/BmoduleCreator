"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Plus,
  Eye,
  EyeOff,
  Search,
  Check,
  X,
  UserPlus,
} from "lucide-react";
interface EmployeeRecord {
  id: string;
  employee_id: string;
  recordData: any;
  submittedAt: string;
  parsedData: {
    companyName: string | undefined;
    employeeId?: string;
    employeeName?: string;
    email?: string;
    department?: string;
    designation?: string;
    phone?: string;
    status?: string;
  };
}

interface CreateUserData {
  employeeRecordId: string;
  employee_id: string;
  employeeName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const UserCreationPage: React.FC = () => {
  const [employeeRecords, setEmployeeRecords] = useState<EmployeeRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<EmployeeRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<EmployeeRecord | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<CreateUserData>({
    employeeRecordId: "",
    employee_id: "",
    employeeName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Fetch employee records from FormRecord15
  useEffect(() => {
    fetchEmployeeRecords();
  }, []);

  // Filter records based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRecords(employeeRecords);
    } else {
      const filtered = employeeRecords.filter((record) => {
        const employeeName = record.parsedData?.employeeName || "";
        const email = record.parsedData?.email || "";
        const employeeId = record.employee_id || "";

        return (
          employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredRecords(filtered);
    }
  }, [searchTerm, employeeRecords]);

  const fetchEmployeeRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/employee-records");
      if (response.ok) {
        const data = await response.json();
        setEmployeeRecords(data.records || []);
        console.log("Fetched employee records:", data.records);
      } else {
        setMessage({ type: "error", text: "Failed to fetch employee records" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error fetching employee records" });
    } finally {
      setLoading(false);
    }
  };

  const selectEmployee = (record: EmployeeRecord) => {
    setSelectedRecord(record);
    setFormData({
      employeeRecordId: record.id,
      employee_id: record.employee_id || "",
      employeeName: record.parsedData?.employeeName || "",
      email: record.parsedData?.email || "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (
      !formData.employee_id ||
      !formData.employeeName ||
      !formData.email ||
      !formData.password
    ) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return false;
    }

    if (formData.password.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters long",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return false;
    }

    return true;
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setCreatingUser(true);
    setMessage(null);

    try {
      const response = await fetch("/api/create-user-from-employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "User created successfully!" });
        // Reset form
        setFormData({
          employeeRecordId: "",
          employee_id: "",
          employeeName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setSelectedRecord(null);
        // Refresh the employee records
        fetchEmployeeRecords();
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to create user",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error creating user" });
    } finally {
      setCreatingUser(false);
    }
  };

  const clearSelection = () => {
    setSelectedRecord(null);
    setFormData({
      employeeRecordId: "",
      employee_id: "",
      employeeName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-blue-600" />
            Create User from Employee Records (Form Table 14)
          </h1>
          <p className="text-gray-600 mt-2">
            Select an employee from Form Table 14 and create their user account
            with secure authentication
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
              }`}
          >
            {message.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Employee Selection Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Select Employee Record
            </h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Records List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">
                    Loading employee records...
                  </p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "No records found matching your search"
                    : "No employee records available"}
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${selectedRecord?.id === record.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                    onClick={() => selectEmployee(record)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {record.parsedData?.employeeName ||
                            record.parsedData?.companyName ||
                            "N/A"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Employee ID:{" "}
                          {record.parsedData?.employeeId ||
                            record.employee_id ||
                            "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Email: {record.parsedData?.email || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Dept: {record.parsedData?.department || "N/A"} |{" "}
                          {record.parsedData?.designation || "N/A"}
                        </p>
                        {record.parsedData?.phone && (
                          <p className="text-sm text-gray-600">
                            Phone: {record.parsedData.phone}
                          </p>
                        )}
                        {record.parsedData?.status && (
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${record.parsedData.status.toLowerCase() ===
                              "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {record.parsedData.status}
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Record ID: {record.id}
                        </p>
                        {process.env.NODE_ENV === "development" &&
                          (record as any)._debug && (
                            <details className="mt-2">
                              <summary className="text-xs text-blue-600 cursor-pointer">
                                Debug Info
                              </summary>
                              <div className="text-xs text-gray-500 mt-1">
                                <p>
                                  Parsed Fields:{" "}
                                  {(record as any)._debug.parsedFields.join(
                                    ", "
                                  )}
                                </p>
                              </div>
                            </details>
                          )}
                      </div>
                      {selectedRecord?.id === record.id && (
                        <div className="ml-4">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* User Creation Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create User Account
              </h2>
              {selectedRecord && (
                <button
                  onClick={clearSelection}
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  title="Clear selection"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {!selectedRecord ? (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Please select an employee record to create a user account</p>
              </div>
            ) : (
              <form onSubmit={createUser} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Record ID
                    </label>
                    <input
                      type="text"
                      value={formData.employeeRecordId}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Account Details
                  </h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• User will be created with JWT authentication</p>
                    <p>• User will be created with ACTIVE status</p>
                    <p>• Email will be automatically verified</p>
                    <p>• User will be linked to the employee record</p>
                    <p>• Password will be securely hashed</p>
                    <p>• Session will be created with 7-day expiry</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creatingUser}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingUser ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating User...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create User Account
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCreationPage;
