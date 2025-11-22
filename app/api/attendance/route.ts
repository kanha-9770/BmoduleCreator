import { NextRequest, NextResponse } from "next/server";
import { getToday } from "@/lib/attendance";
import { prisma } from "@/lib/prisma";

// Get attendance records
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    let records;

    if (date) {
      // Get record for specific date
      records = await prisma.attendance.findMany({
        where: {
          userId,
          date,
        },
      });
    } else if (startDate && endDate) {
      // Get records for date range
      records = await prisma.attendance.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "desc" },
      });
    } else {
      // Get all records for user
      records = await prisma.attendance.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 100, // Limit to last 100 records
      });
    }

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error: any) {
    console.error("[Attendance API] GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch records" },
      { status: 500 }
    );
  }
}

// Create or update attendance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: "userId and action are required" },
        { status: 400 }
      );
    }

    const today = getToday();
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

    let record;

    if (action === "checkin") {
      // Check if already checked in
      record = await prisma.attendance.findFirst({
        where: {
          userId,
          date: today,
        },
      });

      if (record?.checkedIn) {
        return NextResponse.json(
          { success: false, error: "Already checked in today" },
          { status: 400 }
        );
      }

      // Create or update attendance record
      if (record) {
        record = await prisma.attendance.update({
          where: { id: record.id },
          data: {
            checkedIn: true,
            checkInTime: currentTime,
          },
        });
      } else {
        record = await prisma.attendance.create({
          data: {
            userId,
            date: today,
            checkedIn: true,
            checkInTime: currentTime,
          },
        });
      }
    } else if (action === "checkout") {
      // Get today's record
      record = await prisma.attendance.findFirst({
        where: {
          userId,
          date: today,
        },
      });

      if (!record) {
        return NextResponse.json(
          { success: false, error: "No check-in record found for today" },
          { status: 400 }
        );
      }

      if (!record.checkedIn) {
        return NextResponse.json(
          { success: false, error: "Must check in first" },
          { status: 400 }
        );
      }

      if (record.checkedOut) {
        return NextResponse.json(
          { success: false, error: "Already checked out today" },
          { status: 400 }
        );
      }

      // Update record with check-out
      record = await prisma.attendance.update({
        where: { id: record.id },
        data: {
          checkedOut: true,
          checkOutTime: currentTime,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'checkin' or 'checkout'" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      record,
    });
  } catch (error: any) {
    console.error("[Attendance API] POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record attendance" },
      { status: 500 }
    );
  }
}
