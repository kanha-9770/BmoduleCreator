export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { parseEmployeeData, analyzeRecordDataStructure } from '@/lib/employeeDataParser';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching employee records from FormRecord14...');
    
    // Fetch employee records from FormRecord14
    const records = await prisma.formRecord14.findMany({
      select: {
        id: true,
        employee_id: true,
        recordData: true,
        submittedAt: true,
        status: true,
        userId: true,
      },
      where: {
        status: 'submitted', // Only get submitted records
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    console.log(`Found ${records.length} records in FormRecord14`);

    // Parse records and filter out those where user already exists
    const recordsWithoutUser = [];
    
    for (const record of records) {
      // Parse the record data
      const parsedData = parseEmployeeData(record.recordData);
      
      // Debug: Analyze record structure for the first record
      if (recordsWithoutUser.length === 0) {
        const analysis = analyzeRecordDataStructure(record.recordData);
        console.log('Record structure analysis:', analysis);
      }
      // Skip records without essential data
      if (!parsedData.employeeName || !parsedData.email) {
        console.log(`Skipping record ${record.id}: missing essential data`, {
          hasName: !!parsedData.employeeName,
          hasEmail: !!parsedData.email
        });
        continue;
      }

      // Check if a user already exists with this email
      const existingUser = await prisma.user.findUnique({
        where: { email: parsedData.email }
      });

      // Check if employee record exists in Employee table
      let employee = null;
      if (record.employee_id) {
        employee = await prisma.employee.findUnique({
          where: { id: record.employee_id }
        });
      }

      // Only include if no user exists with this email
      if (!existingUser) {
        recordsWithoutUser.push({
          ...record,
          parsedData,
          hasEmployeeRecord: !!employee,
          // Include debug info in development
          ...(process.env.NODE_ENV === 'development' && {
            _debug: {
              originalRecordData: record.recordData,
              parsedFields: Object.keys(parsedData).filter(key => parsedData[key as keyof typeof parsedData])
            }
          })
        });
      } else {
        console.log(`Skipping record ${record.id}: user already exists with email ${parsedData.email}`);
      }
    }

    console.log(`Returning ${recordsWithoutUser.length} available records for user creation`);

    return NextResponse.json({
      success: true,
      records: recordsWithoutUser,
      total: recordsWithoutUser.length,
      // Include metadata for debugging
      ...(process.env.NODE_ENV === 'development' && {
        _metadata: {
          totalRecordsInDB: records.length,
          recordsWithoutUsers: recordsWithoutUser.length,
          skippedRecords: records.length - recordsWithoutUser.length
        }
      })
    });
  } catch (error) {
    console.error('Error fetching employee records:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch employee records',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}