/**
 * Convert numbers to French text representation
 * Handles numbers from 0 to 999,999,999 (up to hundreds of millions)
 */

const UNITS = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
];

const TENS = [
  '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'
];


/**
 * Convert a number (0-99) to French text
 */
function convertTens(num: number): string {
  if (num < 20) {
    return UNITS[num];
  }

  const tens = Math.floor(num / 10);
  const units = num % 10;

  if (tens === 7) {
    // Special case for 70-79 (soixante-dix)
    return `soixante-${UNITS[10 + units]}`;
  } else if (tens === 9) {
    // Special case for 90-99 (quatre-vingt-dix)
    return `quatre-vingt-${UNITS[10 + units]}`;
  } else if (tens === 8 && units === 0) {
    // Special case for 80 (quatre-vingts with s)
    return 'quatre-vingts';
  } else {
    const tensText = TENS[tens];
    if (units === 0) {
      return tensText;
    } else if (units === 1 && (tens === 2 || tens === 3 || tens === 4 || tens === 5 || tens === 6)) {
      // Special case for 21, 31, 41, 51, 61 (et un)
      return `${tensText} et un`;
    } else {
      return `${tensText}-${UNITS[units]}`;
    }
  }
}

/**
 * Convert a number (0-999) to French text
 */
function convertHundreds(num: number): string {
  if (num === 0) return '';

  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;

  let result = '';

  if (hundreds > 0) {
    if (hundreds === 1) {
      result = 'cent';
    } else {
      result = `${UNITS[hundreds]} cent`;
    }

    // Add 's' to 'cent' if it's a multiple of 100 and greater than 100
    if (remainder === 0 && hundreds > 1) {
      result += 's';
    }
  }

  if (remainder > 0) {
    const remainderText = convertTens(remainder);
    if (result) {
      result += ` ${remainderText}`;
    } else {
      result = remainderText;
    }
  }

  return result;
}

/**
 * Convert a number to French text
 * @param num - Number to convert (0 to 999,999,999)
 * @returns French text representation of the number
 */
export function numberToFrench(num: number): string {
  if (num === 0) return 'zéro';
  if (num < 0) throw new Error('Negative numbers are not supported');
  if (num > 999999999) throw new Error('Numbers greater than 999,999,999 are not supported');

  // Handle integer conversion
  const integerPart = Math.floor(num);
  let result = '';
  let remaining = integerPart;

  // Process millions
  if (remaining >= 1000000) {
    const millions = Math.floor(remaining / 1000000);
    remaining = remaining % 1000000;

    const millionsText = convertHundreds(millions);
    if (millions === 1) {
      result += 'un million';
    } else {
      result += `${millionsText} millions`;
    }
  }

  // Process thousands
  if (remaining >= 1000) {
    const thousands = Math.floor(remaining / 1000);
    remaining = remaining % 1000;

    const thousandsText = convertHundreds(thousands);
    if (result) result += ' ';

    if (thousands === 1) {
      result += 'mille';
    } else {
      result += `${thousandsText} mille`;
    }
  }

  // Process hundreds, tens, and units
  if (remaining > 0) {
    const remainingText = convertHundreds(remaining);
    if (result) result += ' ';
    result += remainingText;
  }

  return result;
}

/**
 * Convert a number to French text with currency suffix
 * @param num - Number to convert
 * @param currency - Currency suffix (default: 'dirhams')
 * @returns French text representation with currency
 */
export function numberToFrenchCurrency(num: number, currency: string = 'dirhams'): string {
  const numberText = numberToFrench(num);

  // Capitalize first letter
  const capitalizedText = numberText.charAt(0).toUpperCase() + numberText.slice(1);

  return `${capitalizedText} ${currency}`;
}

/**
 * Format number as French currency text for UI display
 * @param num - Number to convert
 * @returns Formatted French currency text
 */
export function formatFrenchCurrency(num: number): string {
  return numberToFrenchCurrency(num, 'Dirhams');
}

// Export for testing
export { convertTens, convertHundreds };