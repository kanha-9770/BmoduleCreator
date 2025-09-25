import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { parseEmployeeData } from '@/lib/employeeDataParser';
import { generateJWT, generateSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating user from employee record...');
    const body = await request.json();
    const { 
      employeeRecordId, 
      employee_id, 
      employeeName, 
      email, 
      password,
      confirmPassword
    } = body;

    console.log('Request data:', { employeeRecordId, employee_id, employeeName, email, hasPassword: !!password });

    // Validate required fields
    if (!employeeRecordId || !employee_id || !employeeName || !email || !password) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('User already exists with email:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Verify the form record exists in FormRecord14
    const formRecord = await prisma.formRecord14.findUnique({
      where: { id: employeeRecordId }
    });

    if (!formRecord) {
      console.log('Form record not found:', employeeRecordId);
      return NextResponse.json(
        { error: 'Employee form record not found' },
        { status: 404 }
      );
    }

    // Parse the form record data
    const parsedData = parseEmployeeData(formRecord.recordData);

    console.log('Parsed employee data:', parsedData);

    // Validate essential parsed data
    if (!parsedData.employeeName || !parsedData.email) {
      console.log('Missing essential parsed data:', { 
        hasName: !!parsedData.employeeName, 
        hasEmail: !!parsedData.email 
      });
      return NextResponse.json(
        { error: 'Unable to extract essential employee information from form data' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Extract names
    const nameParts = employeeName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Convert date strings to Date objects
    const dobDate = parsedData.dob && parsedData.dob !== '0000-00-00' ? new Date(parsedData.dob) : null;
    const joiningDate = parsedData.dateOfJoining && parsedData.dateOfJoining !== '0000-00-00' ? new Date(parsedData.dateOfJoining) : null;
    const leavingDate = parsedData.dateOfLeaving && parsedData.dateOfLeaving !== '0000-00-00' ? new Date(parsedData.dateOfLeaving) : null;

    // Map status from form to Employee enum
    const mapEmployeeStatus = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'active': return 'ACTIVE';
        case 'inactive': return 'INACTIVE';
        case 'on leave': return 'ON_LEAVE';
        default: return 'ACTIVE';
      }
    };

    // Map gender from form to User enum
    const mapGender = (gender: string) => {
      switch (gender?.toLowerCase()) {
        case 'male': return 'MALE';
        case 'female': return 'FEMALE';
        default: return 'OTHER';
      }
    };

    console.log('Starting database transaction...');
    // Create user and employee with transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName || null,
          email_verified: true, // Auto-verify since we're creating from employee data
          status: 'ACTIVE',
          provider: 'EMAIL',
          department: parsedData.department || null,
          phone: parsedData.phone || null,
          joinDate: joiningDate,
          // Add employee reference - this will be set after employee creation
        }
      });

      console.log('User created:', newUser.id);

      // Create or update employee record
      let employee;
      if (employee_id) {
        // Try to find existing employee
        employee = await tx.employee.findUnique({
          where: { id: employee_id }
        });
      }

      if (employee) {
        console.log('Updating existing employee:', employee_id);
        // Update existing employee
        employee = await tx.employee.update({
          where: { id: employee_id },
          data: {
            userId: newUser.id,
            employeeName: parsedData.employeeName,
            emailAddress1: parsedData.email,
            emailAddress2: parsedData.emailAddress2 || null,
            department: parsedData.department || null,
            designation: parsedData.designation || null,
            personalContact: parsedData.phone || null,
            alternateNo1: parsedData.alternateNo1 || null,
            alternateNo2: parsedData.alternateNo2 || null,
          }
        });
      } else {
        console.log('Creating new employee record');
        // Create new employee record
        employee = await tx.employee.create({
          data: {
            userId: newUser.id,
            employeeName: parsedData.employeeName || employeeName,
            gender: mapGender(parsedData.gender),
            department: parsedData.department || null,
            designation: parsedData.designation || null,
            dob: dobDate,
            nativePlace: parsedData.nativePlace || null,
            country: parsedData.country || null,
            permanentAddress: parsedData.permanentAddress || null,
            currentAddress: parsedData.currentAddress || null,
            personalContact: parsedData.phone || null,
            alternateNo1: parsedData.alternateNo1 || null,
            alternateNo2: parsedData.alternateNo2 || null,
            emailAddress1: parsedData.email || email,
            emailAddress2: parsedData.emailAddress2 || null,
            bankName: parsedData.bankName || null,
            bankAccountNo: parsedData.bankAccountNo || null,
            ifscCode: parsedData.ifscCode || null,
            status: mapEmployeeStatus(parsedData.status),
            shiftType: parsedData.shiftType || null,
            inTime: parsedData.inTime || null,
            outTime: parsedData.outTime || null,
            dateOfJoining: joiningDate,
            dateOfLeaving: leavingDate,
            totalSalary: parsedData.totalSalary ? parseFloat(parsedData.totalSalary) : null,
            givenSalary: parsedData.givenSalary ? parseFloat(parsedData.givenSalary) : null,
            bonusAmount: parsedData.bonusAmount ? parseFloat(parsedData.bonusAmount) : null,
            nightAllowance: parsedData.nightAllowance ? parseFloat(parsedData.nightAllowance) : null,
            overTime: parsedData.overTime ? parseFloat(parsedData.overTime) : null,
            oneHourExtra: parsedData.oneHourExtra ? parseFloat(parsedData.oneHourExtra) : null,
            incrementMonth: parsedData.incrementMonth ? parseInt(parsedData.incrementMonth) || null : null,
            yearsOfAgreement: parsedData.yearsOfAgreement ? parseInt(parsedData.yearsOfAgreement) || null : null,
            bonusAfterYears: parsedData.bonusAfterYears ? parseInt(parsedData.bonusAfterYears) || null : null,
            companyName: parsedData.companyName || null,
            aadharCardUpload: parsedData.aadharCardUpload || null,
            aadharCardNo: parsedData.aadharCardNo || null,
            panCardUpload: parsedData.panCardUpload || null,
            passportUpload: parsedData.passportUpload || null,
            companySimIssue: parsedData.companySimIssue,
          }
        });
      }

      console.log('Employee record processed:', employee.id);
      return { user: newUser, employee };
    });

    console.log('Transaction completed successfully');

    // Update the FormRecord14 to mark it as processed (optional)
    await prisma.formRecord14.update({
      where: { id: employeeRecordId },
      data: {
        employee_id: result.employee.id, // Link the form record to the employee
      }
    });

    // Create initial session for the new user (optional)
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const session = await prisma.userSession.create({
      data: {
        userId: result.user.id,
        token: sessionToken,
        expiresAt,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    // Generate JWT token for additional authentication
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const jwtToken = generateJWT(
      {
        userId: result.user.id,
        email: result.user.email,
        employeeId: result.employee.id,
        sessionId: session.id
      },
      jwtSecret,
      '7d'
    );

    console.log('User creation completed successfully');

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: `${result.user.first_name} ${result.user.last_name || ''}`.trim(),
        employee_id: result.employee.id,
        sessionToken,
        jwtToken,
        expiresAt: expiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating user from employee:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined
        })
      },
      { status: 500 }
    );
  }
}