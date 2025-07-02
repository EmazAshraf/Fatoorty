'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileText, X, AlertCircle, RefreshCw } from 'lucide-react';

interface FileUploadProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
  error?: string;
  accept?: string;
  maxSize?: number; // in MB
}

export default function FileUpload({ 
  label, 
  value, 
  onChange, 
  required = false,
  error,
  accept = '.pdf',
  maxSize = 5 // 5MB default
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const validateFile = (file: File): string | null => {
    // Validate file type
    if (accept && !file.name.toLowerCase().endsWith('.pdf')) {
      return 'Only PDF files are allowed';
    }

    // Validate file size
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationResult = validateFile(file);
    
    if (validationResult) {
      setValidationError(validationResult);
      return;
    }

    setValidationError('');
    onChange(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValidationError('');
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const replaceFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openFileDialog();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const displayError = error || validationError;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-200
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : displayError 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          required={required}
        />

        {value ? (
          <div className="space-y-3">
            {/* File Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {value.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(value.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Replace file button */}
                <button
                  type="button"
                  onClick={replaceFile}
                  className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors"
                  title="Replace file"
                >
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                </button>
                {/* Remove file button */}
                <button
                  type="button"
                  onClick={removeFile}
                  className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
            
            {/* Click to replace text */}
            <div 
              className="text-center cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
              onClick={replaceFile}
            >
              <p className="text-xs text-gray-500">
                Click here to <span className="font-semibold text-blue-600">replace file</span>
              </p>
            </div>
          </div>
        ) : (
          <div 
            className="text-center cursor-pointer"
            onClick={openFileDialog}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF files only, up to {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
} 