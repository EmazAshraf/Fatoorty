// Common API Response Structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationData;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: SuperadminUser | RestaurantOwner;
  restaurant?: Restaurant;
}

// Direct login response from backend (not wrapped in ApiResponse)
export interface RestaurantLoginResponse {
  token: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  restaurant?: {
    id: string;
    name: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    status: 'active' | 'suspended';
  };
  canAccess?: boolean;
}

// Enhanced login response for new authentication flow
export interface EnhancedRestaurantLoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
    restaurant: {
      id: string;
      name: string;
      verificationStatus: 'pending' | 'verified' | 'rejected';
      status: 'active' | 'suspended';
    };
  };
  status?: 'authenticated' | 'verification_pending' | 'verification_rejected' | 'account_suspended' | 'access_denied';
  redirectTo?: string;
  statusCode?: number;
  errors?: {
    status: string;
    verificationStatus: string;
    accountStatus: string;
    redirectTo: string;
    restaurant: {
      id: string;
      name: string;
    };
  };
}

export interface SuperadminLoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'superadmin';
  };
}

export interface SuperadminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin';
}

export interface RestaurantOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'restaurant_owner';
}

// Restaurant Types
export interface Restaurant {
  id: string;
  name: string;
  type: string;
  address: string;
  email: string;
  phone?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  status: 'active' | 'suspended' | 'inactive';
  logo?: string;
  governmentIdUrl?: string;
  createdAt: string;
  updatedAt: string;
  owner: RestaurantOwner;
}

export interface RestaurantSignupData {
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  restaurantName: string;
  restaurantType: string;
  address: string;
  verificationGovId: File;
  restaurantIcon?: File | null;
}

// Staff Types
export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  joiningDate: string;
  status: 'active' | 'inactive';
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  joiningDate: string;
  status: 'active' | 'inactive';
  image?: File | null;
}

export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  totalSalaryExpense: number;
  positionDistribution: Array<{ position: string; count: number }>;
}

// Dashboard Types
export interface SuperadminDashboardStats {
  totalRestaurants: number;
  activeRestaurants: number;
  pendingVerifications: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export interface RestaurantDashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeStaff: number;
  averageRating: number;
  monthlyGrowth: number;
}

// Verification Types
export interface VerificationRequest {
  id: string;
  restaurant: Restaurant;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: SuperadminUser;
  notes?: string;
}

// Filter and Sort Types
export interface FilterOptions {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'file' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
} 