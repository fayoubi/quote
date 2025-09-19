import { FileUploadResult } from '../types/idScanner';

export class FileStorageService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  private static readonly STORAGE_PREFIX = 'id_documents';
  private static readonly MAX_FILES = 5; // Maximum number of files per upload

  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'Aucun fichier sélectionné' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { isValid: false, error: 'Le fichier est trop volumineux (maximum 10MB)' };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { isValid: false, error: 'Format de fichier non supporté. Utilisez JPEG, PNG ou PDF.' };
    }

    return { isValid: true };
  }

  static validateFiles(files: File[]): { isValid: boolean; error?: string } {
    if (!files || files.length === 0) {
      return { isValid: false, error: 'Aucun fichier sélectionné' };
    }

    if (files.length > this.MAX_FILES) {
      return { isValid: false, error: `Trop de fichiers sélectionnés (maximum ${this.MAX_FILES})` };
    }

    for (let i = 0; i < files.length; i++) {
      const validation = this.validateFile(files[i]);
      if (!validation.isValid) {
        return { isValid: false, error: `Fichier ${i + 1}: ${validation.error}` };
      }
    }

    return { isValid: true };
  }

  static async uploadFile(file: File): Promise<FileUploadResult> {
    try {
      // Validate file first
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // For MVP, we'll store files locally using URL.createObjectURL
      // In production, this would upload to S3 or similar service
      const fileUrl = URL.createObjectURL(file);
      const fileName = `${this.STORAGE_PREFIX}_${Date.now()}_${file.name}`;

      return {
        success: true,
        fileUrl,
        fileName,
        fileSize: file.size
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors du téléchargement'
      };
    }
  }

  static async uploadFiles(files: File[]): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadFile(file);
      results.push(result);
    }

    return results;
  }

  static revokeFileUrl(url: string): void {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('Failed to revoke object URL:', error);
    }
  }

  static getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static isPDF(file: File): boolean {
    return file.type === 'application/pdf';
  }

  static isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  static getFileTypeLabel(file: File): string {
    if (this.isPDF(file)) return 'PDF';
    if (this.isImage(file)) return 'Image';
    return 'Document';
  }
}