import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { AccessLevel } from "@prisma/client";

// Helper function for Google Sheets authentication
async function getSheetsClient() {
  if (
    !process.env.GOOGLE_SHEETS_ID ||
    !process.env.GOOGLE_CLIENT_EMAIL ||
    !process.env.GOOGLE_PRIVATE_KEY
  ) {
    throw new Error("Google Sheets environment variables are not set");
  }
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: "erp-system@erp-464612.iam.gserviceaccount.com",
      private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDN3QlLuyQU7JH/\ngP1e3zWmCnixSW9MPIZIwJ34sNwFuBLrJMYOsGE5cZrUUuP6jN55vw1jOzcStMlz\nnDCQFVLMtAF7ddRqKmPk99HhMGWEf3xY1c8Uz3LXujdkWQ7GQphLRsexr7FlJ+4f\nDYQsPh84Mbo2i7jMpJUAKzi3xHJKFfMD8trvUFLa3OS5MaOQsF4FJDvpnz4xBfJn\nI0cYI6iBSvcRrlRW9HyFy8r0mYSoU7X64gNgUtHKPdXuGNUhEVNn+rkGP6ZypwC0\n3cj6BrTZvl1sMEBapX08WwR79MhtkAiNq1XlJUQGhoqfozhAd72TW8bohBxmaqtL\nQX9iZ0JDAgMBAAECggEAVdJbsTwrzyNOvEdQmZARZA7CgRpdsVkcHFFcqhRFLYcv\nL+NtRCto5NNFGlYSH95BU10AHknN7Fj9ENrg7fhNw/QZGBinvLi+W3KrByevcrzZ\nIInGImVXebLyq71q6OFTbzJrRtq5aDPs0/pFC1K8nicw+9Nk779/NIpQQ2A8y0A6\nDZK9UdilP9XzYQVC54H9tV2H5dvT9KNhsKfAK/llIOywCOamZeH8VlTHka3GZGSq\nftWFEN+emYaRJGIE4YY7fHLRQE7KUbumiSDQxtRqP5RYgySef1NiMm0tMqzXtPp2\nQkq0dfvvt2RTqbkcJlRPlU64ekZb3VEYTHzOi+p88QKBgQD7vqz4rwT94oM+c3Os\nlpAEeYm83d74ieTdDf7IedGiXqQ5Invebo6cTh/s+DIckDVBrFNcTaO0sHj9gAU8\na6awsFtu5uqQ0o5UTzK5QJVLQ3MvHxRPXlCHZJiWemoA3N2Z5Jey3l7L7AtgRPng\n1TZns+LQd+HpykBCGWsQBf7u0QKBgQDRV9PNLDg1AAp/9r0DsIM83+9lAgl7Hizr\nUH/WuyCoWoac5mDX8K/NaLn3EJ3FKfkILZgAA18yrZ6vVYMGlG7zSsh/HNztoTPK\nx/lZEOUw5jCk+KIsYc3vXYQh+Hi+WzUQuYfV3HPNHkVVtVAUiYBsgnDFS3qOlo2w\nT8AFmJSs0wKBgBe2TRqbea/kTxJp04J1KBmTzRqCF4d3jZwYvl/pwYo2uec7zUkV\nRs+IOE+czTONjcai0bNHCN1zJeJS1atsRGYuJl6a14tOmeNtFk0GvUk6kDXnCoWz\nT4iBPDIoU6XDKAhf1L4fXfR9RlEKDjNUQeygsAOM1zWrPEQ9mq0Gs42RAoGBAI/c\nSDwN8E5TyeNoPzpC2d1CkrQaM0O9V+cZ+dAp5mZrV2iJVPHwgA+rsWhcrd8pWe7J\nzlPr/UbJU2xwWktyQ9DDiob34ccXaY0n4W3Yk3gIKFOmXWQcjjW5US07IFbIPO5S\nYUuRZK8H52Pf5rlGSM/I0BB1LzK/uXz5QR9XXIxrAoGBAMx4lFpJQWO1lBbk5vz7\nND07b6/iWGvlmx2NYxkQSIkz28Gq+5cnVVVCUFTq+Q3k0fmJ70Dgvn3dp7EDDkgR\nt0O5FtPdH16MnTKLoudDjhWWG85cLLzg8eIe8MhzgaaBYMi4pBAxqueLMaTGQ1be\nhhSOPkUgyuFFE6csuxqCxtXj\n-----END PRIVATE KEY-----\n",
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// GET: Fetch employees from database
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employees = await prisma.employee.findMany({
      where: { status: { not: "Deleted" } },
      select: {
        id: true,
        userId: true,
        department: true,
        employeeCode: true,
        employeeName: true,
        role: true,
        reportTo: true,
        email: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        permissions: {
          select: { module: { select: { moduleName: true } } },
        },
      },
    });

    const users = employees.map((employee, index) => ({
      id: index + 1,
      userId: employee.userId,
      department: employee.department,
      employeeCode: employee.employeeCode,
      name: employee.employeeName,
      role: employee.role,
      reportTo: employee.reportTo || "",
      email: employee.email,
      password: "",
      status: employee.status,
      lastLogin: employee.lastLogin?.toISOString() || "",
      createdAt: employee.createdAt.toISOString().split("T")[0],
      permissions:
        employee.role === "Admin"
          ? ["all_modules"]
          : employee.permissions.map((p) => p.module.moduleName.toLowerCase()),
      deleted: false,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

// POST: Create employee in database and sync to Google Sheets
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      department,
      employeeCode,
      name,
      role,
      reportTo,
      email,
      password,
      status = "Active",
    } = data;

    if (!["Active", "Inactive", "Paused"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 12) : "";

    const [employee] = await prisma.$transaction([
      prisma.employee.create({
        data: {
          department: department || "",
          employeeCode: employeeCode || "",
          employeeName: name || "",
          role: role || "",
          reportTo: reportTo || null,
          email: email || "",
          password: hashedPassword,
          status,
          userId: employeeCode || "",
        },
      }),
    ]);

    const permissionCreates = [];
    const moduleAccessCreates: {
      employeeId: string;
      moduleId: number;
      accessLevel: AccessLevel;
      grantedBy: string;
    }[] = [];
    if (role === "Admin") {
      const modules = await prisma.module.findMany({
        include: { submodules: true },
      });
      for (const module of modules) {
        permissionCreates.push({
          employeeId: employee.id,
          moduleId: module.id,
          create: true,
          edit: true,
          delete: true,
          view: true,
        });
        for (const submodule of module.submodules) {
          permissionCreates.push({
            employeeId: employee.id,
            moduleId: module.id,
            submoduleId: submodule.id,
            create: true,
            edit: true,
            delete: true,
            view: true,
          });
        }
        moduleAccessCreates.push({
          employeeId: employee.id,
          moduleId: module.id,
          accessLevel: "ADMIN" as AccessLevel,
          grantedBy: session.user.id || "system",
        });
      }
    } else if (department) {
      const departmentModule = await prisma.module.findFirst({
        where: { moduleName: department },
      });
      if (departmentModule) {
        permissionCreates.push({
          employeeId: employee.id,
          moduleId: departmentModule.id,
          create: false,
          edit: false,
          delete: false,
          view: true,
        });
        moduleAccessCreates.push({
          employeeId: employee.id,
          moduleId: departmentModule.id,
          accessLevel: "USER" as AccessLevel,
          grantedBy: session.user.id || "system",
        });
      }
    }

    if (permissionCreates.length > 0 || moduleAccessCreates.length > 0) {
      await prisma.$transaction([
        ...(permissionCreates.length
          ? [
              prisma.masterTable.createMany({
                data: permissionCreates.filter((p) => !p.submoduleId),
              }),
              prisma.masterTable.createMany({
                data: permissionCreates.filter((p) => p.submoduleId),
                skipDuplicates: true,
              }),
            ]
          : []),
        ...(moduleAccessCreates.length
          ? [
              prisma.moduleAccess.createMany({
                data: moduleAccessCreates,
                skipDuplicates: true,
              }),
            ]
          : []),
      ]);
    }

    try {
      const sheets = await getSheetsClient();
      const spreadsheetId = "1KQpAYsoUnq5oS7G1fQ2pnrnsbWvaMfLDa8Gy91Ton_Y";
      const googleSheetsData = [
        employee.employeeCode || "",
        employee.department || "",
        employee.employeeCode || "",
        employee.employeeName || "",
        employee.role || "",
        employee.reportTo || "",
        employee.email || "",
        "",
        employee.status,
        employee.lastLogin?.toISOString() || new Date().toISOString(),
        "",
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "USER MANAGEMENT!A3:K",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [googleSheetsData] },
      });
    } catch (sheetsError) {
      console.error("Error syncing to Google Sheets:", sheetsError);
    }

    return NextResponse.json({
      message: "Employee created successfully",
      employee: {
        id: employee.id,
        userId: employee.employeeCode,
        department: employee.department,
        employeeCode: employee.employeeCode,
        name: employee.employeeName,
        role: employee.role,
        reportTo: employee.reportTo || "",
        email: employee.email,
        status: employee.status,
        lastLogin: employee.lastLogin?.toISOString() || "",
        createdAt: employee.createdAt.toISOString().split("T")[0],
        permissions:
          role === "Admin"
            ? ["all_modules"]
            : department
            ? [department.toLowerCase()]
            : [],
      },
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}

// PUT: Update employee in database and sync to Google Sheets
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      id,
      department,
      employeeCode,
      name,
      role,
      reportTo,
      email,
      password,
      status,
    } = data;

    if (!id) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    if (status && !["Active", "Inactive", "Paused"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: any = {
      department: department || "",
      employeeCode: employeeCode || "",
      employeeName: name || "",
      role: role || "",
      reportTo: reportTo || null,
      email: email || "",
      status: status || "Active",
      userId: employeeCode || "",
      updatedAt: new Date(),
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const [employee] = await prisma.$transaction([
      prisma.employee.update({ where: { id }, data: updateData }),
      prisma.masterTable.deleteMany({ where: { employeeId: id } }),
      prisma.moduleAccess.deleteMany({ where: { employeeId: id } }),
    ]);

    const permissionCreates = [];
    const moduleAccessCreates = [];
    if (role === "Admin") {
      const modules = await prisma.module.findMany({
        include: { submodules: true },
      });
      for (const module of modules) {
        permissionCreates.push({
          employeeId: employee.id,
          moduleId: module.id,
          create: true,
          edit: true,
          delete: true,
          view: true,
        });
        for (const submodule of module.submodules) {
          permissionCreates.push({
            employeeId: employee.id,
            moduleId: module.id,
            submoduleId: submodule.id,
            create: true,
            edit: true,
            delete: true,
            view: true,
          });
        }
        moduleAccessCreates.push({
          employeeId: employee.id,
          moduleId: module.id,
          accessLevel: AccessLevel.ADMIN,
          grantedBy: session.user.id || "system",
        });
      }
    } else if (department) {
      const departmentModule = await prisma.module.findFirst({
        where: { moduleName: department },
      });
      if (departmentModule) {
        permissionCreates.push({
          employeeId: employee.id,
          moduleId: departmentModule.id,
          create: false,
          edit: false,
          delete: false,
          view: true,
        });
        moduleAccessCreates.push({
          employeeId: employee.id,
          moduleId: departmentModule.id,
          accessLevel: AccessLevel.USER,
          grantedBy: session.user.id || "system",
        });
      }
    }

    if (permissionCreates.length > 0 || moduleAccessCreates.length > 0) {
      await prisma.$transaction([
        ...(permissionCreates.length
          ? [
              prisma.masterTable.createMany({
                data: permissionCreates.filter((p) => !p.submoduleId),
              }),
              prisma.masterTable.createMany({
                data: permissionCreates.filter((p) => p.submoduleId),
                skipDuplicates: true,
              }),
            ]
          : []),
        ...(moduleAccessCreates.length
          ? [
              prisma.moduleAccess.createMany({
                data: moduleAccessCreates,
                skipDuplicates: true,
              }),
            ]
          : []),
      ]);
    }

    try {
      const sheets = await getSheetsClient();
      const spreadsheetId = "1KQpAYsoUnq5oS7G1fQ2pnrnsbWvaMfLDa8Gy91Ton_Y";
      const getRange = "USER MANAGEMENT!A3:K";
      const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: getRange,
      });

      const rows = getResponse.data.values || [];
      let actualRowIndex = -1;
      for (let i = 0; i < rows.length; i++) {
        if (
          rows[i][0] === employee.employeeCode &&
          rows[i][10]?.toLowerCase() !== "deleted"
        ) {
          actualRowIndex = i + 3;
          break;
        }
      }

      const googleSheetsData = [
        employee.employeeCode || "",
        employee.department || "",
        employee.employeeCode || "",
        employee.employeeName || "",
        employee.role || "",
        employee.reportTo || "",
        employee.email || "",
        "",
        employee.status,
        employee.lastLogin?.toISOString() || new Date().toISOString(),
        "",
      ];

      if (actualRowIndex === -1) {
        console.warn(
          `User ${employee.employeeCode} not found in Google Sheets; appending new row`
        );
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: "USER MANAGEMENT!A3:K",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [googleSheetsData] },
        });
      } else {
        const range = `USER MANAGEMENT!A${actualRowIndex}:K${actualRowIndex}`;
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [googleSheetsData] },
        });
      }
    } catch (sheetsError) {
      console.error("Error syncing to Google Sheets:", sheetsError);
    }

    return NextResponse.json({
      message: "Employee updated successfully",
      employee: {
        id: employee.id,
        userId: employee.employeeCode,
        department: employee.department,
        employeeCode: employee.employeeCode,
        name: employee.employeeName,
        role: employee.role,
        reportTo: employee.reportTo || "",
        email: employee.email,
        status: employee.status,
        lastLogin: employee.lastLogin?.toISOString() || "",
        createdAt: employee.createdAt.toISOString().split("T")[0],
        permissions:
          role === "Admin"
            ? ["all_modules"]
            : department
            ? [department.toLowerCase()]
            : [],
      },
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

// DELETE: Delete employee from database and mark as deleted in Google Sheets
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { id, employeeCode } = data;

    // Validate input: require either id or employeeCode
    if (!id && !employeeCode) {
      return NextResponse.json(
        { error: "Either id or employeeCode is required" },
        { status: 400 }
      );
    }

    // Find employee by id or employeeCode
    const employee = await prisma.employee.findUnique({
      where: id ? { id } : { employeeCode },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Update status to Deleted and clear related data
    await prisma.$transaction([
      prisma.employee.update({
        where: { id: employee.id },
        data: { status: "Deleted", updatedAt: new Date() },
      }),
      prisma.masterTable.deleteMany({ where: { employeeId: employee.id } }),
      prisma.moduleAccess.deleteMany({ where: { employeeId: employee.id } }),
      prisma.account.deleteMany({ where: { userId: employee.id } }),
      prisma.session.deleteMany({ where: { userId: employee.id } }),
    ]);

    // Sync to Google Sheets
    try {
      const sheets = await getSheetsClient();
      const spreadsheetId = "1KQpAYsoUnq5oS7G1fQ2pnrnsbWvaMfLDa8Gy91Ton_Y";
      const getRange = "USER MANAGEMENT!A3:K";
      const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: getRange,
      });

      const rows = getResponse.data.values || [];
      let actualRowIndex = -1;
      for (let i = 0; i < rows.length; i++) {
        if (
          rows[i][0] === employee.employeeCode &&
          rows[i][10]?.toLowerCase() !== "deleted"
        ) {
          actualRowIndex = i + 3;
          break;
        }
      }

      if (actualRowIndex !== -1) {
        const range = `USER MANAGEMENT!A${actualRowIndex}:K${actualRowIndex}`;
        const googleSheetsData = [
          employee.employeeCode || "",
          employee.department || "",
          employee.employeeCode || "",
          employee.employeeName || "",
          employee.role || "",
          employee.reportTo || "",
          employee.email || "",
          "",
          "Deleted",
          employee.lastLogin?.toISOString() || new Date().toISOString(),
          "Deleted",
        ];
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [googleSheetsData] },
        });
      }
    } catch (sheetsError) {
      console.error("Error syncing deletion to Google Sheets:", sheetsError);
    }

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
