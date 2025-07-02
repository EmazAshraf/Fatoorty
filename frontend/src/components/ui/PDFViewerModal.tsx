'use client';

import { useState, useEffect } from 'react';
import { X, Download, AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '@/lib/api';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  restaurantName: string;
}

export default function PDFViewerModal({ isOpen, onClose, filename, restaurantName }: PDFViewerModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    if (isOpen && filename) {
      loadPDF();
    }
    
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, filename, pdfUrl]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError('');
      
      const blob = await apiService.downloadGovernmentId(filename);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${restaurantName}-government-id.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl('');
    }
    setLoading(true);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Government ID Document
              </h3>
              <p className="text-sm text-gray-600">
                {restaurantName}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {pdfUrl && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              )}
              
              <button
                onClick={handleClose}
                className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading PDF...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load PDF</h4>
                  <p className="text-sm text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={loadPDF}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {pdfUrl && !loading && !error && (
              <div className="h-full">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="Government ID Document"
                  style={{ minHeight: '500px' }}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500">
              {filename}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                PDF Viewer
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 