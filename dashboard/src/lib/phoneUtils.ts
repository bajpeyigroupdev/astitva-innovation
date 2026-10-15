/**
 * International Phone Number Normalization and Validation
 * Standardizes user phone inputs to official E.164 format for Meta WhatsApp Cloud API.
 */

export interface NormalizedPhone {
  rawDigits: string;     // e.g. "917233882089" (digits only, required by Meta API payload)
  e164: string;          // e.g. "+917233882089" (standard international E.164 with plus)
  display: string;       // e.g. "+91 7233882089"
  isValid: boolean;
  errorMessage?: string;
}

export function normalizePhoneNumber(input: string, defaultCountryCode: string = '91'): NormalizedPhone {
  if (!input || typeof input !== 'string') {
    return {
      rawDigits: '',
      e164: '',
      display: '',
      isValid: false,
      errorMessage: 'Phone number is required.',
    };
  }

  // Strip all non-digit characters
  let digits = input.replace(/\D/g, '');

  // If leading zeros (e.g. 07233882089), strip the single leading zero if resulting length is 10
  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  // If 10 digits provided without country code (common in India), prepend defaultCountryCode
  if (digits.length === 10) {
    digits = `${defaultCountryCode}${digits}`;
  }

  // Validate E.164 length (Meta requirements: 10 to 15 digits including country code)
  if (digits.length < 10) {
    return {
      rawDigits: digits,
      e164: digits ? `+${digits}` : '',
      display: digits ? `+${digits}` : '',
      isValid: false,
      errorMessage: 'Phone number is too short. Include country code (min 10 digits).',
    };
  }

  if (digits.length > 15) {
    return {
      rawDigits: digits,
      e164: `+${digits}`,
      display: `+${digits}`,
      isValid: false,
      errorMessage: 'Phone number exceeds maximum E.164 length of 15 digits.',
    };
  }

  // Construct display format: +<countryCode> <remainingDigits>
  let display = `+${digits}`;
  if (digits.startsWith('91') && digits.length === 12) {
    display = `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  } else if (digits.length >= 11) {
    display = `+${digits.slice(0, 2)} ${digits.slice(2)}`;
  }

  return {
    rawDigits: digits,
    e164: `+${digits}`,
    display,
    isValid: true,
  };
}
