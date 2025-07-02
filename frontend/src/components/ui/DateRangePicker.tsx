'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  placeholder?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  placeholder = "Select Date Range"
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update temp dates when props change
  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayDate = (start: string, end: string) => {
    if (!start && !end) return placeholder;
    
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    if (start && end) {
      return `${formatDate(start)} - ${formatDate(end)}`;
    } else if (start) {
      return `From ${formatDate(start)}`;
    } else if (end) {
      return `Until ${formatDate(end)}`;
    }
    
    return placeholder;
  };

  const handleApply = () => {
    onDateChange(tempStartDate, tempEndDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStartDate('');
    setTempEndDate('');
    onDateChange('', '');
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <Calendar className="h-4 w-4 mr-2" />
        {formatDisplayDate(startDate, endDate)}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Select Date Range</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Start Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  min={tempStartDate || undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Quick Select
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                      setTempStartDate(lastWeek.toISOString().split('T')[0]);
                      setTempEndDate(today.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Last 7 days
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                      setTempStartDate(lastMonth.toISOString().split('T')[0]);
                      setTempEndDate(today.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Last 30 days
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                      setTempStartDate(thisMonth.toISOString().split('T')[0]);
                      setTempEndDate(today.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    This month
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                      setTempStartDate(lastMonth.toISOString().split('T')[0]);
                      setTempEndDate(lastMonthEnd.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Last month
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleClear}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 