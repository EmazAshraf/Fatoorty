export const colors = {
  primary: '#6D72CF',
  secondary: '#4F46E5',
  accent: '#818CF8',
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export const brandColors = {
  primary: colors.primary,
  primaryLight: '#8B8FD6',
  primaryDark: '#5A5FB8',
} as const; 