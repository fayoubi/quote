import React, { useState, useRef } from 'react';
import { Upload, Camera, X, CheckCircle, AlertCircle, Loader2, FileText, Image } from 'lucide-react';
import { IDType, IDScanResult } from '../types/idScanner';
import { FileStorageService } from '../services/FileStorageService';
import { OCRService } from '../services/OCRService';

interface IDScannerProps {
  onScanComplete: (result: IDScanResult) => void;
  onCancel?: () => void;
  defaultIdType?: IDType;
  className?: string;
}

const IDScanner: React.FC<IDScannerProps> = ({
  onScanComplete,
  onCancel,
  defaultIdType = 'moroccan_cin',
  className = ''
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [idType, setIdType] = useState<IDType>(defaultIdType);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (newFiles: File | File[]) => {
    setError(null);

    const filesToAdd = Array.isArray(newFiles) ? newFiles : [newFiles];
    const allFiles = [...selectedFiles, ...filesToAdd];

    const validation = FileStorageService.validateFiles(allFiles);
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }

    setSelectedFiles(allFiles);

    // Create previews for new files
    const newUrls = filesToAdd.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newUrls]);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(Array.from(files));
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(Array.from(files));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);

    // Revoke the URL for the removed file
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const processScan = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const startTime = Date.now();

      // Upload files
      const uploadResults = await FileStorageService.uploadFiles(selectedFiles);
      const failedUploads = uploadResults.filter(r => !r.success);

      if (failedUploads.length > 0) {
        throw new Error(`Erreur d'upload: ${failedUploads[0].error}`);
      }

      // Process OCR for multiple files
      const processedFiles = await OCRService.processMultipleIDDocuments(selectedFiles, idType);
      const processingTime = Date.now() - startTime;

      // Combine data from all files
      const combinedData = OCRService.combineExtractedData(processedFiles);

      const result: IDScanResult = {
        success: true,
        extractedData: combinedData,
        originalImageUrl: uploadResults[0].fileUrl, // Keep first file as main URL for compatibility
        processingTime,
        fileCount: selectedFiles.length,
        processedFiles
      };

      onScanComplete(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du traitement';
      setError(errorMessage);

      const result: IDScanResult = {
        success: false,
        error: errorMessage,
        fileCount: selectedFiles.length
      };

      onScanComplete(result);
    } finally {
      setIsProcessing(false);
    }
  };

  const getIdTypeLabel = (type: IDType): string => {
    switch (type) {
      case 'moroccan_cin': return 'Carte d\'identité marocaine (CIN)';
      case 'us_id': return 'Pièce d\'identité américaine';
      case 'passport': return 'Passeport';
      case 'other': return 'Autre document';
      default: return 'Document d\'identité';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Camera className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Scanner de pièce d'identité</h2>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ID Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de document
        </label>
        <select
          value={idType}
          onChange={(e) => setIdType(e.target.value as IDType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isProcessing}
        >
          <option value="moroccan_cin">Carte d'identité marocaine (CIN)</option>
          <option value="us_id">Pièce d'identité américaine</option>
          <option value="passport">Passeport</option>
          <option value="other">Autre document</option>
        </select>
      </div>

      {/* File Upload Area */}
      {selectedFiles.length === 0 && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">
            Télécharger vos documents {getIdTypeLabel(idType).toLowerCase()}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
          </p>
          <p className="text-xs text-gray-400">
            Formats supportés: JPEG, PNG, PDF (max. 10MB par fichier, 5 fichiers max)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isProcessing}
            multiple
          />
        </div>
      )}

      {/* Multiple Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Fichiers sélectionnés ({selectedFiles.length}/5)
            </h3>
            <button
              onClick={clearFiles}
              disabled={isProcessing}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              Supprimer tout
            </button>
          </div>

          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  {/* File Preview */}
                  <div className="w-32 h-24 flex items-center justify-center bg-gray-50 rounded border">
                    {FileStorageService.isImage(file) && previewUrls[index] ? (
                      <img
                        src={previewUrls[index]}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : FileStorageService.isPDF(file) ? (
                      <div className="text-center">
                        <FileText className="h-8 w-8 text-red-500 mx-auto mb-1" />
                        <span className="text-xs text-gray-500">PDF</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Image className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-500">Image</span>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {FileStorageService.formatFileSize(file.size)} • {FileStorageService.getFileTypeLabel(file)}
                    </p>
                    <p className="text-sm text-blue-600">
                      {getIdTypeLabel(idType)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(index)}
                    disabled={isProcessing}
                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add More Files Button */}
          {selectedFiles.length < 5 && (
            <div className="mt-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                Ajouter d'autres fichiers
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Erreur</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
        )}

        <button
          onClick={processScan}
          disabled={selectedFiles.length === 0 || isProcessing}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Scanner {selectedFiles.length > 1 ? 'les documents' : 'le document'}
            </>
          )}
        </button>
      </div>

      {/* Processing Info */}
      {isProcessing && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Traitement en cours...</strong> Extraction des données de {selectedFiles.length > 1 ? `vos ${selectedFiles.length} documents` : 'votre document'}.
            {selectedFiles.length > 1 ? ' Cela peut prendre un peu plus de temps.' : ' Cela peut prendre quelques secondes.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default IDScanner;