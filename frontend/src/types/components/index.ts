// Common Component Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Layout Types
export interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface DashboardLayoutProps extends BaseComponentProps {
  sidebarItems: SidebarItem[];
  role: 'superadmin' | 'restaurant';
  title?: string;
}

// Table Types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  fixed?: 'left' | 'right';
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: T) => void;
  disabled?: (record: T) => boolean;
  variant?: 'default' | 'danger';
}

// Form Types
export interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialValues?: Record<string, any>;
  validationSchema?: any;
}

export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

// Modal Types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
}

// Status Types
export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default';
export type SizeVariant = 'sm' | 'md' | 'lg';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

// Loading States
export interface LoadingState {
  loading: boolean;
  error?: string | null;
  data?: any;
}

// Pagination Types
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Filter Types
export interface FilterProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

// Search Types
export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
}

// Card Types
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Stats Card Types
export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
} 