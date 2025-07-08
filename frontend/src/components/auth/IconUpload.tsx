'use client';

import React, { useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import ImageCropper from './ImageCropper';
import Image from 'next/image';
interface IconUploadProps {
  label: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  required?: boolean;
}

export default function IconUpload({ 
  label, 
  value, 
  onChange, 
  error, 
  required = false 
}: IconUploadProps) {
  const [showCropper, setShowCropper] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  React.useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl('');
    }
  }, [value]);

  const handleImageCropped = (croppedFile: File) => {
    onChange(croppedFile);
    setShowCropper(false);
  };

  const handleRemoveImage = () => {
    onChange(null);
    setPreviewUrl('');
  };

  const openCropper = () => {
    setShowCropper(true);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        <span className="text-gray-500 font-normal ml-2">(Optional)</span>
      </label>
      
      <div className="flex items-center space-x-4">
        {/* Preview Area */}
        <div className="relative">
          {previewUrl ? (
            <div className="relative w-20 h-20 rounded-xl border-2 border-gray-200 overflow-hidden bg-white">
              <Image
                src={previewUrl}
                alt="Restaurant icon preview"
                className="w-full h-full object-cover"
                width={128}
                height={128}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <button
            type="button"
            onClick={openCropper}
            className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 border-dashed rounded-xl text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-gray-800 transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            {value ? 'Change Icon' : 'Upload Icon'}
          </button>
          
          <p className="text-xs text-gray-500 mt-2">
            Square images work best. We&apos;ll help you crop it to the perfect size.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm flex items-center">
          <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs mr-2">!</span>
          {error}
        </p>
      )}

      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          onImageCropped={handleImageCropped}
          onCancel={() => setShowCropper(false)}
          currentImage={previewUrl}
        />
      )}
    </div>
  );
} 