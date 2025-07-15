"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Clock,
  ChevronDown,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  User,
  Loader2,
} from "lucide-react";

// Define custom user type
interface CustomUser {
  id: string;
  name: string;
  role: string;
  department: string;
}

// Define attendance record interface
interface AttendanceRecord {
  hrStatus: string;
  id: string;
  name: string;
  department: string;
  status: string;
  selfieCheckIn: string;
  addressCheckIn: string;
  timestampCheckIn: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  selfieCheckOut: string;
  addressCheckOut: string;
  timestampCheckOut: string;
}

// Define daily stats interface for admin day-wise report
interface DailyStat {
  date: string;
  present: number;
  late: number;
  absent: number;
  halfDay: number;
}

// Define monthly stats interface
interface MonthlyStat {
  presentDays: number;
  lateDays: number;
  absentDays: number;
  halfDays: number;
  totalDays: number;
}

// Mock user data (replace with actual user data source)
const user: CustomUser = {
  id: "123",
  name: "John Doe",
  role: "Admin", // or "Employee"
  department: "IT",
};

export default function AttendancePage() {
  // State for dropdown filters for each column (for admin only)
  const [filters, setFilters] = useState({
    employeeId: "",
    name: "",
    department: "",
    date: "",
    status: "",
    hrStatus: "",
    checkIn: "",
    checkOut: "",
    workHours: "",
    selfieCheckIn: "",
    selfieCheckOut: "",
    addressCheckIn: "",
    addressCheckOut: "",
  });

  // State to manage dropdown visibility
  const [dropdownVisibility, setDropdownVisibility] = useState({
    employeeId: false,
    name: false,
    department: false,
    date: false,
    status: false,
    hrStatus: false,
    checkIn: false,
    checkOut: false,
    workHours: false,
    selfieCheckIn: false,
    selfieCheckOut: false,
    addressCheckIn: false,
    addressCheckOut: false,
  });

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentAction, setCurrentAction] = useState<"check-in" | "check-out">(
    "check-in"
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [address, setAddress] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [searchUser, setSearchUser] = useState<string>("");
  const [selectedUserMonthlyStats, setSelectedUserMonthlyStats] =
    useState<MonthlyStat | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Monthly report state for non-admins
  const [monthlyStats, setMonthlyStats] = useState({
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    halfDays: 0,
    totalDays: 0,
  });

  // Daily report state for admins (only for today)
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);

  // Derive unique users from attendanceData
  const users = Array.from(
    new Map(
      attendanceData.map((record) => [
        record.id,
        { id: record.id, name: record.name },
      ])
    ).values()
  );

  // Derive unique values for dropdown filters
  const uniqueValues = {
    employeeId: Array.from(new Set(attendanceData.map((record) => record.id))),
    name: Array.from(new Set(attendanceData.map((record) => record.name))),
    department: Array.from(
      new Set(attendanceData.map((record) => record.department))
    ),
    date: Array.from(
      new Set(
        attendanceData.map((record) =>
          new Date(record.timestampCheckIn).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        )
      )
    ),
    status: Array.from(new Set(attendanceData.map((record) => record.status))),
    hrStatus: Array.from(
      new Set(attendanceData.map((record) => record.hrStatus || "N/A"))
    ),
    checkIn: Array.from(
      new Set(attendanceData.map((record) => record.checkIn))
    ).filter((v) => v),
    checkOut: Array.from(
      new Set(attendanceData.map((record) => record.checkOut))
    ).filter((v) => v),
    workHours: Array.from(
      new Set(attendanceData.map((record) => record.workHours))
    ).filter((v) => v),
    selfieCheckIn: ["Present", "Not Present"],
    selfieCheckOut: ["Present", "Not Present"],
    addressCheckIn: Array.from(
      new Set(attendanceData.map((record) => record.addressCheckIn || ""))
    ).filter((v) => v),
    addressCheckOut: Array.from(
      new Set(attendanceData.map((record) => record.addressCheckOut || ""))
    ).filter((v) => v),
  };

  // Fetch attendance data
  useEffect(() => {
    if (user.id) {
      fetchAttendanceData();
    }
  }, [user.id]);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(
        `/api/hrAttendance/fetch-attendance-data?employeeId=${encodeURIComponent(
          user.id
        )}`
      );
      const data = await response.json();
      if (response.ok) {
        const userRecords =
          user.role === "Admin"
            ? data.records
            : (data.records || []).filter(
                (record: AttendanceRecord) => record.id === user.id
              );
        setAttendanceData(userRecords);
        if (user.role === "Admin") {
          calculateDailyStats(userRecords);
          if (searchUser) {
            calculateSelectedUserMonthlyStats(userRecords, searchUser);
          }
        } else {
          calculateMonthlyStats(userRecords);
        }
      } else {
        console.error("Failed to fetch attendance data:", data.error);
        setAttendanceData([]);
        setDailyStats([]);
        setMonthlyStats({
          presentDays: 0,
          lateDays: 0,
          absentDays: 0,
          halfDays: 0,
          totalDays: 0,
        });
        setSelectedUserMonthlyStats(null);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceData([]);
      setDailyStats([]);
      setMonthlyStats({
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        halfDays: 0,
        totalDays: 0,
      });
      setSelectedUserMonthlyStats(null);
    }
  };

  // Calculate monthly statistics for non-admin users or selected user based on hrStatus
  const calculateMonthlyStats = (
    records: AttendanceRecord[],
    userId?: string
  ) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDate = today.getDate();

    const monthlyRecords = records.filter((record) => {
      const recordDate = new Date(record.timestampCheckIn);
      return (
        !isNaN(recordDate.getTime()) &&
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear &&
        (!userId || record.id === userId)
      );
    });

    const recordedPresentDays = monthlyRecords.filter(
      (record) => record.hrStatus?.trim().toLowerCase() === "present"
    ).length;
    const lateDays = monthlyRecords.filter(
      (record) =>
        record.hrStatus?.trim().toLowerCase() === "late" ||
        record.hrStatus?.trim().toLowerCase() === "half day late"
    ).length;
    const halfDays = monthlyRecords.filter(
      (record) => record.hrStatus?.trim().toLowerCase() === "half day"
    ).length;

    // Calculate total working days up to current date, including Sundays
    const firstDay = new Date(currentYear, currentMonth, 1);
    let totalDaysUpToToday = 0;
    let sundayCount = 0;

    for (
      let d = new Date(firstDay);
      d <= today && d.getDate() <= currentDate;
      d.setDate(d.getDate() + 1)
    ) {
      totalDaysUpToToday++;
      if (d.getDay() === 0) {
        sundayCount++;
      }
    }

    const totalWorkingDays = totalDaysUpToToday - sundayCount;
    const presentDays = recordedPresentDays + sundayCount;
    const absentDays =
      totalWorkingDays - recordedPresentDays - lateDays - halfDays;

    const stats = {
      presentDays,
      lateDays,
      absentDays,
      halfDays,
      totalDays: totalWorkingDays,
    };

    if (userId) {
      setSelectedUserMonthlyStats(stats);
    } else {
      setMonthlyStats(stats);
    }
  };

  // Calculate daily statistics for admin users based on hrStatus for today only
  const calculateDailyStats = (records: AttendanceRecord[]) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const dateDisplay = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const dailyStat: DailyStat = {
      date: dateDisplay,
      present: 0,
      late: 0,
      absent: 0,
      halfDay: 0,
    };

    const todayRecords = records.filter((record) => {
      const recordDate = new Date(record.timestampCheckIn);
      return (
        !isNaN(recordDate.getTime()) &&
        recordDate.toISOString().split("T")[0] === todayStr
      );
    });

    todayRecords.forEach((record) => {
      const hrStatus = record.hrStatus?.trim().toLowerCase();
      if (hrStatus === "present") {
        dailyStat.present += 1;
      } else if (hrStatus === "late" || hrStatus === "half day late") {
        dailyStat.late += 1;
      } else if (hrStatus === "absent") {
        dailyStat.absent += 1;
      } else if (hrStatus === "half day") {
        dailyStat.halfDay += 1;
      }
    });

    setDailyStats([dailyStat]);
  };

  // Calculate monthly stats for a selected user
  const calculateSelectedUserMonthlyStats = (
    records: AttendanceRecord[],
    userId: string
  ) => {
    calculateMonthlyStats(records, userId);
  };

  // Update HR status for a record
  const updateHrStatus = async (
    record: AttendanceRecord,
    newHrStatus: string
  ) => {
    try {
      const response = await fetch("/api/hrAttendance/update-hr-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: record.id,
          timestampCheckIn: record.timestampCheckIn,
          hrStatus: newHrStatus,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setAttendanceData((prev) =>
          prev.map((r) =>
            r.id === record.id && r.timestampCheckIn === record.timestampCheckIn
              ? { ...r, hrStatus: newHrStatus }
              : r
          )
        );
        if (user.role === "Admin") {
          calculateDailyStats(
            attendanceData.map((r) =>
              r.id === record.id &&
              r.timestampCheckIn === record.timestampCheckIn
                ? { ...r, hrStatus: newHrStatus }
                : r
            )
          );
          if (searchUser) {
            calculateSelectedUserMonthlyStats(
              attendanceData.map((r) =>
                r.id === record.id &&
                r.timestampCheckIn === record.timestampCheckIn
                  ? { ...r, hrStatus: newHrStatus }
                  : r
              ),
              searchUser
            );
          }
        } else {
          calculateMonthlyStats(
            attendanceData.map((r) =>
              r.id === record.id &&
              r.timestampCheckIn === record.timestampCheckIn
                ? { ...r, hrStatus: newHrStatus }
                : r
            )
          );
        }
        alert("HR Status updated successfully");
      } else {
        console.error("Failed to update HR status:", result.error);
        alert("Failed to update HR status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating HR status:", error);
      alert("An error occurred while updating HR status.");
    }
  };

  // Start camera when dialog opens
  useEffect(() => {
    if (isAttendanceModalOpen) {
      startCamera();
    }
  }, [isAttendanceModalOpen]);

  // Check if user has checked in today
  const hasCheckedInToday = () => {
    const today = new Date().toISOString().split("T")[0];
    return attendanceData.some(
      (record) =>
        record.id === user.id &&
        record.timestampCheckIn.startsWith(today) &&
        record.checkIn
    );
  };

  // Handle filter changes for admin
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === "name" && value) {
      const selectedUser = users.find((u) => u.name === value);
      if (selectedUser) {
        setSearchUser(selectedUser.id);
        calculateSelectedUserMonthlyStats(attendanceData, selectedUser.id);
      } else {
        setSearchUser("");
        setSelectedUserMonthlyStats(null);
      }
    } else if (key === "name" && !value) {
      setSearchUser("");
      setSelectedUserMonthlyStats(null);
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = (key: keyof typeof dropdownVisibility) => {
    setDropdownVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Apply filters to attendance data for admin
  const filteredAttendance =
    user.role === "Admin"
      ? searchUser
        ? attendanceData.filter(
            (record) =>
              record.id.toLowerCase().includes(searchUser.toLowerCase()) ||
              record.name.toLowerCase().includes(searchUser.toLowerCase())
          )
        : attendanceData.filter((record) =>
            Object.entries(filters).every(([key, value]) => {
              if (!value) return true;
              const recordValue =
                key === "date"
                  ? new Date(record.timestampCheckIn).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : key === "selfieCheckIn"
                  ? record.selfieCheckIn
                    ? "Present"
                    : "Not Present"
                  : key === "selfieCheckOut"
                  ? record.selfieCheckOut
                    ? "Present"
                    : "Not Present"
                  : key === "addressCheckIn" || key === "addressCheckOut"
                  ? record[key] || ""
                  : key === "name"
                  ? record.name === value
                  : (record as any)[key];
              return key === "name"
                ? recordValue
                : recordValue?.toString() === value;
            })
          )
      : attendanceData.filter((record) => record.id === user.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 hover:bg-green-100 text-green-800";
      case "Late":
        return "bg-yellow-100 hover:bg-yellow-100 text-yellow-800";
      case "Absent":
        return "bg-red-100 hover:bg-red-100 text-red-800";
      case "Half Day":
      case "Half Day Late":
        return "bg-blue-100 hover:bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 hover:bg-gray-100 text-gray-800";
    }
  };

  const getHrStatusColor = (hrStatus: string) => {
    switch (hrStatus) {
      case "Present":
        return "bg-green-100 hover:bg-green-100 text-green-800";
      case "Absent":
        return "bg-red-100 hover:bg-red-100 text-red-800";
      case "Half Day":
        return "bg-blue-100 hover:bg-blue-100 text-blue-800";
      case "Late":
        return "bg-yellow-100 hover:bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 hover:bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Late":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "Absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "Half Day":
      case "Half Day Late":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getHrStatusIcon = (hrStatus: string) => {
    switch (hrStatus) {
      case "Present":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "Half Day":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "Late":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    return new Promise<void>((resolve) => {
      setIsGettingLocation(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });
            const mockAddress = `${latitude.toFixed(4)}° N, ${longitude.toFixed(
              4
            )}° E`;
            setAddress(mockAddress);
            setIsGettingLocation(false);
            resolve();
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocation(null);
            setAddress("Location not provided");
            setIsGettingLocation(false);
            resolve();
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      } else {
        setLocation(null);
        setAddress("Geolocation not supported");
        setIsGettingLocation(false);
        resolve();
      }
    });
  }, []);

  const capturePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      await getCurrentLocation();

      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);

        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        setCurrentStep(2);
        setIsCapturing(false);
      }
    }
  }, [getCurrentLocation]);

  const calculateAttendanceStatus = (checkInTime: Date): string => {
    const hours = checkInTime.getHours();
    const minutes = checkInTime.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    const fullTimeStart = 9 * 60 + 30; // 9:30 AM
    const fullTimeEnd = 9 * 60 + 45; // 9:45 AM
    const halfDayEnd = 13 * 60 + 30; // 1:30 PM
    const halfDayLateEnd = 13 * 60 + 45; // 1:45 PM

    if (timeInMinutes <= fullTimeEnd) {
      return "Present";
    } else if (timeInMinutes <= halfDayEnd) {
      return "Half Day";
    } else if (timeInMinutes <= halfDayLateEnd) {
      return "Late";
    } else {
      return "Absent";
    }
  };

  const submitAttendance = async () => {
    if (!user) {
      alert("User not authenticated.");
      return;
    }
    setIsSubmitting(true);
    try {
      const currentTime = new Date();
      const timeString = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateString = currentTime.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const timestamp = currentTime.toISOString();
      const attendanceStatus =
        currentAction === "check-in"
          ? calculateAttendanceStatus(currentTime)
          : "Present";
      const hrStatus = attendanceStatus;

      const employeeData = {
        employeeId: user.id,
        name: user.name,
        department: user.department,
        selfie: capturedImage,
        address: address || "Location not provided",
        time: timeString,
        date: dateString,
        timestamp: timestamp,
        action: currentAction,
        status: attendanceStatus,
        hrStatus: hrStatus,
      };

      const response = await fetch("/api/hrAttendance/add-attendance-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setCapturedImage(result.imageUrl);

        if (currentAction === "check-in") {
          setAttendanceData((prev) => [
            ...prev,
            {
              hrStatus: hrStatus,
              id: employeeData.employeeId,
              name: employeeData.name,
              department: employeeData.department,
              status: attendanceStatus,
              selfieCheckIn: result.imageUrl,
              addressCheckIn: employeeData.address,
              timestampCheckIn: timestamp,
              checkIn: timeString,
              checkOut: "",
              workHours: "",
              selfieCheckOut: "",
              addressCheckOut: "",
              timestampCheckOut: "",
            },
          ]);
        } else {
          const today = currentTime.toISOString().split("T")[0];
          setAttendanceData((prev) =>
            prev.map((record) =>
              record.id === user.id && record.timestampCheckIn.startsWith(today)
                ? {
                    ...record,
                    checkOut: timeString,
                    workHours: result.workHours || "",
                    selfieCheckOut: result.imageUrl,
                    addressCheckOut: employeeData.address,
                    timestampCheckOut: timestamp,
                    hrStatus: hrStatus,
                  }
                : record
            )
          );
        }

        await fetchAttendanceData();
        setIsAttendanceModalOpen(false);
        resetAttendanceForm();
      } else {
        alert(
          result.error || `Failed to submit ${currentAction}. Please try again.`
        );
      }
    } catch (error) {
      console.error(`Error submitting ${currentAction}:`, error);
      alert(`An error occurred while submitting ${currentAction}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAttendanceForm = () => {
    setCurrentStep(1);
    setCapturedImage(null);
    setLocation(null);
    setAddress("");
    setIsCapturing(false);
    setIsGettingLocation(false);
    setCurrentAction("check-in");
  };

  const handleMarkAttendance = (action: "check-in" | "check-out") => {
    setCurrentAction(action);
    setIsAttendanceModalOpen(true);
  };

  if (!user.id) {
    return <div>Please sign in to access your attendance records.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Attendance</h1>
        <div className="flex gap-2">
          <Dialog
            open={isAttendanceModalOpen}
            onOpenChange={setIsAttendanceModalOpen}
          >
            <DialogTrigger asChild>
              <div className="flex gap-2">
                <Button onClick={() => handleMarkAttendance("check-in")}>
                  <Clock className="h-4 w-4 mr-2" />
                  Check In
                </Button>
                <Button
                  onClick={() => handleMarkAttendance("check-out")}
                  disabled={!hasCheckedInToday()}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Check Out
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {currentAction === "check-in" ? "Check In" : "Check Out"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center gap-2 ${
                      currentStep >= 1 ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep >= 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      1
                    </div>
                    <span className="text-sm font-medium">Take Selfie</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      currentStep >= 2 ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep >= 2
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      2
                    </div>
                    <span className="text-sm font-medium">Confirm</span>
                  </div>
                </div>

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        Take Your Selfie
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Position your face in the center of the frame
                      </p>
                    </div>

                    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 border-2 border-white rounded-full opacity-50"></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={capturePhoto}
                        className="flex-1"
                        disabled={isCapturing || isGettingLocation}
                      >
                        {isCapturing || isGettingLocation ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4 mr-2" />
                        )}
                        Capture Photo
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        Confirm Your Details
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Please review your information before submitting
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Your Selfie</Label>
                        {capturedImage && (
                          <Image
                            src={capturedImage}
                            alt="Captured selfie"
                            width={384}
                            height={128}
                            className="w-full h-32 rounded-lg object-cover border"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Location Details</Label>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                          {location ? (
                            <>
                              <p>
                                <strong>Coordinates:</strong>{" "}
                                {location.lat.toFixed(6)},{" "}
                                {location.lng.toFixed(6)}
                              </p>
                              <p>
                                <strong>Address:</strong> {address}
                              </p>
                              <p>
                                <strong>Date and Time:</strong>{" "}
                                {new Date().toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </>
                          ) : (
                            <p>
                              <strong>Location:</strong> Not provided
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentStep(1);
                          startCamera();
                        }}
                        className="flex-1"
                      >
                        Retake
                      </Button>
                      <Button
                        onClick={submitAttendance}
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          `Submit ${
                            currentAction === "check-in"
                              ? "Check In"
                              : "Check Out"
                          }`
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Report Card */}
      {user.role === "Admin" ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {searchUser && selectedUserMonthlyStats
                ? `Monthly Attendance Report for ${
                    users.find(
                      (u) =>
                        u.id.toLowerCase().includes(searchUser.toLowerCase()) ||
                        u.name.toLowerCase().includes(searchUser.toLowerCase())
                    )?.name || "Selected User"
                  } - ${new Date().toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}`
                : `Today's Attendance Report - ${new Date().toLocaleString(
                    "default",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchUser && selectedUserMonthlyStats ? (
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Present
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {selectedUserMonthlyStats.presentDays}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Days present this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Late</CardTitle>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedUserMonthlyStats.lateDays}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Days late this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Absent
                    </CardTitle>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {selectedUserMonthlyStats.absentDays}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Days absent this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Half Days
                    </CardTitle>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedUserMonthlyStats.halfDays}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Half days this month
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Present
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          Late
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Absent
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          Half Day
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyStats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No attendance records found for today
                        </TableCell>
                      </TableRow>
                    ) : (
                      dailyStats.map((stat) => (
                        <TableRow key={stat.date}>
                          <TableCell>{stat.date}</TableCell>
                          <TableCell>
                            <span className="text-green-600 font-bold">
                              {stat.present}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-yellow-600 font-bold">
                              {stat.late}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-red-600 font-bold">
                              {stat.absent}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-blue-600 font-bold">
                              {stat.halfDay}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Monthly Attendance Report -{" "}
              {new Date().toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {monthlyStats.presentDays}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Days present this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Late</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {monthlyStats.lateDays}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Days late this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {monthlyStats.absentDays}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Days absent this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Half Days
                  </CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {monthlyStats.halfDays}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Half days this month
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {user.role === "Admin"
              ? "All Attendance Records"
              : "My Attendance Records"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            {user.role === "Admin" && (
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by user ID or name..."
                  value={searchUser}
                  onChange={(e) => {
                    setSearchUser(e.target.value);
                    if (e.target.value) {
                      const matchedUser = users.find(
                        (u) =>
                          u.id
                            .toLowerCase()
                            .includes(e.target.value.toLowerCase()) ||
                          u.name
                            .toLowerCase()
                            .includes(e.target.value.toLowerCase())
                      );
                      if (matchedUser) {
                        setFilters((prev) => ({
                          ...prev,
                          name: matchedUser.name,
                        }));
                        calculateSelectedUserMonthlyStats(
                          attendanceData,
                          matchedUser.id
                        );
                      } else {
                        setSelectedUserMonthlyStats(null);
                        setFilters((prev) => ({ ...prev, name: "" }));
                      }
                    } else {
                      setSelectedUserMonthlyStats(null);
                      setFilters((prev) => ({ ...prev, name: "" }));
                    }
                  }}
                  className="border rounded-md p-2 text-sm w-full"
                />
              </div>
            )}
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {user.role === "Admin" ? (
                    <>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span>Employee ID</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown("employeeId")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {dropdownVisibility.employeeId && (
                          <select
                            value={filters.employeeId}
                            onChange={(e) =>
                              handleFilterChange("employeeId", e.target.value)
                            }
                            className="border rounded-md p-1 text-sm bg-white mt-1 w-full"
                          >
                            <option value="">All IDs</option>
                            {uniqueValues.employeeId.map((id) => (
                              <option key={id} value={id}>
                                {id}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span>Name</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown("name")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {dropdownVisibility.name && (
                          <select
                            value={filters.name}
                            onChange={(e) =>
                              handleFilterChange("name", e.target.value)
                            }
                            className="border rounded-md p-1 text-sm bg-white mt-1 w-full"
                          >
                            <option value="">All Names</option>
                            {uniqueValues.name.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span>Department</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown("department")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {dropdownVisibility.department && (
                          <select
                            value={filters.department}
                            onChange={(e) =>
                              handleFilterChange("department", e.target.value)
                            }
                            className="border rounded-md p-1 text-sm bg-white mt-1 w-full"
                          >
                            <option value="">All Departments</option>
                            {uniqueValues.department.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span>Date</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown("date")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {dropdownVisibility.date && (
                          <select
                            value={filters.date}
                            onChange={(e) =>
                              handleFilterChange("date", e.target.value)
                            }
                            className="border rounded-md p-1 text-sm bg-white mt-1 w-full"
                          >
                            <option value="">All Dates</option>
                            {uniqueValues.date.map((date) => (
                              <option key={date} value={date}>
                                {date}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span>Selfie (Check In)</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown("selfieCheckIn")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {dropdownVisibility.selfieCheckIn && (
                          <select
                            value={filters.selfieCheckIn}
                            onChange={(e) =>
                              handleFilterChange(
                                "selfieCheckIn",
                                e.target.value
                              )
                            }
                            className="border rounded-md p-1 text-sm bg-white mt-1 w-full"
                          >
                            <option value="">All</option>
                            {uniqueValues.selfieCheckIn.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span>Address (Check In)</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown("addressCheckIn")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {dropdownVisibility.addressCheckIn && (
                          <select
                            value={filters.addressCheckIn}
                            onChange={(e) =>
                              handleFilterChange(
                                "addressCheckIn",
                                e.target.value
                              )
                            }
                            className="border rounded-md p-1 text-sm bg-white mt-1 w-full"
                          >
                            <option value="">All Addresses</option>
                            {uniqueValues.addressCheckIn.map((address) => (
                              <option key={address} value={address}>
                                {address || "No Address"}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span>Status</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown("status")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {dropdownVisibility.status && (
                          <select
                            value={filters.status}
                            onChange={(e) =>
                              handleFilterChange("status", e.target.value)
                            }
                            className="border rounded-md p-1 text-sm bg-white mt-1 w-full"
                          >
                            <option value="">All Statuses</option>
                            {uniqueValues.status.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span>HR Status</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown("hrStatus")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {dropdownVisibility.hrStatus && (
                          <select
                            value={filters.hrStatus}
                            onChange={(e) =>
                              handleFilterChange("hrStatus", e.target.value)
                            }
                            className="border rounded-md p-1 text-sm bg-white mt-1 w-full"
                          >
                            <option value="">All HR Statuses</option>
                            {uniqueValues.hrStatus.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span>Check In</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown("checkIn")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {dropdownVisibility.checkIn && (
                          <select
                            value={filters.checkIn}
                            onChange={(e) =>
                              handleFilterChange("checkIn", e.target.value)
                            }
                            className="border rounded-md p-1 text-sm bg-white mt-1 w-full"
                          >
                            <option value="">All Times</option>
                            {uniqueValues.checkIn.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span>Check Out</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown("checkOut")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {dropdownVisibility.checkOut && (
                          <select
                            value={filters.checkOut}
                            onChange={(e) =>
                              handleFilterChange("checkOut", e.target.value)
                            }
                            className="border rounded-md p-1 text-sm bg-white mt-1 w-full"
                          >
                            <option value="">All Times</option>
                            {uniqueValues.checkOut.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span>Work Hours</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown("workHours")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {dropdownVisibility.workHours && (
                          <select
                            value={filters.workHours}
                            onChange={(e) =>
                              handleFilterChange("workHours", e.target.value)
                            }
                            className="border rounded-md p-1 text-sm bg-white mt-1 w-full"
                          >
                            <option value="">All Work Hours</option>
                            {uniqueValues.workHours.map((hours) => (
                              <option key={hours} value={hours}>
                                {hours}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span>Selfie (Check Out)</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown("selfieCheckOut")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {dropdownVisibility.selfieCheckOut && (
                          <select
                            value={filters.selfieCheckOut}
                            onChange={(e) =>
                              handleFilterChange(
                                "selfieCheckOut",
                                e.target.value
                              )
                            }
                            className="border rounded-md p-1 text-sm bg-white mt-1 w-full"
                          >
                            <option value="">All</option>
                            {uniqueValues.selfieCheckOut.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span>Address (Check Out)</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDropdown("addressCheckOut")}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {dropdownVisibility.addressCheckOut && (
                          <select
                            value={filters.addressCheckOut}
                            onChange={(e) =>
                              handleFilterChange(
                                "addressCheckOut",
                                e.target.value
                              )
                            }
                            className="border rounded-md p-1 text-sm bg-white mt-1 w-full"
                          >
                            <option value="">All Addresses</option>
                            {uniqueValues.addressCheckOut.map((address) => (
                              <option key={address} value={address}>
                                {address || "No Address"}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Date</TableHead>
                      <TableHead>Selfie (Check In)</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>HR Status</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Work Hours</TableHead>
                      <TableHead>Selfie (Check Out)</TableHead>
                      <TableHead>Address (Check Out)</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={user.role === "Admin" ? 13 : 10}
                      className="text-center"
                    >
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttendance.map((record) => (
                    <TableRow key={record.id + record.timestampCheckIn}>
                      {user.role === "Admin" && (
                        <>
                          <TableCell>{record.id}</TableCell>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>{record.department}</TableCell>
                        </>
                      )}
                      <TableCell>
                        {new Date(record.timestampCheckIn).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        {record.selfieCheckIn ? (
                          <Image
                            src={record.selfieCheckIn}
                            alt="Check-in Selfie"
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border-2 border-green-50"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <Camera className="h-4 w-4 mr-2 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-48 text-xs text-gray-600 truncate">
                          {record.addressCheckIn || "No check-in address"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.role === "Admin" ? (
                          <select
                            value={record.hrStatus || "N/A"}
                            onChange={(e) =>
                              updateHrStatus(record, e.target.value)
                            }
                            className="border rounded-md p-1 text-sm bg-white"
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Half Day">Half Day</option>
                            <option value="Late">Late</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            {getHrStatusIcon(record.hrStatus)}
                            <Badge
                              className={getHrStatusColor(record.hrStatus)}
                            >
                              {record.hrStatus}
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{record.checkIn}</TableCell>
                      <TableCell>{record.checkOut}</TableCell>
                      <TableCell>{record.workHours}</TableCell>
                      <TableCell>
                        {record.selfieCheckOut ? (
                          <Image
                            src={record.selfieCheckOut}
                            alt="Check-out Selfie"
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                          />
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-48 text-xs text-gray-600 truncate">
                          {record.addressCheckOut || "No check-out address"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}