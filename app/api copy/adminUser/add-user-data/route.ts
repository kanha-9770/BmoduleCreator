import { google } from "googleapis";
import { NextResponse } from "next/server";

// Fetch users
export async function GET() {
  try {
    if (!process.env.GOOGLE_SHEETS_ID) {
      return NextResponse.json(
        { error: "GOOGLE_SHEETS_ID environment variable is not set" },
        { status: 500 }
      );
    }
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      return NextResponse.json(
        { error: "GOOGLE_CLIENT_EMAIL environment variable is not set" },
        { status: 500 }
      );
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_PRIVATE_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: "erp-system@erp-464612.iam.gserviceaccount.com",
        private_key:
          "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDN3QlLuyQU7JH/\ngP1e3zWmCnixSW9MPIZIwJ34sNwFuBLrJMYOsGE5cZrUUuP6jN55vw1jOzcStMlz\nnDCQFVLMtAF7ddRqKmPk99HhMGWEf3xY1c8Uz3LXujdkWQ7GQphLRsexr7FlJ+4f\nDYQsPh84Mbo2i7jMpJUAKzi3xHJKFfMD8trvUFLa3OS5MaOQsF4FJDvpnz4xBfJn\nI0cYI6iBSvcRrlRW9HyFy8r0mYSoU7X64gNgUtHKPdXuGNUhEVNn+rkGP6ZypwC0\n3cj6BrTZvl1sMEBapX08WwR79MhtkAiNq1XlJUQGhoqfozhAd72TW8bohBxmaqtL\nQX9iZ0JDAgMBAAECggEAVdJbsTwrzyNOvEdQmZARZA7CgRpdsVkcHFFcqhRFLYcv\nL+NtRCto5NNFGlYSH95BU10AHknN7Fj9ENrg7fhNw/QZGBinvLi+W3KrByevcrzZ\nIInGImVXebLyq71q6OFTbzJrRtq5aDPs0/pFC1K8nicw+9Nk779/NIpQQ2A8y0A6\nDZK9UdilP9XzYQVC54H9tV2H5dvT9KNhsKfAK/llIOywCOamZeH8VlTHka3GZGSq\nftWFEN+emYaRJGIE4YY7fHLRQE7KUbumiSDQxtRqP5RYgySef1NiMm0tMqzXtPp2\nQkq0dfvvt2RTqbkcJlRPlU64ekZb3VEYTHzOi+p88QKBgQD7vqz4rwT94oM+c3Os\nlpAEeYm83d74ieTdDf7IedGiXqQ5Invebo6cTh/s+DIckDVBrFNcTaO0sHj9gAU8\na6awsFtu5uqQ0o5UTzK5QJVLQ3MvHxRPXlCHZJiWemoA3N2Z5Jey3l7L7AtgRPng\n1TZns+LQd+HpykBCGWsQBf7u0QKBgQDRV9PNLDg1AAp/9r0DsIM83+9lAgl7Hizr\nUH/WuyCoWoac5mDX8K/NaLn3EJ3FKfkILZgAA18yrZ6vVYMGlG7zSsh/HNztoTPK\nx/lZEOUw5jCk+KIsYc3vXYQh+Hi+WzUQuYfV3HPNHkVVtVAUiYBsgnDFS3qOlo2w\nT8AFmJSs0wKBgBe2TRqbea/kTxJp04J1KBmTzRqCF4d3jZwYvl/pwYo2uec7zUkV\nRs+IOE+czTONjcai0bNHCN1zJeJS1atsRGYuJl6a14tOmeNtFk0GvUk6kDXnCoWz\nT4iBPDIoU6XDKAhf1L4fXfR9RlEKDjNUQeygsAOM1zWrPEQ9mq0Gs42RAoGBAI/c\nSDwN8E5TyeNoPzpC2d1CkrQaM0O9V+cZ+dAp5mZrV2iJVPHwgA+rsWhcrd8pWe7J\nzlPr/UbJU2xwWktyQ9DDiob34ccXaY0n4W3Yk3gIKFOmXWQcjjW5US07IFbIPO5S\nYUuRZK8H52Pf5rlGSM/I0BB1LzK/uXz5QR9XXIxrAoGBAMx4lFpJQWO1lBbk5vz7\nND07b6/iWGvlmx2NYxkQSIkz28Gq+5cnVVVCUFTq+Q3k0fmJ70Dgvn3dp7EDDkgR\nt0O5FtPdH16MnTKLoudDjhWWG85cLLzg8eIe8MhzgaaBYMi4pBAxqueLMaTGQ1be\nhhSOPkUgyuFFE6csuxqCxtXj\n-----END PRIVATE KEY-----\n",
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = "1KQpAYsoUnq5oS7G1fQ2pnrnsbWvaMfLDa8Gy91Ton_Y";
    const range = "USER MANAGEMENT!A3:K";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Explicitly filter out deleted users and log the process
    const filteredRows = rows.filter((row: string[]) => {
      const isDeleted = row[10]?.toLowerCase() === "deleted";
      console.log(
        `Row userId: ${row[0]}, Deleted status: ${
          row[10]
        }, Included: ${!isDeleted}`
      );
      return !isDeleted;
    });

    const users = filteredRows.map((row: string[], index: number) => ({
      id: index + 1,
      userId: row[0] || "",
      department: row[1] || "",
      employeeCode: row[2] || "",
      name: row[3] || "",
      role: row[4] || "",
      reportTo: row[5] || "",
      email: row[6] || "",
      password: row[7] || "",
      status: row[8] || "active",
      lastLogin:
        row[9] ||
        new Date()
          .toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .replace(/(\d+)\/(\d+)\/(\d+)/, "$2/$1/$3"),
      createdAt: new Date().toISOString().split("T")[0],
      permissions:
        row[4] === "Admin"
          ? ["all_modules"]
          : row[1]
          ? [row[1].toLowerCase()]
          : [],
      deleted: false, // Explicitly set to false since we filtered out deleted users
      originalRowIndex: rows.findIndex((r: string[]) => r[0] === row[0]) + 1,
    }));

    console.log(`Fetched ${users.length} active users`);
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users from Google Sheets:", error);
    return NextResponse.json(
      { error: "Failed to fetch users from Google Sheets" },
      { status: 500 }
    );
  }
}

// Add user
export async function POST(request: Request) {
  try {
    if (!process.env.GOOGLE_SHEETS_ID) {
      return NextResponse.json(
        { error: "Google_SHEETS_ID environment variable is not set" },
        { status: 500 }
      );
    }
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      return NextResponse.json(
        { error: "Google_CLIENT_EMAIL environment variable is not set" },
        { status: 500 }
      );
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Google_PRIVATE_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    const {
      userId,
      department,
      employeeCode,
      name,
      role,
      reportTo,
      email,
      password,
      status,
      lastLogin,
    } = await request.json();

    if (
      !userId ||
      !department ||
      !employeeCode ||
      !name ||
      !role ||
      !reportTo ||
      !email ||
      !password ||
      !status ||
      !lastLogin
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: "erp-system@erp-464612.iam.gserviceaccount.com",
        private_key:
          "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDN3QlLuyQU7JH/\ngP1e3zWmCnixSW9MPIZIwJ34sNwFuBLrJMYOsGE5cZrUUuP6jN55vw1jOzcStMlz\nnDCQFVLMtAF7ddRqKmPk99HhMGWEf3xY1c8Uz3LXujdkWQ7GQphLRsexr7FlJ+4f\nDYQsPh84Mbo2i7jMpJUAKzi3xHJKFfMD8trvUFLa3OS5MaOQsF4FJDvpnz4xBfJn\nI0cYI6iBSvcRrlRW9HyFy8r0mYSoU7X64gNgUtHKPdXuGNUhEVNn+rkGP6ZypwC0\n3cj6BrTZvl1sMEBapX08WwR79MhtkAiNq1XlJUQGhoqfozhAd72TW8bohBxmaqtL\nQX9iZ0JDAgMBAAECggEAVdJbsTwrzyNOvEdQmZARZA7CgRpdsVkcHFFcqhRFLYcv\nL+NtRCto5NNFGlYSH95BU10AHknN7Fj9ENrg7fhNw/QZGBinvLi+W3KrByevcrzZ\nIInGImVXebLyq71q6OFTbzJrRtq5aDPs0/pFC1K8nicw+9Nk779/NIpQQ2A8y0A6\nDZK9UdilP9XzYQVC54H9tV2H5dvT9KNhsKfAK/llIOywCOamZeH8VlTHka3GZGSq\nftWFEN+emYaRJGIE4YY7fHLRQE7KUbumiSDQxtRqP5RYgySef1NiMm0tMqzXtPp2\nQkq0dfvvt2RTqbkcJlRPlU64ekZb3VEYTHzOi+p88QKBgQD7vqz4rwT94oM+c3Os\nlpAEeYm83d74ieTdDf7IedGiXqQ5Invebo6cTh/s+DIckDVBrFNcTaO0sHj9gAU8\na6awsFtu5uqQ0o5UTzK5QJVLQ3MvHxRPXlCHZJiWemoA3N2Z5Jey3l7L7AtgRPng\n1TZns+LQd+HpykBCGWsQBf7u0QKBgQDRV9PNLDg1AAp/9r0DsIM83+9lAgl7Hizr\nUH/WuyCoWoac5mDX8K/NaLn3EJ3FKfkILZgAA18yrZ6vVYMGlG7zSsh/HNztoTPK\nx/lZEOUw5jCk+KIsYc3vXYQh+Hi+WzUQuYfV3HPNHkVVtVAUiYBsgnDFS3qOlo2w\nT8AFmJSs0wKBgBe2TRqbea/kTxJp04J1KBmTzRqCF4d3jZwYvl/pwYo2uec7zUkV\nRs+IOE+czTONjcai0bNHCN1zJeJS1atsRGYuJl6a14tOmeNtFk0GvUk6kDXnCoWz\nT4iBPDIoU6XDKAhf1L4fXfR9RlEKDjNUQeygsAOM1zWrPEQ9mq0Gs42RAoGBAI/c\nSDwN8E5TyeNoPzpC2d1CkrQaM0O9V+cZ+dAp5mZrV2iJVPHwgA+rsWhcrd8pWe7J\nzlPr/UbJU2xwWktyQ9DDiob34ccXaY0n4W3Yk3gIKFOmXWQcjjW5US07IFbIPO5S\nYUuRZK8H52Pf5rlGSM/I0BB1LzK/uXz5QR9XXIxrAoGBAMx4lFpJQWO1lBbk5vz7\nND07b6/iWGvlmx2NYxkQSIkz28Gq+5cnVVVCUFTq+Q3k0fmJ70Dgvn3dp7EDDkgR\nt0O5FtPdH16MnTKLoudDjhWWG85cLLzg8eIe8MhzgaaBYMi4pBAxqueLMaTGQ1be\nhhSOPkUgyuFFE6csuxqCxtXj\n-----END PRIVATE KEY-----\n",
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = "1KQpAYsoUnq5oS7G1fQ2pnrnsbWvaMfLDa8Gy91Ton_Y";
    const range = "USER MANAGEMENT!A3:K";
    const valueInputOption = "USER_ENTERED";

    const resource = {
      values: [
        [
          userId,
          department,
          employeeCode,
          name,
          role,
          reportTo,
          email,
          password,
          status,
          lastLogin,
          "",
        ],
      ],
    };

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: resource,
    });

    return NextResponse.json({ message: "User added to Google Sheets" });
  } catch (error) {
    console.error("Error adding user to Google Sheets:", error);
    return NextResponse.json(
      { error: "Failed to add user to Google Sheets" },
      { status: 500 }
    );
  }
}

// Update user
export async function PUT(request: Request) {
  try {
    if (!process.env.GOOGLE_SHEETS_ID) {
      return NextResponse.json(
        { error: "GOOGLE_SHEETS_ID environment variable is not set" },
        { status: 500 }
      );
    }
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      return NextResponse.json(
        { error: "GOOGLE_CLIENT_EMAIL environment variable is not set" },
        { status: 500 }
      );
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_PRIVATE_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    const {
      userId,
      department,
      employeeCode,
      name,
      role,
      reportTo,
      email,
      password,
      status,
      lastLogin,
    } = await request.json();

    if (
      !userId ||
      !department ||
      !employeeCode ||
      !name ||
      !role ||
      !reportTo ||
      !email ||
      !password ||
      !status ||
      !lastLogin
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: "erp-system@erp-464612.iam.gserviceaccount.com",
        private_key:
          "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDN3QlLuyQU7JH/\ngP1e3zWmCnixSW9MPIZIwJ34sNwFuBLrJMYOsGE5cZrUUuP6jN55vw1jOzcStMlz\nnDCQFVLMtAF7ddRqKmPk99HhMGWEf3xY1c8Uz3LXujdkWQ7GQphLRsexr7FlJ+4f\nDYQsPh84Mbo2i7jMpJUAKzi3xHJKFfMD8trvUFLa3OS5MaOQsF4FJDvpnz4xBfJn\nI0cYI6iBSvcRrlRW9HyFy8r0mYSoU7X64gNgUtHKPdXuGNUhEVNn+rkGP6ZypwC0\n3cj6BrTZvl1sMEBapX08WwR79MhtkAiNq1XlJUQGhoqfozhAd72TW8bohBxmaqtL\nQX9iZ0JDAgMBAAECggEAVdJbsTwrzyNOvEdQmZARZA7CgRpdsVkcHFFcqhRFLYcv\nL+NtRCto5NNFGlYSH95BU10AHknN7Fj9ENrg7fhNw/QZGBinvLi+W3KrByevcrzZ\nIInGImVXebLyq71q6OFTbzJrRtq5aDPs0/pFC1K8nicw+9Nk779/NIpQQ2A8y0A6\nDZK9UdilP9XzYQVC54H9tV2H5dvT9KNhsKfAK/llIOywCOamZeH8VlTHka3GZGSq\nftWFEN+emYaRJGIE4YY7fHLRQE7KUbumiSDQxtRqP5RYgySef1NiMm0tMqzXtPp2\nQkq0dfvvt2RTqbkcJlRPlU64ekZb3VEYTHzOi+p88QKBgQD7vqz4rwT94oM+c3Os\nlpAEeYm83d74ieTdDf7IedGiXqQ5Invebo6cTh/s+DIckDVBrFNcTaO0sHj9gAU8\na6awsFtu5uqQ0o5UTzK5QJVLQ3MvHxRPXlCHZJiWemoA3N2Z5Jey3l7L7AtgRPng\n1TZns+LQd+HpykBCGWsQBf7u0QKBgQDRV9PNLDg1AAp/9r0DsIM83+9lAgl7Hizr\nUH/WuyCoWoac5mDX8K/NaLn3EJ3FKfkILZgAA18yrZ6vVYMGlG7zSsh/HNztoTPK\nx/lZEOUw5jCk+KIsYc3vXYQh+Hi+WzUQuYfV3HPNHkVVtVAUiYBsgnDFS3qOlo2w\nT8AFmJSs0wKBgBe2TRqbea/kTxJp04J1KBmTzRqCF4d3jZwYvl/pwYo2uec7zUkV\nRs+IOE+czTONjcai0bNHCN1zJeJS1atsRGYuJl6a14tOmeNtFk0GvUk6kDXnCoWz\nT4iBPDIoU6XDKAhf1L4fXfR9RlEKDjNUQeygsAOM1zWrPEQ9mq0Gs42RAoGBAI/c\nSDwN8E5TyeNoPzpC2d1CkrQaM0O9V+cZ+dAp5mZrV2iJVPHwgA+rsWhcrd8pWe7J\nzlPr/UbJU2xwWktyQ9DDiob34ccXaY0n4W3Yk3gIKFOmXWQcjjW5US07IFbIPO5S\nYUuRZK8H52Pf5rlGSM/I0BB1LzK/uXz5QR9XXIxrAoGBAMx4lFpJQWO1lBbk5vz7\nND07b6/iWGvlmx2NYxkQSIkz28Gq+5cnVVVCUFTq+Q3k0fmJ70Dgvn3dp7EDDkgR\nt0O5FtPdH16MnTKLoudDjhWWG85cLLzg8eIe8MhzgaaBYMi4pBAxqueLMaTGQ1be\nhhSOPkUgyuFFE6csuxqCxtXj\n-----END PRIVATE KEY-----\n",
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1KQpAYsoUnq5oS7G1fQ2pnrnsbWvaMfLDa8Gy91Ton_Y";

    const getRange = "USER MANAGEMENT!A3:K";
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: getRange,
    });

    const rows = getResponse.data.values || [];
    let actualRowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === userId && rows[i][10]?.toLowerCase() !== "deleted") {
        actualRowIndex = i + 2; // +2 because A2 is the starting point
        break;
      }
    }

    if (actualRowIndex === -1) {
      return NextResponse.json(
        { error: "User not found or already deleted" },
        { status: 404 }
      );
    }

    const range = `USER MANAGEMENT!A${actualRowIndex}:K${actualRowIndex}`;
    const resource = {
      values: [
        [
          userId,
          department,
          employeeCode,
          name,
          role,
          reportTo,
          email,
          password,
          status,
          lastLogin,
          "",
        ],
      ],
    };

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: resource,
    });

    return NextResponse.json({ message: "User updated in Google Sheets" });
  } catch (error) {
    console.error("Error updating user in Google Sheets:", error);
    return NextResponse.json(
      { error: "Failed to update user in Google Sheets" },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(request: Request) {
  try {
    if (!process.env.GOOGLE_SHEETS_ID) {
      return NextResponse.json(
        { error: "GOOGLE_SHEETS_ID environment variable is not set" },
        { status: 500 }
      );
    }
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      return NextResponse.json(
        { error: "GOOGLE_CLIENT_EMAIL environment variable is not set" },
        { status: 500 }
      );
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_PRIVATE_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: "erp-system@erp-464612.iam.gserviceaccount.com",
        private_key:
          "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDN3QlLuyQU7JH/\ngP1e3zWmCnixSW9MPIZIwJ34sNwFuBLrJMYOsGE5cZrUUuP6jN55vw1jOzcStMlz\nnDCQFVLMtAF7ddRqKmPk99HhMGWEf3xY1c8Uz3LXujdkWQ7GQphLRsexr7FlJ+4f\nDYQsPh84Mbo2i7jMpJUAKzi3xHJKFfMD8trvUFLa3OS5MaOQsF4FJDvpnz4xBfJn\nI0cYI6iBSvcRrlRW9HyFy8r0mYSoU7X64gNgUtHKPdXuGNUhEVNn+rkGP6ZypwC0\n3cj6BrTZvl1sMEBapX08WwR79MhtkAiNq1XlJUQGhoqfozhAd72TW8bohBxmaqtL\nQX9iZ0JDAgMBAAECggEAVdJbsTwrzyNOvEdQmZARZA7CgRpdsVkcHFFcqhRFLYcv\nL+NtRCto5NNFGlYSH95BU10AHknN7Fj9ENrg7fhNw/QZGBinvLi+W3KrByevcrzZ\nIInGImVXebLyq71q6OFTbzJrRtq5aDPs0/pFC1K8nicw+9Nk779/NIpQQ2A8y0A6\nDZK9UdilP9XzYQVC54H9tV2H5dvT9KNhsKfAK/llIOywCOamZeH8VlTHka3GZGSq\nftWFEN+emYaRJGIE4YY7fHLRQE7KUbumiSDQxtRqP5RYgySef1NiMm0tMqzXtPp2\nQkq0dfvvt2RTqbkcJlRPlU64ekZb3VEYTHzOi+p88QKBgQD7vqz4rwT94oM+c3Os\nlpAEeYm83d74ieTdDf7IedGiXqQ5Invebo6cTh/s+DIckDVBrFNcTaO0sHj9gAU8\na6awsFtu5uqQ0o5UTzK5QJVLQ3MvHxRPXlCHZJiWemoA3N2Z5Jey3l7L7AtgRPng\n1TZns+LQd+HpykBCGWsQBf7u0QKBgQDRV9PNLDg1AAp/9r0DsIM83+9lAgl7Hizr\nUH/WuyCoWoac5mDX8K/NaLn3EJ3FKfkILZgAA18yrZ6vVYMGlG7zSsh/HNztoTPK\nx/lZEOUw5jCk+KIsYc3vXYQh+Hi+WzUQuYfV3HPNHkVVtVAUiYBsgnDFS3qOlo2w\nT8AFmJSs0wKBgBe2TRqbea/kTxJp04J1KBmTzRqCF4d3jZwYvl/pwYo2uec7zUkV\nRs+IOE+czTONjcai0bNHCN1zJeJS1atsRGYuJl6a14tOmeNtFk0GvUk6kDXnCoWz\nT4iBPDIoU6XDKAhf1L4fXfR9RlEKDjNUQeygsAOM1zWrPEQ9mq0Gs42RAoGBAI/c\nSDwN8E5TyeNoPzpC2d1CkrQaM0O9V+cZ+dAp5mZrV2iJVPHwgA+rsWhcrd8pWe7J\nzlPr/UbJU2xwWktyQ9DDiob34ccXaY0n4W3Yk3gIKFOmXWQcjjW5US07IFbIPO5S\nYUuRZK8H52Pf5rlGSM/I0BB1LzK/uXz5QR9XXIxrAoGBAMx4lFpJQWO1lBbk5vz7\nND07b6/iWGvlmx2NYxkQSIkz28Gq+5cnVVVCUFTq+Q3k0fmJ70Dgvn3dp7EDDkgR\nt0O5FtPdH16MnTKLoudDjhWWG85cLLzg8eIe8MhzgaaBYMi4pBAxqueLMaTGQ1be\nhhSOPkUgyuFFE6csuxqCxtXj\n-----END PRIVATE KEY-----\n",
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1KQpAYsoUnq5oS7G1fQ2pnrnsbWvaMfLDa8Gy91Ton_Y";

    const getRange = "USER MANAGEMENT!A3:K";
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: getRange,
    });

    const rows = getResponse.data.values || [];
    let actualRowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === userId && rows[i][10]?.toLowerCase() !== "deleted") {
        actualRowIndex = i + 2; // +2 because A2 is the starting point
        break;
      }
    }

    if (actualRowIndex === -1) {
      return NextResponse.json(
        { error: "User not found or already deleted" },
        { status: 404 }
      );
    }

    const range = `USER MANAGEMENT!K${actualRowIndex}:K${actualRowIndex}`;
    const resource = {
      values: [["Deleted"]],
    };

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: resource,
    });

    return NextResponse.json({
      message: "User marked as deleted in Google Sheets",
    });
  } catch (error) {
    console.error("Error deleting user in Google Sheets:", error);
    return NextResponse.json(
      { error: "Failed to delete user in Google Sheets" },
      { status: 500 }
    );
  }
}
