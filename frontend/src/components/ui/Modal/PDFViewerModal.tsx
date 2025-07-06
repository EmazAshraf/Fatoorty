'use client';

import { useState, useEffect } from 'react';
import { Download, AlertCircle, Loader2 } from 'lucide-react';
import BaseModal from './BaseModal';
import { Button } from '../Button';
import { apiService } from '../../../lib/api';

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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading PDF...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load PDF</h4>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button
              onClick={loadPDF}
              variant="primary"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    if (pdfUrl) {
      return (
        <div className="h-full">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="Government ID Document"
            style={{ minHeight: '500px' }}
          />
        </div>
      );
    }

    return null;
  };

  const renderFooter = () => (
    <div className="flex items-center justify-between">
      <div className="text-xs text-gray-500">
        {filename}
      </div>
      
      <div className="flex items-center space-x-2">
        {pdfUrl && (
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
        <span className="text-xs text-gray-500">
          PDF Viewer
        </span>
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Government ID Document"
      size="full"
      loading={loading}
      footer={renderFooter()}
      className="max-h-[90vh]"
    >
      <div className="mb-2">
        <p className="text-sm text-gray-600">
          {restaurantName}
        </p>
      </div>
      <div className="h-[60vh] overflow-hidden">
        {renderContent()}
      </div>
    </BaseModal>
  );
} 