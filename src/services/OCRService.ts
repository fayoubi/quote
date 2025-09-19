import { ExtractedIDData, IDType, MoroccanCINPattern, ProcessedFile } from '../types/idScanner';

export class OCRService {
  private static readonly MOROCCAN_CIN_PATTERNS: MoroccanCINPattern = {
    cinRegex: /\b[A-Z]{1,2}\d{6}\b/g,
    namePatterns: [
      'nom\\s*:?\\s*([A-ZÀ-ÿ\\s]+)',
      'prénom\\s*:?\\s*([A-ZÀ-ÿ\\s]+)',
      'prenom\\s*:?\\s*([A-ZÀ-ÿ\\s]+)',
    ],
    datePatterns: [
      '(\\d{2})[/\\-\\.](\\d{2})[/\\-\\.](\\d{4})',
      '(\\d{2})[/\\-\\.](\\d{2})[/\\-\\.](\\d{2})',
    ],
    placePatterns: [
      'né\\(e\\)\\s*à\\s*:?\\s*([A-ZÀ-ÿ\\s]+)',
      'lieu\\s*de\\s*naissance\\s*:?\\s*([A-ZÀ-ÿ\\s]+)',
      'naissance\\s*:?\\s*([A-ZÀ-ÿ\\s]+)',
    ]
  };

  static async extractTextFromImage(file: File): Promise<string> {
    // For MVP, we'll use a simple OCR simulation
    // In production, this would integrate with Google Vision API or AWS Textract

    return new Promise((resolve) => {
      // Simulate OCR processing time
      setTimeout(() => {
        // Mock OCR result for Moroccan CIN
        const mockOCRText = `
          ROYAUME DU MAROC
          CARTE NATIONALE D'IDENTITÉ

          Nom: ALAOUI
          Prénom: MOHAMMED

          Né(e) le: 15/03/1985
          À: CASABLANCA

          Nationalité: MAROCAINE

          N° CIN: A123456

          Adresse: 123 RUE MOHAMMED V
          CASABLANCA

          Date de délivrance: 01/01/2020
          Date d'expiration: 01/01/2030
        `;
        resolve(mockOCRText);
      }, 2000);
    });
  }

  static async extractTextFromPDF(file: File): Promise<string> {
    // For MVP, we'll use a simple PDF OCR simulation
    // In production, this would use PDF.js + OCR or cloud services

    return new Promise((resolve) => {
      // Simulate PDF processing time (longer than images)
      setTimeout(() => {
        // Mock OCR result for PDF containing Moroccan CIN
        const mockPDFText = `
          ROYAUME DU MAROC
          CARTE NATIONALE D'IDENTITÉ

          Page 1 de 2

          Nom: BENALI
          Prénom: FATIMA

          Né(e) le: 22/07/1990
          À: RABAT

          Nationalité: MAROCAINE

          N° CIN: B789012

          Adresse: 456 AVENUE HASSAN II
          RABAT

          Date de délivrance: 15/06/2021
          Date d'expiration: 15/06/2031

          --- Page 2 ---
          Verso de la carte avec informations additionnelles
        `;
        resolve(mockPDFText);
      }, 3000);
    });
  }

  static extractMoroccanCINData(text: string): ExtractedIDData {
    const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let extractedData: Partial<ExtractedIDData> = {
      nationality: 'Maroc', // Default for Moroccan CIN
      confidence: 0.8
    };

    // Extract CIN number
    const cinMatch = normalizedText.match(this.MOROCCAN_CIN_PATTERNS.cinRegex);
    if (cinMatch) {
      extractedData.idNumber = cinMatch[0];
    }

    // Extract names using multiple patterns
    for (const pattern of this.MOROCCAN_CIN_PATTERNS.namePatterns) {
      const regex = new RegExp(pattern, 'gi');
      const match = normalizedText.match(regex);
      if (match) {
        const cleanMatch = match[0].replace(/nom\\s*:?\\s*/gi, '').replace(/prénom\\s*:?\\s*/gi, '').trim();
        if (pattern.includes('nom') && !extractedData.lastName) {
          extractedData.lastName = this.capitalizeWords(cleanMatch);
        } else if (pattern.includes('prénom') && !extractedData.firstName) {
          extractedData.firstName = this.capitalizeWords(cleanMatch);
        }
      }
    }

    // Extract dates
    for (const pattern of this.MOROCCAN_CIN_PATTERNS.datePatterns) {
      const regex = new RegExp(pattern, 'g');
      const match = normalizedText.match(regex);
      if (match && !extractedData.birthDate) {
        const dateStr = match[0];
        // Convert to DD/MM/YYYY format
        const dateParts = dateStr.split(/[/\\-\\.]/);
        if (dateParts.length === 3) {
          const [day, month, year] = dateParts;
          // Handle 2-digit years (assume 19xx or 20xx)
          const fullYear = year.length === 2 ?
            (parseInt(year) > 30 ? `19${year}` : `20${year}`) : year;
          extractedData.birthDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${fullYear}`;
        }
      }
    }

    // Extract birth place
    for (const pattern of this.MOROCCAN_CIN_PATTERNS.placePatterns) {
      const regex = new RegExp(pattern, 'gi');
      const match = normalizedText.match(regex);
      if (match && !extractedData.birthPlace) {
        const cleanMatch = match[0]
          .replace(/né\\(e\\)\\s*à\\s*:?\\s*/gi, '')
          .replace(/lieu\\s*de\\s*naissance\\s*:?\\s*/gi, '')
          .replace(/naissance\\s*:?\\s*/gi, '')
          .trim();
        extractedData.birthPlace = this.capitalizeWords(cleanMatch);
        extractedData.city = this.capitalizeWords(cleanMatch); // Often birth place is current city
      }
    }

    // Extract address (look for street patterns)
    const addressPatterns = [
      'adresse\\s*:?\\s*([^\\n]+)',
      '\\d+\\s+[A-ZÀ-ÿ\\s]+(?:RUE|AVENUE|BOULEVARD|BD|AV)',
    ];

    for (const pattern of addressPatterns) {
      const regex = new RegExp(pattern, 'gi');
      const match = normalizedText.match(regex);
      if (match && !extractedData.address) {
        const cleanMatch = match[0].replace(/adresse\\s*:?\\s*/gi, '').trim();
        extractedData.address = this.capitalizeWords(cleanMatch);
      }
    }

    return {
      ...extractedData,
      rawText: text,
      confidence: this.calculateConfidence(extractedData)
    } as ExtractedIDData;
  }

  private static capitalizeWords(text: string): string {
    return text.toLowerCase().replace(/\\b\\w/g, l => l.toUpperCase());
  }

  private static calculateConfidence(data: Partial<ExtractedIDData>): number {
    let score = 0;
    const maxScore = 7;

    if (data.firstName) score += 1;
    if (data.lastName) score += 1;
    if (data.idNumber) score += 2; // CIN is most important
    if (data.birthDate) score += 1;
    if (data.birthPlace) score += 1;
    if (data.nationality) score += 0.5;
    if (data.address) score += 0.5;

    return Math.min(score / maxScore, 1);
  }

  static async processIDDocument(file: File, idType: IDType): Promise<ExtractedIDData> {
    try {
      let text: string;

      // Determine processing method based on file type
      if (file.type === 'application/pdf') {
        text = await this.extractTextFromPDF(file);
      } else {
        text = await this.extractTextFromImage(file);
      }

      switch (idType) {
        case 'moroccan_cin':
          return this.extractMoroccanCINData(text);
        case 'us_id':
        case 'passport':
        case 'other':
        default:
          // For MVP, only support Moroccan CIN
          return {
            rawText: text,
            confidence: 0.1,
            firstName: '',
            lastName: '',
            idNumber: '',
            nationality: '',
            birthDate: '',
            birthPlace: '',
            address: '',
            city: ''
          };
      }
    } catch (error) {
      throw new Error(`Erreur OCR: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  static async processMultipleIDDocuments(files: File[], idType: IDType): Promise<ProcessedFile[]> {
    const processedFiles: ProcessedFile[] = [];

    for (const file of files) {
      try {
        const extractedData = await this.processIDDocument(file, idType);
        const fileUrl = URL.createObjectURL(file);

        processedFiles.push({
          file,
          fileUrl,
          extractedData
        });
      } catch (error) {
        const fileUrl = URL.createObjectURL(file);
        processedFiles.push({
          file,
          fileUrl,
          error: error instanceof Error ? error.message : 'Erreur de traitement'
        });
      }
    }

    return processedFiles;
  }

  static combineExtractedData(processedFiles: ProcessedFile[]): ExtractedIDData {
    // Combine data from multiple files, prioritizing the most confident results
    const validData = processedFiles
      .filter(pf => pf.extractedData && !pf.error)
      .map(pf => pf.extractedData!)
      .sort((a, b) => b.confidence - a.confidence);

    if (validData.length === 0) {
      return {
        rawText: 'Aucune donnée extraite',
        confidence: 0,
        firstName: '',
        lastName: '',
        idNumber: '',
        nationality: '',
        birthDate: '',
        birthPlace: '',
        address: '',
        city: ''
      };
    }

    // Start with the highest confidence data and fill in gaps with other files
    const combined: ExtractedIDData = { ...validData[0] };

    for (let i = 1; i < validData.length; i++) {
      const data = validData[i];

      // Fill in missing fields with data from other files
      if (!combined.firstName && data.firstName) combined.firstName = data.firstName;
      if (!combined.lastName && data.lastName) combined.lastName = data.lastName;
      if (!combined.idNumber && data.idNumber) combined.idNumber = data.idNumber;
      if (!combined.birthDate && data.birthDate) combined.birthDate = data.birthDate;
      if (!combined.birthPlace && data.birthPlace) combined.birthPlace = data.birthPlace;
      if (!combined.address && data.address) combined.address = data.address;
      if (!combined.city && data.city) combined.city = data.city;
      if (!combined.nationality && data.nationality) combined.nationality = data.nationality;

      // Combine raw text
      combined.rawText += '\n\n--- Fichier ' + (i + 1) + ' ---\n' + data.rawText;
    }

    // Recalculate confidence based on combined data
    combined.confidence = this.calculateConfidence(combined);

    return combined;
  }
}