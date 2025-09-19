export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ExtractedIDData {
  firstName?: string;
  lastName?: string;
  idNumber?: string;
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  address?: string;
  city?: string;
  issueDate?: string;
  expiryDate?: string;
  confidence: number;
  rawText: string;
}

export interface IDScanResult {
  success: boolean;
  extractedData?: ExtractedIDData;
  originalImageUrl?: string;
  processedImageUrl?: string;
  error?: string;
  processingTime?: number;
  fileCount?: number;
  processedFiles?: ProcessedFile[];
}

export interface ProcessedFile {
  file: File;
  fileUrl: string;
  extractedData?: ExtractedIDData;
  error?: string;
}

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

export type IDType = 'moroccan_cin' | 'us_id' | 'passport' | 'other';

export interface ScanRequest {
  file: File;
  idType: IDType;
}

export interface MultiFileScanRequest {
  files: File[];
  idType: IDType;
}

export interface MoroccanCINPattern {
  cinRegex: RegExp;
  namePatterns: string[];
  datePatterns: string[];
  placePatterns: string[];
}