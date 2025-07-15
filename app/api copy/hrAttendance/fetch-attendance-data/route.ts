import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = new google.auth.JWT({
      email: "erp-system@erp-464612.iam.gserviceaccount.com",
      key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDN3QlLuyQU7JH/\ngP1e3zWmCnixSW9MPIZIwJ34sNwFuBLrJMYOsGE5cZrUUuP6jN55vw1jOzcStMlz\nnDCQFVLMtAF7ddRqKmPk99HhMGWEf3xY1c8Uz3LXujdkWQ7GQphLRsexr7FlJ+4f\nDYQsPh84Mbo2i7jMpJUAKzi3xHJKFfMD8trvUFLa3OS5MaOQsF4FJDvpnz4xBfJn\nI0cYI6iBSvcRrlRW9HyFy8r0mYSoU7X64gNgUtHKPdXuGNUhEVNn+rkGP6ZypwC0\n3cj6BrTZvl1sMEBapX08WwR79MhtkAiNq1XlJUQGhoqfozhAd72TW8bohBxmaqtL\nQX9iZ0JDAgMBAAECggEAVdJbsTwrzyNOvEdQmZARZA7CgRpdsVkcHFFcqhRFLYcv\nL+NtRCto5NNFGlYSH95BU10AHknN7Fj9ENrg7fhNw/QZGBinvLi+W3KrByevcrzZ\nIInGImVXebLyq71q6OFTbzJrRtq5aDPs0/pFC1K8nicw+9Nk779/NIpQQ2A8y0A6\nDZK9UdilP9XzYQVC54H9tV2H5dvT9KNhsKfAK/llIOywCOamZeH8VlTHka3GZGSq\nftWFEN+emYaRJGIE4YY7fHLRQE7KUbumiSDQxtRqP5RYgySef1NiMm0tMqzXtPp2\nQkq0dfvvt2RTqbkcJlRPlU64ekZb3VEYTHzOi+p88QKBgQD7vqz4rwT94oM+c3Os\nlpAEeYm83d74ieTdDf7IedGiXqQ5Invebo6cTh/s+DIckDVBrFNcTaO0sHj9gAU8\na6awsFtu5uqQ0o5UTzK5QJVLQ3MvHxRPXlCHZJiWemoA3N2Z5Jey3l7L7AtgRPng\n1TZns+LQd+HpykBCGWsQBf7u0QKBgQDRV9PNLDg1AAp/9r0DsIM83+9lAgl7Hizr\nUH/WuyCoWoac5mDX8K/NaLn3EJ3FKfkILZgAA18yrZ6vVYMGlG7zSsh/HNztoTPK\nx/lZEOUw5jCk+KIsYc3vXYQh+Hi+WzUQuYfV3HPNHkVVtVAUiYBsgnDFS3qOlo2w\nT8AFmJSs0wKBgBe2TRqbea/kTxJp04J1KBmTzRqCF4d3jZwYvl/pwYo2uec7zUkV\nRs+IOE+czTONjcai0bNHCN1zJeJS1atsRGYuJl6a14tOmeNtFk0GvUk6kDXnCoWz\nT4iBPDIoU6XDKAhf1L4fXfR9RlEKDjNUQeygsAOM1zWrPEQ9mq0Gs42RAoGBAI/c\nSDwN8E5TyeNoPzpC2d1CkrQaM0O9V+cZ+dAp5mZrV2iJVPHwgA+rsWhcrd8pWe7J\nzlPr/UbJU2xwWktyQ9DDiob34ccXaY0n4W3Yk3gIKFOmXWQcjjW5US07IFbIPO5S\nYUuRZK8H52Pf5rlGSM/I0BB1LzK/uXz5QR9XXIxrAoGBAMx4lFpJQWO1lBbk5vz7\nND07b6/iWGvlmx2NYxkQSIkz28Gq+5cnVVVCUFTq+Q3k0fmJ70Dgvn3dp7EDDkgR\nt0O5FtPdH16MnTKLoudDjhWWG85cLLzg8eIe8MhzgaaBYMi4pBAxqueLMaTGQ1be\nhhSOPkUgyuFFE6csuxqCxtXj\n-----END PRIVATE KEY-----\n",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1KQpAYsoUnq5oS7G1fQ2pnrnsbWvaMfLDa8Gy91Ton_Y";

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Server configuration error: Missing Google Sheets ID" },
        { status: 500 }
      );
    }

    const range = "ATTENDANCE!A:N"; // Updated to include hrStatus column

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    const records = rows.slice(1).map((row) => ({
      id: row[0] || "",
      name: row[1] || "",
      department: row[2] || "",
      status: row[3] || "",
      hrStatus: row[13] || "N/A",
      selfieCheckIn: row[4] || "",
      addressCheckIn: row[5] || "",
      timestampCheckIn: row[6] || "",
      checkIn: row[7] || "",
      checkOut: row[8] || "",
      workHours: row[9] || "",
      selfieCheckOut: row[10] || "",
      addressCheckOut: row[11] || "",
      timestampCheckOut: row[12] || "",
    }));

    return NextResponse.json({ records }, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance data" },
      { status: 500 }
    );
  }
}
