import { NextResponse } from "next/server";
import { google } from "googleapis";
import * as dotenv from "dotenv";

dotenv.config();

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: "erp-system@erp-464612.iam.gserviceaccount.com",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDN3QlLuyQU7JH/\ngP1e3zWmCnixSW9MPIZIwJ34sNwFuBLrJMYOsGE5cZrUUuP6jN55vw1jOzcStMlz\nnDCQFVLMtAF7ddRqKmPk99HhMGWEf3xY1c8Uz3LXujdkWQ7GQphLRsexr7FlJ+4f\nDYQsPh84Mbo2i7jMpJUAKzi3xHJKFfMD8trvUFLa3OS5MaOQsF4FJDvpnz4xBfJn\nI0cYI6iBSvcRrlRW9HyFy8r0mYSoU7X64gNgUtHKPdXuGNUhEVNn+rkGP6ZypwC0\n3cj6BrTZvl1sMEBapX08WwR79MhtkAiNq1XlJUQGhoqfozhAd72TW8bohBxmaqtL\nQX9iZ0JDAgMBAAECggEAVdJbsTwrzyNOvEdQmZARZA7CgRpdsVkcHFFcqhRFLYcv\nL+NtRCto5NNFGlYSH95BU10AHknN7Fj9ENrg7fhNw/QZGBinvLi+W3KrByevcrzZ\nIInGImVXebLyq71q6OFTbzJrRtq5aDPs0/pFC1K8nicw+9Nk779/NIpQQ2A8y0A6\nDZK9UdilP9XzYQVC54H9tV2H5dvT9KNhsKfAK/llIOywCOamZeH8VlTHka3GZGSq\nftWFEN+emYaRJGIE4YY7fHLRQE7KUbumiSDQxtRqP5RYgySef1NiMm0tMqzXtPp2\nQkq0dfvvt2RTqbkcJlRPlU64ekZb3VEYTHzOi+p88QKBgQD7vqz4rwT94oM+c3Os\nlpAEeYm83d74ieTdDf7IedGiXqQ5Invebo6cTh/s+DIckDVBrFNcTaO0sHj9gAU8\na6awsFtu5uqQ0o5UTzK5QJVLQ3MvHxRPXlCHZJiWemoA3N2Z5Jey3l7L7AtgRPng\n1TZns+LQd+HpykBCGWsQBf7u0QKBgQDRV9PNLDg1AAp/9r0DsIM83+9lAgl7Hizr\nUH/WuyCoWoac5mDX8K/NaLn3EJ3FKfkILZgAA18yrZ6vVYMGlG7zSsh/HNztoTPK\nx/lZEOUw5jCk+KIsYc3vXYQh+Hi+WzUQuYfV3HPNHkVVtVAUiYBsgnDFS3qOlo2w\nT8AFmJSs0wKBgBe2TRqbea/kTxJp04J1KBmTzRqCF4d3jZwYvl/pwYo2uec7zUkV\nRs+IOE+czTONjcai0bNHCN1zJeJS1atsRGYuJl6a14tOmeNtFk0GvUk6kDXnCoWz\nT4iBPDIoU6XDKAhf1L4fXfR9RlEKDjNUQeygsAOM1zWrPEQ9mq0Gs42RAoGBAI/c\nSDwN8E5TyeNoPzpC2d1CkrQaM0O9V+cZ+dAp5mZrV2iJVPHwgA+rsWhcrd8pWe7J\nzlPr/UbJU2xwWktyQ9DDiob34ccXaY0n4W3Yk3gIKFOmXWQcjjW5US07IFbIPO5S\nYUuRZK8H52Pf5rlGSM/I0BB1LzK/uXz5QR9XXIxrAoGBAMx4lFpJQWO1lBbk5vz7\nND07b6/iWGvlmx2NYxkQSIkz28Gq+5cnVVVCUFTq+Q3k0fmJ70Dgvn3dp7EDDkgR\nt0O5FtPdH16MnTKLoudDjhWWG85cLLzg8eIe8MhzgaaBYMi4pBAxqueLMaTGQ1be\nhhSOPkUgyuFFE6csuxqCxtXj\n-----END PRIVATE KEY-----\n",
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// Helper function to capitalize specific fields
const capitalizeEmployeeData = (employeeData: any) => {
  return {
    ...employeeData,
    id: employeeData.id ? employeeData.id.toUpperCase() : "",
    bankName: employeeData.bankName ? employeeData.bankName.toUpperCase() : "",
    name: employeeData.name
      ? employeeData.name
          .toLowerCase()
          .replace(/(^|\s)\w/g, (letter: string) => letter.toUpperCase())
      : "",
    native: employeeData.native
      ? employeeData.native
          .toLowerCase()
          .replace(/(^|\s)\w/g, (letter: string) => letter.toUpperCase())
      : "",
    belongsCountry: employeeData.belongsCountry
      ? employeeData.belongsCountry
          .toLowerCase()
          .replace(/(^|\s)\w/g, (letter: string) => letter.toUpperCase())
      : "",
    designation: employeeData.designation
      ? employeeData.designation
          .toLowerCase()
          .replace(/(^|\s)\w/g, (letter: string) => letter.toUpperCase())
      : "",
    permanentAddress: employeeData.permanentAddress
      ? employeeData.permanentAddress
          .toLowerCase()
          .replace(/(^|\s)\w/g, (letter: string) => letter.toUpperCase())
      : "",
    currentAddress: employeeData.currentAddress
      ? employeeData.currentAddress
          .toLowerCase()
          .replace(/(^|\s)\w/g, (letter: string) => letter.toUpperCase())
      : "",
    companyName: employeeData.companyName
      ? employeeData.companyName
          .toLowerCase()
          .replace(/(^|\s)\w/g, (letter: string) => letter.toUpperCase())
      : "",
    companySim: employeeData.companySim
      ? employeeData.companySim
          .toLowerCase()
          .replace(/(^|\s)\w/g, (letter: string) => letter.toUpperCase())
      : "",
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeData } = body;

    if (!employeeData) {
      return NextResponse.json(
        { error: "Employee data is required" },
        { status: 400 }
      );
    }

    const spreadsheetId = "1KQpAYsoUnq5oS7G1fQ2pnrnsbWvaMfLDa8Gy91Ton_Y";
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "GOOGLE_SHEETS_ID is not defined" },
        { status: 500 }
      );
    }

    // Capitalize specific fields
    const capitalizedData = capitalizeEmployeeData(employeeData);

    const range = "EMPLOYEE LIST!A2:AN";

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            capitalizedData.id,
            capitalizedData.name,
            capitalizedData.sex,
            capitalizedData.department,
            capitalizedData.designation,
            capitalizedData.dob,
            capitalizedData.native,
            capitalizedData.belongsCountry,
            capitalizedData.permanentAddress,
            capitalizedData.currentAddress,
            capitalizedData.contact,
            capitalizedData.altNo1,
            capitalizedData.altNo2,
            capitalizedData.email1,
            capitalizedData.email2,
            capitalizedData.adharCardUpload,
            capitalizedData.adharCardNo,
            capitalizedData.panCardUpload,
            capitalizedData.passportUpload,
            capitalizedData.bankName,
            capitalizedData.bankAccountNo,
            capitalizedData.ifscCode,
            capitalizedData.status,
            capitalizedData.shiftType,
            capitalizedData.timeIn,
            capitalizedData.timeOut,
            capitalizedData.dateOfJoining,
            capitalizedData.dateOfLeaving,
            capitalizedData.incrementMonth,
            capitalizedData.yearsOfAgreement,
            capitalizedData.bonus,
            capitalizedData.companyName,
            capitalizedData.totalSalary,
            capitalizedData.givenSalary,
            capitalizedData.bonusAmount,
            capitalizedData.nightAllowance,
            capitalizedData.overTime,
            capitalizedData.extra1Hour,
            capitalizedData.companySim,
            "", // Deleted column (AO)
          ],
        ],
      },
    });

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error adding employee data:", error);
    return NextResponse.json(
      { error: "Failed to add employee data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const spreadsheetId = "1KQpAYsoUnq5oS7G1fQ2pnrnsbWvaMfLDa8Gy91Ton_Y";
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "GOOGLE_SHEETS_ID is not defined" },
        { status: 500 }
      );
    }

    const range = "EMPLOYEE LIST!A2:AN";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = response.data.values || [];
    // Filter out rows where the Deleted column (index 39, column AO) is "Deleted"
    const filteredValues = values.filter((row) => {
      const deletedStatus = row[39] || ""; // Handle undefined/null as empty string
      if (deletedStatus === "Deleted") {
        console.log(`Skipping deleted row for employee ID: ${row[0]}`); // Debug log
        return false;
      }
      return true;
    });

    return NextResponse.json({ values: filteredValues });
  } catch (error) {
    console.error("Error fetching employee data:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { employeeData } = body;

    if (!employeeData || !employeeData.id) {
      return NextResponse.json(
        { error: "Employee data and ID are required" },
        { status: 400 }
      );
    }

    const spreadsheetId = "1KQpAYsoUnq5oS7G1fQ2pnrnsbWvaMfLDa8Gy91Ton_Y";
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "GOOGLE_SHEETS_ID is not defined" },
        { status: 500 }
      );
    }

    const range = "EMPLOYEE LIST!A2:AN";
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = getResponse.data.values || [];
    const rowIndex = values.findIndex((row) => row[0] === employeeData.id);

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Capitalize specific fields
    const capitalizedData = capitalizeEmployeeData(employeeData);

    const updateRange = `EMPLOYEE LIST!A${rowIndex + 2}:AN${rowIndex + 2}`;

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            capitalizedData.id,
            capitalizedData.name,
            capitalizedData.sex,
            capitalizedData.department,
            capitalizedData.designation,
            capitalizedData.dob,
            capitalizedData.native,
            capitalizedData.belongsCountry,
            capitalizedData.permanentAddress,
            capitalizedData.currentAddress,
            capitalizedData.contact,
            capitalizedData.altNo1,
            capitalizedData.altNo2,
            capitalizedData.email1,
            capitalizedData.email2,
            capitalizedData.adharCardUpload,
            capitalizedData.adharCardNo,
            capitalizedData.panCardUpload,
            capitalizedData.passportUpload,
            capitalizedData.bankName,
            capitalizedData.bankAccountNo,
            capitalizedData.ifscCode,
            capitalizedData.status,
            capitalizedData.shiftType,
            capitalizedData.timeIn,
            capitalizedData.timeOut,
            capitalizedData.dateOfJoining,
            capitalizedData.dateOfLeaving,
            capitalizedData.incrementMonth,
            capitalizedData.yearsOfAgreement,
            capitalizedData.bonus,
            capitalizedData.companyName,
            capitalizedData.totalSalary,
            capitalizedData.givenSalary,
            capitalizedData.bonusAmount,
            capitalizedData.nightAllowance,
            capitalizedData.overTime,
            capitalizedData.extra1Hour,
            capitalizedData.companySim,
            "", // Deleted column (AO)
          ],
        ],
      },
    });

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error updating employee data:", error);
    return NextResponse.json(
      { error: "Failed to update employee data" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { employeeId } = body;

    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    const spreadsheetId = "1KQpAYsoUnq5oS7G1fQ2pnrnsbWvaMfLDa8Gy91Ton_Y";
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "GOOGLE_SHEETS_ID is not defined" },
        { status: 500 }
      );
    }

    const range = "EMPLOYEE LIST!A2:AN";
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = getResponse.data.values || [];
    const rowIndex = values.findIndex((row) => row[0] === employeeId);

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const updateRange = `EMPLOYEE LIST!AN${rowIndex + 2}`;

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: "RAW",
      requestBody: {
        values: [["Deleted"]],
      },
    });

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error deleting employee data:", error);
    return NextResponse.json(
      { error: "Failed to delete employee data" },
      { status: 500 }
    );
  }
}
