import { ExtractedIDData } from '../types/idScanner';

export interface Person {
  salutation: string;
  lastName: string;
  firstName: string;
  idNumber: string;
  nationality: string;
  passportNumber: string;
  residencePermit: string;
  birthDate: string;
  birthPlace: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  occupation: string;
  maritalStatus: string;
  widowed: boolean;
  numberOfChildren: string;
  usCitizen: string;
  tin: string;
}

export class FieldMappingService {
  static mapExtractedDataToPerson(extractedData: ExtractedIDData, currentPerson: Person): Partial<Person> {
    const mappedData: Partial<Person> = {};

    // Direct mappings
    if (extractedData.firstName?.trim()) {
      mappedData.firstName = extractedData.firstName.trim();
    }

    if (extractedData.lastName?.trim()) {
      mappedData.lastName = extractedData.lastName.trim();
    }

    if (extractedData.idNumber?.trim()) {
      mappedData.idNumber = extractedData.idNumber.trim();
    }

    if (extractedData.nationality?.trim()) {
      mappedData.nationality = this.mapNationalityToFormValue(extractedData.nationality.trim());
    }

    if (extractedData.birthDate?.trim()) {
      // Convert from DD/MM/YYYY to YYYY-MM-DD for HTML date input
      const convertedDate = this.convertDateFormat(extractedData.birthDate.trim());
      if (convertedDate) {
        mappedData.birthDate = convertedDate;
      }
    }

    if (extractedData.birthPlace?.trim()) {
      mappedData.birthPlace = extractedData.birthPlace.trim();
    }

    if (extractedData.address?.trim()) {
      mappedData.address = extractedData.address.trim();
    }

    if (extractedData.city?.trim()) {
      mappedData.city = extractedData.city.trim();
    }

    // Set country for Moroccan CIN
    if (extractedData.nationality?.toLowerCase().includes('maroc')) {
      mappedData.country = 'Maroc';
    }

    return mappedData;
  }

  private static mapNationalityToFormValue(nationality: string): string {
    const normalizedNationality = nationality.toLowerCase().trim();

    // Map common variations to French form values
    const nationalityMap: Record<string, string> = {
      'marocaine': 'Maroc',
      'moroccan': 'Maroc',
      'maroc': 'Maroc',
      'morocco': 'Maroc',
      'française': 'France',
      'french': 'France',
      'france': 'France',
      'américaine': 'États-Unis',
      'american': 'États-Unis',
      'usa': 'États-Unis',
      'united states': 'États-Unis',
      'allemande': 'Allemagne',
      'german': 'Allemagne',
      'germany': 'Allemagne',
      'espagnole': 'Espagne',
      'spanish': 'Espagne',
      'spain': 'Espagne',
      'britannique': 'Royaume-Uni',
      'british': 'Royaume-Uni',
      'uk': 'Royaume-Uni',
      'united kingdom': 'Royaume-Uni',
      'italienne': 'Italie',
      'italian': 'Italie',
      'italy': 'Italie',
      'belge': 'Belgique',
      'belgian': 'Belgique',
      'belgium': 'Belgique',
      'néerlandaise': 'Pays-Bas',
      'dutch': 'Pays-Bas',
      'netherlands': 'Pays-Bas',
      'portugaise': 'Portugal',
      'portuguese': 'Portugal',
      'portugal': 'Portugal',
      'suisse': 'Suisse',
      'swiss': 'Suisse',
      'switzerland': 'Suisse',
      'canadienne': 'Canada',
      'canadian': 'Canada',
      'canada': 'Canada',
      'algérienne': 'Algérie',
      'algerian': 'Algérie',
      'algeria': 'Algérie',
      'tunisienne': 'Tunisie',
      'tunisian': 'Tunisie',
      'tunisia': 'Tunisie',
      'turque': 'Turquie',
      'turkish': 'Turquie',
      'turkey': 'Turquie',
      'chinoise': 'Chine',
      'chinese': 'Chine',
      'china': 'Chine',
      'indienne': 'Inde',
      'indian': 'Inde',
      'india': 'Inde'
    };

    return nationalityMap[normalizedNationality] || nationality;
  }

  private static convertDateFormat(dateStr: string): string | null {
    try {
      // Handle DD/MM/YYYY format
      const ddmmyyyyRegex = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/;
      const match = dateStr.match(ddmmyyyyRegex);

      if (match) {
        const [, day, month, year] = match;
        const paddedDay = day.padStart(2, '0');
        const paddedMonth = month.padStart(2, '0');

        // Validate date
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (date.getFullYear() === parseInt(year) &&
            date.getMonth() === parseInt(month) - 1 &&
            date.getDate() === parseInt(day)) {
          return `${year}-${paddedMonth}-${paddedDay}`;
        }
      }

      return null;
    } catch (error) {
      console.warn('Date conversion error:', error);
      return null;
    }
  }

  static getConfidenceLevel(extractedData: ExtractedIDData): 'high' | 'medium' | 'low' {
    if (extractedData.confidence >= 0.8) return 'high';
    if (extractedData.confidence >= 0.5) return 'medium';
    return 'low';
  }

  static getConfidenceLevelColor(level: 'high' | 'medium' | 'low'): string {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  static getConfidenceLevelText(level: 'high' | 'medium' | 'low'): string {
    switch (level) {
      case 'high': return 'Confiance élevée';
      case 'medium': return 'Confiance moyenne';
      case 'low': return 'Confiance faible';
      default: return 'Confiance inconnue';
    }
  }

  static generateScanSummary(extractedData: ExtractedIDData): string[] {
    const summary: string[] = [];

    if (extractedData.firstName) summary.push(`Prénom: ${extractedData.firstName}`);
    if (extractedData.lastName) summary.push(`Nom: ${extractedData.lastName}`);
    if (extractedData.idNumber) summary.push(`N° CIN: ${extractedData.idNumber}`);
    if (extractedData.birthDate) summary.push(`Date de naissance: ${extractedData.birthDate}`);
    if (extractedData.birthPlace) summary.push(`Lieu de naissance: ${extractedData.birthPlace}`);
    if (extractedData.nationality) summary.push(`Nationalité: ${extractedData.nationality}`);
    if (extractedData.address) summary.push(`Adresse: ${extractedData.address}`);

    return summary;
  }
}