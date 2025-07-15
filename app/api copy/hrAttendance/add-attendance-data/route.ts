import { google } from "googleapis";
import { NextResponse } from "next/server";
import ftp from "ftp";
import { Readable } from "stream";

function calculateWorkHours(checkIn: string, checkOut: string): string {
  const checkInTime = parseTime(checkIn);
  const checkOutTime = parseTime(checkOut);
  if (!checkInTime || !checkOutTime) return "";

  const diffMs = checkOutTime.getTime() - checkInTime.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function parseTime(timeStr: string): Date | null {
  const [time, period] = timeStr.split(" ");
  if (!time || !period) return null;

  let [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;

  if (period.toLowerCase() === "pm" && hours !== 12) hours += 12;
  if (period.toLowerCase() === "am" && hours === 12) hours = 0;

  const today = new Date();
  today.setHours(hours, minutes, 0, 0);
  return today;
}

export async function POST(request: Request) {
  try {
    const {
      employeeId,
      name,
      department,
      selfie,
      address = "",
      time,
      action,
      status,
      hrStatus = "Present",
    } = await request.json();

    if (!employeeId || !name || !selfie || !time || !action) {
      console.error("Missing required fields:", {
        employeeId,
        name,
        selfie,
        time,
        action,
      });
      return NextResponse.json(
        {
          error:
            "Missing required fields: employeeId, name, selfie, time, and action are required",
        },
        { status: 400 }
      );
    }

    if (!["check-in", "check-out"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action type" },
        { status: 400 }
      );
    }

    if (!selfie.startsWith("data:image/jpeg;base64,")) {
      console.error("Invalid base64 image format:", selfie.slice(0, 50));
      return NextResponse.json(
        { error: "Invalid image format. Must be JPEG base64." },
        { status: 400 }
      );
    }

    // Validate status for check-in
    if (
      action === "check-in" &&
      !["Present", "Half Day", "Half Day Late", "Absent"].includes(status)
    ) {
      console.error("Invalid status for check-in:", status);
      return NextResponse.json(
        {
          error:
            "Invalid status. Must be Present, Half Day, Half Day Late, or Absent",
        },
        { status: 400 }
      );
    }

    // Validate hrStatus
    if (!["Present", "Absent", "Half Day", "N/A"].includes(hrStatus)) {
      console.error("Invalid hrStatus:", hrStatus);
      return NextResponse.json(
        {
          error: "Invalid hrStatus. Must be Present, Absent, Half Day, or N/A",
        },
        { status: 400 }
      );
    }

    let imageUrl;
    try {
      imageUrl = await uploadImageToHostinger(selfie, employeeId);
    } catch (ftpError) {
      console.error("FTP upload error:", ftpError);
      return NextResponse.json(
        {
          error: `Failed to upload image: ${
            ftpError instanceof Error ? ftpError.message : String(ftpError)
          }`,
        },
        { status: 500 }
      );
    }

    const auth = new google.auth.JWT({
      email: "erp-system@erp-464612.iam.gserviceaccount.com",
      key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDN3QlLuyQU7JH/\ngP1e3zWmCnixSW9MPIZIwJ34sNwFuBLrJMYOsGE5cZrUUuP6jN55vw1jOzcStMlz\nnDCQFVLMtAF7ddRqKmPk99HhMGWEf3xY1c8Uz3LXujdkWQ7GQphLRsexr7FlJ+4f\nDYQsPh84Mbo2i7jMpJUAKzi3xHJKFfMD8trvUFLa3OS5MaOQsF4FJDvpnz4xBfJn\nI0cYI6iBSvcRrlRW9HyFy8r0mYSoU7X64gNgUtHKPdXuGNUhEVNn+rkGP6ZypwC0\n3cj6BrTZvl1sMEBapX08WwR79MhtkAiNq1XlJUQGhoqfozhAd72TW8bohBxmaqtL\nQX9iZ0JDAgMBAAECggEAVdJbsTwrzyNOvEdQmZARZA7CgRpdsVkcHFFcqhRFLYcv\nL+NtRCto5NNFGlYSH95BU10AHknN7Fj9ENrg7fhNw/QZGBinvLi+W3KrByevcrzZ\nIInGImVXebLyq71q6OFTbzJrRtq5aDPs0/pFC1K8nicw+9Nk779/NIpQQ2A8y0A6\nDZK9UdilP9XzYQVC54H9tV2H5dvT9KNhsKfAK/llIOywCOamZeH8VlTHka3GZGSq\nftWFEN+emYaRJGIE4YY7fHLRQE7KUbumiSDQxtRqP5RYgySef1NiMm0tMqzXtPp2\nQkq0dfvvt2RTqbkcJlRPlU64ekZb3VEYTHzOi+p88QKBgQD7vqz4rwT94oM+c3Os\nlpAEeYm83d74ieTdDf7IedGiXqQ5Invebo6cTh/s+DIckDVBrFNcTaO0sHj9gAU8\na6awsFtu5uqQ0o5UTzK5QJVLQ3MvHxRPXlCHZJiWemoA3N2Z5Jey3l7L7AtgRPng\n1TZns+LQd+HpykBCGWsQBf7u0QKBgQDRV9PNLDg1AAp/9r0DsIM83+9lAgl7Hizr\nUH/WuyCoWoac5mDX8K/NaLn3EJ3FKfkILZgAA18yrZ6vVYMGlG7zSsh/HNztoTPK\nx/lZEOUw5jCk+KIsYc3vXYQh+Hi+WzUQuYfV3HPNHkVVtVAUiYBsgnDFS3qOlo2w\nT8AFmJSs0wKBgBe2TRqbea/kTxJp04J1KBmTzRqCF4d3jZwYvl/pwYo2uec7zUkV\nRs+IOE+czTONjcai0bNHCN1zJeJS1atsRGYuJl6a14tOmeNtFk0GvUk6kDXnCoWz\nT4iBPDIoU6XDKAhf1L4fXfR9RlEKDjNUQeygsAOM1zWrPEQ9mq0Gs42RAoGBAI/c\nSDwN8E5TyeNoPzpC2d1CkrQaM0O9V+cZ+dAp5mZrV2iJVPHwgA+rsWhcrd8pWe7J\nzlPr/UbJU2xwWktyQ9DDiob34ccXaY0n4W3Yk3gIKFOmXWQcjjW5US07IFbIPO5S\nYUuRZK8H52Pf5rlGSM/I0BB1LzK/uXz5QR9XXIxrAoGBAMx4lFpJQWO1lBbk5vz7\nND07b6/iWGvlmx2NYxkQSIkz28Gq+5cnVVVCUFTq+Q3k0fmJ70Dgvn3dp7EDDkgR\nt0O5FtPdH16MnTKLoudDjhWWG85cLLzg8eIe8MhzgaaBYMi4pBAxqueLMaTGQ1be\nhhSOPkUgyuFFE6csuxqCxtXj\n-----END PRIVATE KEY-----\n",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1KQpAYsoUnq5oS7G1fQ2pnrnsbWvaMfLDa8Gy91Ton_Y";
    if (!spreadsheetId) {
      console.error("Missing GOOGLE_SHEETS_ID");
      return NextResponse.json(
        { error: "Server configuration error: Missing Google Sheets ID" },
        { status: 500 }
      );
    }

    const range = "ATTENDANCE!A:N";

    if (action === "check-in") {
      const today = new Date().toISOString().split("T")[0];
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      const rows = response.data.values || [];
      const existingRecord = rows
        .slice(1)
        .find((row) => row[0] === employeeId && row[6]?.startsWith(today));

      if (existingRecord && existingRecord[7]) {
        return NextResponse.json(
          { error: "You have already checked in today" },
          { status: 400 }
        );
      }

      const values = [
        [
          employeeId,
          name,
          department || "",
          status,
          imageUrl, // SELFIE (CHECK IN)
          address, // ADDRESS (CHECK IN)
          new Date().toISOString(), // TIME STAMP (CHECK IN)
          time, // CHECK IN
          "", // CHECK OUT
          "", // WORK HOURS
          "", // SELFIE (CHECK OUT)
          "", // ADDRESS (CHECK OUT)
          "", // TIME STAMP (CHECK OUT)
          hrStatus, // HR STATUS
        ],
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: { values },
      });

      return NextResponse.json(
        { message: "Check-in recorded successfully", imageUrl },
        { status: 200 }
      );
    } else {
      const today = new Date().toISOString().split("T")[0];
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      const rows = response.data.values || [];
      const rowIndex = rows
        .slice(1)
        .findIndex((row) => row[0] === employeeId && row[6]?.startsWith(today));

      if (rowIndex === -1) {
        return NextResponse.json(
          { error: "No check-in record found for today" },
          { status: 400 }
        );
      }

      const checkInTime = rows[rowIndex + 1][7];
      if (!checkInTime) {
        return NextResponse.json(
          { error: "No valid check-in time found" },
          { status: 400 }
        );
      }

      const workHours = calculateWorkHours(checkInTime, time);

      const updateRange = `ATTENDANCE!I${rowIndex + 2}:N${rowIndex + 2}`; // Updated to include hrStatus
      const values = [
        [
          time, // CHECK OUT
          workHours, // WORK HOURS
          imageUrl, // SELFIE (CHECK OUT)
          address, // ADDRESS (CHECK OUT)
          new Date().toISOString(), // TIME STAMP (CHECK OUT)
          hrStatus, // HR STATUS
        ],
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: updateRange,
        valueInputOption: "RAW",
        requestBody: { values },
      });

      return NextResponse.json(
        { message: "Check-out recorded successfully", imageUrl, workHours },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error adding attendance data:", error);
    let errorMessage = "Failed to add attendance data";
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

async function uploadImageToHostinger(
  base64Image: string,
  employeeId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = new ftp();

    // Extract base64 data
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const fileName = `selfie_${employeeId}_${Date.now()}.jpg`;
    const remotePath = `${process.env.FTP_UPLOAD_DIR}/${fileName}`; // Ensure trailing slash

    client.on("ready", () => {
      console.log("FTP connected successfully");
      const stream = Readable.from(buffer);
      client.put(stream, remotePath, (err) => {
        if (err) {
          client.end();
          console.error("FTP upload error:", err);
          return reject(new Error(`FTP upload failed: ${err.message}`));
        }
        client.end();
        const publicUrl = `${process.env.BASE_URL}/${fileName}`; // Ensure trailing slash
        console.log("Image uploaded:", publicUrl);
        resolve(publicUrl);
      });
    });

    client.on("error", (err) => {
      console.error("FTP connection error:", err);
      reject(new Error(`FTP connection failed: ${err.message}`));
    });

    // Connect to FTP server
    console.log("Connecting to FTP:", process.env.FTP_HOST);
    client.connect({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
    });
  });
}
