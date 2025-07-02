'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { Upload, X, RotateCw, ZoomIn, ZoomOut, Check } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  onImageCropped: (croppedImageFile: File) => void;
  onCancel: () => void;
  currentImage?: string;
}

export default function ImageCropper({ onImageCropped, onCancel, currentImage }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState<string>(currentImage || '');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect] = useState<number>(1); // Fixed to 1:1 for square
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5,
      });
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }, [aspect]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.addEventListener('load', () =>
          setImgSrc(reader.result?.toString() || ''),
        );
        reader.readAsDataURL(file);
      }
    }
  };

  const getCroppedImg = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;

    setIsProcessing(true);
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No 2d context');
      }

      const image = imgRef.current;
      const { naturalWidth, naturalHeight } = image;

      // Calculate the actual crop dimensions
      const cropX = (completedCrop.x / 100) * naturalWidth;
      const cropY = (completedCrop.y / 100) * naturalHeight;
      const cropWidth = (completedCrop.width / 100) * naturalWidth;
      const cropHeight = (completedCrop.height / 100) * naturalHeight;

      // Set canvas size to desired output size (square)
      const outputSize = 400; // 400x400 pixels
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Apply transformations
      ctx.save();
      
      // Rotate if needed
      if (rotate !== 0) {
        ctx.translate(outputSize / 2, outputSize / 2);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.translate(-outputSize / 2, -outputSize / 2);
      }

      // Draw the cropped image
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputSize,
        outputSize
      );

      ctx.restore();

      // Convert canvas to blob
      return new Promise<File>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'restaurant-icon.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(file);
          }
        }, 'image/jpeg', 0.9);
      });
    } catch (error) {
      console.error('Error cropping image:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, rotate]);

  const handleCropComplete = async () => {
    try {
      const croppedFile = await getCroppedImg();
      if (croppedFile) {
        onImageCropped(croppedFile);
      }
    } catch (error) {
      console.error('Failed to crop image:', error);
    }
  };

  const centerAspectCrop = (
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ): Crop => {
    return {
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5,
    };
  };

  if (!imgSrc) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upload Restaurant Icon</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Drag & drop your restaurant icon here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Choose Image
            </label>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>• Recommended: Square images (1:1 aspect ratio)</p>
            <p>• Supported formats: JPG, PNG, GIF</p>
            <p>• Maximum size: 5MB</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Crop Restaurant Icon</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crop Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-100 rounded-xl p-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                minWidth={50}
                minHeight={50}
                className="max-w-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                  onLoad={onImageLoad}
                  className="max-w-full h-auto"
                />
              </ReactCrop>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
              <div className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-gray-200 flex items-center justify-center">
                {completedCrop && imgRef.current ? (
                  <canvas
                    ref={(canvas) => {
                      if (canvas && completedCrop && imgRef.current) {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          const image = imgRef.current;
                          const { naturalWidth, naturalHeight } = image;
                          
                          canvas.width = 96;
                          canvas.height = 96;
                          
                          const cropX = (completedCrop.x / 100) * naturalWidth;
                          const cropY = (completedCrop.y / 100) * naturalHeight;
                          const cropWidth = (completedCrop.width / 100) * naturalWidth;
                          const cropHeight = (completedCrop.height / 100) * naturalHeight;
                          
                          ctx.drawImage(
                            image,
                            cropX,
                            cropY,
                            cropWidth,
                            cropHeight,
                            0,
                            0,
                            96,
                            96
                          );
                        }
                      }
                    }}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400 text-xs">Preview</div>
                )}
              </div>
            </div>

            {/* Zoom Controls */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Zoom</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setScale(Math.max(0.1, scale - 0.1))}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ZoomOut size={16} />
                </button>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => setScale(Math.min(3, scale + 0.1))}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                {Math.round(scale * 100)}%
              </div>
            </div>

            {/* Rotate Controls */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Rotate</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRotate(rotate - 90)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RotateCw size={16} className="transform rotate-180" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotate}
                  onChange={(e) => setRotate(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => setRotate(rotate + 90)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RotateCw size={16} />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                {rotate}°
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCropComplete}
                disabled={isProcessing || !completedCrop}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Apply Crop
                  </>
                )}
              </button>
              
              <button
                onClick={() => setImgSrc('')}
                className="w-full border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Choose Different Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 