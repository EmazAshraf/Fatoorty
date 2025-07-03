import type { 
  ApiResponse, 
  PaginationParams, 
  StaffMember, 
  StaffFormData, 
  StaffStats,
  RestaurantLoginResponse,
  EnhancedRestaurantLoginResponse,
  SuperadminLoginResponse,
  SuperadminProfile
} from '../../types/api';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API Service Class
class ApiService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const authToken = token || localStorage.getItem('token');
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    
    return headers;
  }

  private getAuthHeadersForFormData(token?: string): HeadersInit {
    const headers: HeadersInit = {};
    
    const authToken = token || localStorage.getItem('token');
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }
      
      return data;
    }
    
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    return { success: true } as ApiResponse<T>;
  }

  // Authentication APIs
  async loginSuperadmin(email: string, password: string): Promise<SuperadminLoginResponse> {
    const response = await fetch(`${API_BASE_URL}/superadmin/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Login failed with status ${response.status}`);
    }
    
    return response.json();
  }

  async loginRestaurant(email: string, password: string): Promise<EnhancedRestaurantLoginResponse> {
    const response = await fetch(`${API_BASE_URL}/restaurant/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // For non-200 responses, we still return the data as it contains status information
      // The frontend will handle routing based on the status and errors fields
      return data;
    }
    
    return data;
  }

  async signupRestaurant(data: FormData | any) {
    const isFormData = data instanceof FormData;
    
    const response = await fetch(`${API_BASE_URL}/restaurant/auth/signup`, {
      method: 'POST',
      headers: isFormData ? this.getAuthHeadersForFormData() : this.getAuthHeaders(),
      body: isFormData ? data : JSON.stringify(data),
    });
    
    return this.handleResponse(response);
  }

  // Restaurant Status APIs
  async getRestaurantStatus() {
    const response = await fetch(`${API_BASE_URL}/restaurant/status`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async checkDashboardAccess() {
    const response = await fetch(`${API_BASE_URL}/restaurant/dashboard/access`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  // Staff Management APIs
  async getStaff(params: PaginationParams = {}): Promise<ApiResponse<StaffMember[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/restaurant/staff?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<StaffMember[]>(response);
  }

  async createStaff(data: StaffFormData): Promise<ApiResponse<StaffMember>> {
    const response = await fetch(`${API_BASE_URL}/restaurant/staff`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        salary: data.salary,
        joiningDate: data.joiningDate,
        status: data.status
      }),
    });
    
    return this.handleResponse<StaffMember>(response);
  }

  async updateStaff(id: string, data: Partial<StaffFormData>): Promise<ApiResponse<StaffMember>> {
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.position) updateData.position = data.position;
    if (data.salary) updateData.salary = data.salary;
    if (data.joiningDate) updateData.joiningDate = data.joiningDate;
    if (data.status) updateData.status = data.status;
    
    const response = await fetch(`${API_BASE_URL}/restaurant/staff/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    
    return this.handleResponse<StaffMember>(response);
  }

  async deleteStaff(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/restaurant/staff/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async getStaffStats(): Promise<ApiResponse<StaffStats>> {
    const response = await fetch(`${API_BASE_URL}/restaurant/staff/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<StaffStats>(response);
  }

  // Verification APIs (Superadmin)
  async getRestaurantVerifications(params: any = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/superadmin/verification?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async updateVerificationStatus(restaurantId: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/verification/${restaurantId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    return this.handleResponse(response);
  }

  async bulkUpdateVerificationStatus(restaurantIds: string[], status: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/verification/bulk`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ restaurantIds, status }),
    });
    
    return this.handleResponse(response);
  }

  async getRestaurantVerificationDetails(restaurantId: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/verification/${restaurantId}/details`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  // Dashboard APIs
  async getSuperadminDashboard() {
    const response = await fetch(`${API_BASE_URL}/superadmin/dashboard`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async getRestaurantDashboard() {
    const response = await fetch(`${API_BASE_URL}/restaurant/dashboard`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  // File APIs
  async downloadGovernmentId(filename: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/files/government-id/${filename}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    return response.blob();
  }

  getRestaurantIconUrl(filename: string): string {
    return `${API_BASE_URL}/files/restaurant-icon/${filename}`;
  }

  // Superadmin Settings APIs
  async getSuperadminProfile(): Promise<{ superadmin: SuperadminProfile }> {
    const response = await fetch(`${API_BASE_URL}/superadmin/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch profile');
    }
    
    return response.json();
  }

  async updateSuperadminProfile(data: { name?: string; email?: string }): Promise<{ superadmin: SuperadminProfile }> {
    const response = await fetch(`${API_BASE_URL}/superadmin/settings/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update profile');
    }
    
    return response.json();
  }

  async updateSuperadminProfilePhoto(file: File): Promise<{ superadmin: SuperadminProfile; message: string; filename: string }> {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    
    const response = await fetch(`${API_BASE_URL}/superadmin/settings/profile-photo`, {
      method: 'POST',
      headers: this.getAuthHeadersForFormData(),
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update profile photo');
    }
    
    return response.json();
  }

  async changeSuperadminPassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/superadmin/settings/password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to change password');
    }
    
    return response.json();
  }

  getSuperadminProfilePhotoUrl(filename: string): string {
    return `${API_BASE_URL}/files/profile/${filename}`;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 