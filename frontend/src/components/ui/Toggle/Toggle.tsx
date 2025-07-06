import React from 'react';

export interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
}

const sizeClasses = {
  sm: {
    container: 'h-5 w-9',
    button: 'h-4 w-4',
    translate: 'translate-x-4'
  },
  md: {
    container: 'h-6 w-11',
    button: 'h-5 w-5',
    translate: 'translate-x-5'
  },
  lg: {
    container: 'h-7 w-14',
    button: 'h-6 w-6',
    translate: 'translate-x-7'
  }
};

export default function Toggle({
  enabled,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description
}: ToggleProps) {
  const { container, button, translate } = sizeClasses[size];

  const handleToggle = () => {
    if (!disabled) {
      onChange(!enabled);
    }
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        className={`
          relative inline-flex ${container} flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${enabled ? 'bg-[#6D72CF] ' : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `.trim()}
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span className="sr-only">{label || 'Toggle'}</span>
        <span
          aria-hidden="true"
          className={`
            ${button} pointer-events-none inline-block rounded-full bg-white shadow-black shadow transform ring-0 
            transition duration-200 ease-in-out
            ${enabled ? translate : 'translate-x-0'}
          `.trim()}
        />
      </button>
      
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <span className="text-sm font-medium text-gray-900">
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-gray-500 block">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
} 