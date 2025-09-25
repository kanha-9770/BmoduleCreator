// Dynamic employee data parser that handles variable JSON structures
export interface ParsedEmployeeData {
  employeeId?: string;
  employeeName?: string;
  email?: string;
  emailAddress2?: string;
  department?: string;
  designation?: string;
  phone?: string;
  status?: string;
  gender?: string;
  dob?: string;
  nativePlace?: string;
  country?: string;
  permanentAddress?: string;
  currentAddress?: string;
  alternateNo1?: string;
  alternateNo2?: string;
  bankName?: string;
  bankAccountNo?: string;
  ifscCode?: string;
  shiftType?: string;
  inTime?: string;
  outTime?: string;
  dateOfJoining?: string;
  dateOfLeaving?: string;
  incrementMonth?: string;
  yearsOfAgreement?: string;
  bonusAfterYears?: string;
  companyName?: string;
  totalSalary?: string;
  givenSalary?: string;
  bonusAmount?: string;
  nightAllowance?: string;
  overTime?: string;
  oneHourExtra?: string;
  companySimIssue?: boolean;
  aadharCardUpload?: string;
  aadharCardNo?: string;
  panCardUpload?: string;
  passportUpload?: string;
  [key: string]: string | boolean | undefined;
}

// Field mapping patterns - these are flexible patterns that can match various field labels
const FIELD_PATTERNS = {
  employeeId: [
    /employee\s*id/i,
    /emp\s*id/i,
    /employee\s*number/i,
    /emp\s*no/i,
    /staff\s*id/i
  ],
  employeeName: [
    /employee\s*name/i,
    /emp\s*name/i,
    /full\s*name/i,
    /name/i,
    /staff\s*name/i
  ],
  email: [
    /email\s*address\s*1/i,
    /primary\s*email/i,
    /email\s*1/i,
    /email/i,
    /mail/i
  ],
  emailAddress2: [
    /email\s*address\s*2/i,
    /secondary\s*email/i,
    /email\s*2/i,
    /alternate\s*email/i
  ],
  department: [
    /department/i,
    /dept/i,
    /division/i,
    /section/i
  ],
  designation: [
    /designation/i,
    /position/i,
    /job\s*title/i,
    /role/i,
    /post/i
  ],
  phone: [
    /personal\s*contact/i,
    /phone/i,
    /mobile/i,
    /contact/i,
    /cell/i,
    /primary\s*phone/i
  ],
  status: [
    /status/i,
    /employee\s*status/i,
    /work\s*status/i,
    /employment\s*status/i
  ],
  gender: [
    /sex/i,
    /gender/i,
    /male.*female/i
  ],
  dob: [
    /dob/i,
    /date\s*of\s*birth/i,
    /birth\s*date/i,
    /birthday/i
  ],
  nativePlace: [
    /native/i,
    /native\s*place/i,
    /birth\s*place/i,
    /hometown/i
  ],
  country: [
    /country/i,
    /belong\s*country/i,
    /nationality/i,
    /nation/i
  ],
  permanentAddress: [
    /permanent\s*address/i,
    /home\s*address/i,
    /permanent\s*addr/i
  ],
  currentAddress: [
    /current\s*address/i,
    /present\s*address/i,
    /current\s*addr/i,
    /mailing\s*address/i
  ],
  alternateNo1: [
    /alt\s*no\.?\s*1/i,
    /alternate\s*number\s*1/i,
    /alternative\s*phone\s*1/i,
    /second\s*phone/i
  ],
  alternateNo2: [
    /alt\s*no\.?\s*2/i,
    /alternate\s*number\s*2/i,
    /alternative\s*phone\s*2/i,
    /third\s*phone/i
  ],
  bankName: [
    /bank\s*name/i,
    /bank/i,
    /financial\s*institution/i
  ],
  bankAccountNo: [
    /bank\s*account\s*number/i,
    /account\s*number/i,
    /account\s*no/i,
    /bank\s*acc/i
  ],
  ifscCode: [
    /ifsc\s*code/i,
    /ifsc/i,
    /bank\s*code/i,
    /routing\s*number/i
  ],
  shiftType: [
    /shift\s*type/i,
    /shift/i,
    /work\s*shift/i,
    /duty\s*shift/i
  ],
  inTime: [
    /in\s*time/i,
    /start\s*time/i,
    /check\s*in/i,
    /entry\s*time/i
  ],
  outTime: [
    /out\s*time/i,
    /end\s*time/i,
    /check\s*out/i,
    /exit\s*time/i
  ],
  dateOfJoining: [
    /date\s*of\s*joining/i,
    /joining\s*date/i,
    /start\s*date/i,
    /hire\s*date/i,
    /employment\s*date/i
  ],
  dateOfLeaving: [
    /date\s*of\s*leaving/i,
    /leaving\s*date/i,
    /end\s*date/i,
    /termination\s*date/i,
    /resignation\s*date/i
  ],
  incrementMonth: [
    /increment\s*month/i,
    /salary\s*increment\s*month/i,
    /raise\s*month/i
  ],
  yearsOfAgreement: [
    /year.*agreement/i,
    /contract\s*years/i,
    /agreement\s*period/i,
    /bond\s*years/i
  ],
  bonusAfterYears: [
    /bonus\s*after.*years/i,
    /bonus\s*eligibility/i,
    /bonus\s*years/i
  ],
  companyName: [
    /company\s*name/i,
    /organization/i,
    /employer/i,
    /firm/i
  ],
  totalSalary: [
    /total\s*salary/i,
    /gross\s*salary/i,
    /full\s*salary/i,
    /complete\s*salary/i
  ],
  givenSalary: [
    /given\s*salary/i,
    /net\s*salary/i,
    /take\s*home/i,
    /actual\s*salary/i,
    /paid\s*salary/i
  ],
  bonusAmount: [
    /bonus\s*amount/i,
    /bouns\s*amount/i, // Handle typo
    /bonus/i,
    /incentive/i
  ],
  nightAllowance: [
    /night\s*allowance/i,
    /night\s*shift\s*allowance/i,
    /night\s*pay/i
  ],
  overTime: [
    /over\s*time/i,
    /overtime/i,
    /ot/i,
    /extra\s*hours/i
  ],
  oneHourExtra: [
    /1\s*hour\s*extra/i,
    /one\s*hour\s*extra/i,
    /extra\s*hour/i,
    /additional\s*hour/i
  ],
  companySimIssue: [
    /company\s*sim\s*issue/i,
    /sim\s*provided/i,
    /company\s*sim/i,
    /mobile\s*sim/i
  ],
  aadharCardUpload: [
    /aadhar\s*card\s*upload/i,
    /adhar\s*card\s*upload/i, // Handle typo
    /aadhaar\s*upload/i,
    /aadhar\s*file/i
  ],
  aadharCardNo: [
    /aadhar\s*card\s*number/i,
    /adhar\s*card\s*number/i, // Handle typo
    /aadhaar\s*number/i,
    /aadhar\s*no/i
  ],
  panCardUpload: [
    /pan\s*card\s*upload/i,
    /pan\s*upload/i,
    /pan\s*file/i
  ],
  passportUpload: [
    /passport\s*upload/i,
    /passport\s*file/i,
    /passport\s*copy/i
  ]
};

/**
 * Dynamically parse employee data from variable JSON structure
 * @param recordData - The dynamic JSON structure from form submission
 * @returns Parsed employee data with standardized field names
 */
export function parseEmployeeData(recordData: any): ParsedEmployeeData {
  const parsed: ParsedEmployeeData = {};

  // Handle null, undefined, or non-object data
  if (!recordData || typeof recordData !== 'object') {
    console.warn('Invalid recordData provided:', recordData);
    return parsed;
  }

  try {
    // Iterate through all fields in the recordData
    Object.values(recordData).forEach((field: any) => {
      // Skip invalid field structures
      if (!field || typeof field !== 'object' || !field.label || field.value === undefined) {
        return;
      }

      const label = String(field.label).trim();
      const value = field.value;

      // Skip empty values
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return;
      }

      // Match field label against patterns
      for (const [fieldKey, patterns] of Object.entries(FIELD_PATTERNS)) {
        const isMatch = patterns.some(pattern => pattern.test(label));
        
        if (isMatch) {
          // Handle special cases for different field types
          switch (fieldKey) {
            case 'companySimIssue':
              parsed[fieldKey] = String(value).toLowerCase() === 'yes';
              break;
            
            case 'dob':
            case 'dateOfJoining':
            case 'dateOfLeaving':
              // Ensure date format is valid
              const dateValue = String(value).trim();
              if (dateValue && dateValue !== '0000-00-00') {
                parsed[fieldKey] = dateValue;
              }
              break;
            
            case 'phone':
            case 'alternateNo1':
            case 'alternateNo2':
            case 'bankAccountNo':
            case 'aadharCardNo':
              // Clean phone numbers and account numbers
              const cleanedNumber = String(value).replace(/\D/g, '');
              if (cleanedNumber.length > 0) {
                parsed[fieldKey] = cleanedNumber;
              }
              break;
            
            case 'totalSalary':
            case 'givenSalary':
            case 'bonusAmount':
            case 'nightAllowance':
            case 'overTime':
            case 'oneHourExtra':
              // Handle numeric values
              const numericValue = String(value).replace(/[^\d.]/g, '');
              if (numericValue && !isNaN(parseFloat(numericValue))) {
                parsed[fieldKey] = numericValue;
              }
              break;
            
            case 'yearsOfAgreement':
            case 'bonusAfterYears':
              // Handle integer values
              const intValue = String(value).replace(/\D/g, '');
              if (intValue && !isNaN(parseInt(intValue))) {
                parsed[fieldKey] = intValue;
              }
              break;
            
            default:
              // Handle text fields
              const textValue = String(value).trim();
              if (textValue) {
                parsed[fieldKey] = textValue;
              }
              break;
          }
          
          // Break after first match to avoid overwriting
          break;
        }
      }
    });

    // Post-processing validation and cleanup
    validateAndCleanParsedData(parsed);

  } catch (error) {
    console.error('Error parsing employee data:', error);
  }

  return parsed;
}

/**
 * Validate and clean parsed data
 */
function validateAndCleanParsedData(parsed: ParsedEmployeeData): void {
  // Validate email format
  if (parsed.email && !isValidEmail(parsed.email)) {
    console.warn('Invalid email format detected:', parsed.email);
    delete parsed.email;
  }

  if (parsed.emailAddress2 && !isValidEmail(parsed.emailAddress2)) {
    console.warn('Invalid secondary email format detected:', parsed.emailAddress2);
    delete parsed.emailAddress2;
  }

  // Validate phone numbers (should be at least 10 digits)
  ['phone', 'alternateNo1', 'alternateNo2'].forEach(field => {
    const phoneValue = parsed[field as keyof ParsedEmployeeData] as string;
    if (phoneValue && phoneValue.length < 10) {
      console.warn(`Invalid phone number format for ${field}:`, phoneValue);
      delete parsed[field as keyof ParsedEmployeeData];
    }
  });

  // Validate dates
  ['dob', 'dateOfJoining', 'dateOfLeaving'].forEach(field => {
    const dateValue = parsed[field as keyof ParsedEmployeeData] as string;
    if (dateValue && !isValidDate(dateValue)) {
      console.warn(`Invalid date format for ${field}:`, dateValue);
      delete parsed[field as keyof ParsedEmployeeData];
    }
  });

  // Ensure essential fields are present
  if (!parsed.employeeName && !parsed.email) {
    console.warn('Missing essential employee data: both name and email are empty');
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate date format
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString !== '0000-00-00';
}

/**
 * Get field mapping suggestions for debugging
 */
export function getFieldMappingSuggestions(recordData: any): { [key: string]: string[] } {
  const suggestions: { [key: string]: string[] } = {};
  
  if (!recordData || typeof recordData !== 'object') {
    return suggestions;
  }

  Object.values(recordData).forEach((field: any) => {
    if (!field || !field.label) return;
    
    const label = String(field.label).trim();
    const matchedFields: string[] = [];
    
    for (const [fieldKey, patterns] of Object.entries(FIELD_PATTERNS)) {
      const isMatch = patterns.some(pattern => pattern.test(label));
      if (isMatch) {
        matchedFields.push(fieldKey);
      }
    }
    
    if (matchedFields.length > 0) {
      suggestions[label] = matchedFields;
    }
  });
  
  return suggestions;
}

/**
 * Debug function to analyze recordData structure
 */
export function analyzeRecordDataStructure(recordData: any): {
  totalFields: number;
  mappedFields: number;
  unmappedFields: string[];
  fieldTypes: { [key: string]: number };
} {
  const analysis = {
    totalFields: 0,
    mappedFields: 0,
    unmappedFields: [] as string[],
    fieldTypes: {} as { [key: string]: number }
  };

  if (!recordData || typeof recordData !== 'object') {
    return analysis;
  }

  Object.values(recordData).forEach((field: any) => {
    if (!field || !field.label) return;
    
    analysis.totalFields++;
    
    const label = String(field.label).trim();
    const fieldType = field.type || 'unknown';
    
    // Count field types
    analysis.fieldTypes[fieldType] = (analysis.fieldTypes[fieldType] || 0) + 1;
    
    // Check if field is mapped
    let isMapped = false;
    for (const patterns of Object.values(FIELD_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(label))) {
        isMapped = true;
        break;
      }
    }
    
    if (isMapped) {
      analysis.mappedFields++;
    } else {
      analysis.unmappedFields.push(label);
    }
  });

  return analysis;
}