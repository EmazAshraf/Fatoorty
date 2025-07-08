// Formatting utilities
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const formatDate = (date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'relative':
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      
      return formatDate(date, 'short');
    default:
      return dateObj.toLocaleDateString();
  }
};

export const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat('en-US', options).format(num);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number, suffix = '...'): string => {
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const unique = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// Object utilities
export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const isEmpty = (value: unknown): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// CSS utilities
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Local storage utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },
  
  set: (key: string, value: unknown): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};

// Debounce utility
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// File utilities
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

export const isPdfFile = (file: File): boolean => {
  return file.type === 'application/pdf';
};

// Error handling utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};

// Status utilities
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    active: 'green',
    inactive: 'gray',
    pending: 'yellow',
    verified: 'green',
    rejected: 'red',
    suspended: 'red',
    approved: 'green',
    draft: 'gray',
    published: 'blue'
  };
  
  return statusColors[status.toLowerCase()] || 'gray';
};

export const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  const statusVariants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    active: 'success',
    verified: 'success',
    approved: 'success',
    published: 'success',
    pending: 'warning',
    draft: 'warning',
    inactive: 'default',
    rejected: 'error',
    suspended: 'error',
    error: 'error',
    info: 'info'
  };
  
  return statusVariants[status.toLowerCase()] || 'default';
}; 