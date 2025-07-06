import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from '../Button';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl'
};

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  className = '',
  loading = false
}: BaseModalProps) {
  const handleOverlayClick = closeOnOverlayClick ? onClose : () => {};

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleOverlayClick}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className={`
                  w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-white 
                  text-left align-middle shadow-xl transition-all ${className}
                `.trim()}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    {title && (
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        {title}
                      </Dialog.Title>
                    )}
                    {showCloseButton && (
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={onClose}
                        disabled={loading}
                      >
                        <span className="sr-only">Close</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Common footer component for form modals
export const BaseModalFooter = ({ 
  onCancel, 
  onConfirm, 
  cancelText = 'Cancel', 
  confirmText = 'Confirm',
  confirmLoading = false,
  confirmVariant = 'primary' as const,
  cancelDisabled = false,
  confirmDisabled = false
}: {
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmLoading?: boolean;
  confirmVariant?: 'primary' | 'danger';
  cancelDisabled?: boolean;
  confirmDisabled?: boolean;
}) => (
  <div className="flex justify-end space-x-3">
    <Button 
      variant="outline" 
      onClick={onCancel}
      disabled={cancelDisabled || confirmLoading}
    >
      {cancelText}
    </Button>
    <Button 
      variant={confirmVariant} 
      onClick={onConfirm}
      loading={confirmLoading}
      disabled={confirmDisabled}
    >
      {confirmText}
    </Button>
  </div>
); 