'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Eye,
  Check,
  X,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Store,
  Loader2
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { StatCard } from '@/components/ui';
import { 
  Table, 
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button, 
  Input, 
  Select, 
  Badge, 
  type SelectOption
} from '@/components/ui';
import Pagination from '@/components/ui/Pagination';
import DateRangePicker from '@/components/ui/DateRangePicker';
import PDFViewerModal from '@/components/ui/Modal/PDFViewerModal';
import Image from 'next/image';
interface Restaurant {
  id: string;
  name: string;
  email: string;
  address: string
  type: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  status: 'active' | 'suspended';
  logo: string;
  governmentIdUrl: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const statusOptions: SelectOption[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
];

const sortOptions: SelectOption[] = [
  { value: 'createdAt', label: 'Request Date' },
  { value: 'name', label: 'Restaurant Name' },
  { value: 'updatedAt', label: 'Last Updated' },
];

const sortOrderOptions: SelectOption[] = [
  { value: 'desc', label: 'Newest First' },
  { value: 'asc', label: 'Oldest First' },
];

export default function VerificationPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    pendingVerifications: 0,
    verifiedRestaurants: 0,
    rejectedVerifications: 0
  });
  
  // Filters and search
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    startDate: '',
    endDate: ''
  });

  const [pdfModal, setPdfModal] = useState<{
    isOpen: boolean;
    filename: string;
    restaurantName: string;
  }>({
    isOpen: false,
    filename: '',
    restaurantName: ''
  });

  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'superadmin') {
      router.push('/superadmin/login');
      return;
    }
  }, [router]);

  // Fetch data function
  const fetchData = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getRestaurantVerifications({
        page,
        limit: pagination.limit,
        ...filters
      });

      if (response.success) {
        const data = response.data as Restaurant[];
        const pagination = response.pagination as PaginationData;
        
        setRestaurants(data);
        setPagination(pagination);
        
        // Calculate stats from the data
        const pending = data.filter((r: Restaurant) => r.verificationStatus === 'pending').length;
        const verified = data.filter((r: Restaurant) => r.verificationStatus === 'verified').length;
        const rejected = data.filter((r: Restaurant) => r.verificationStatus === 'rejected').length;
        
        setStats({
          totalRestaurants: pagination.totalCount,
          pendingVerifications: pending,
          verifiedRestaurants: verified,
          rejectedVerifications: rejected
        });
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  // Initial load
  useEffect(() => {
    fetchData(1);
  }, [filters, fetchData]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page);
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  // Handle verification status update
  const handleStatusUpdate = async (restaurantId: string, newStatus: string) => {
    try {
      setUpdating(restaurantId);
      await apiService.updateVerificationStatus(restaurantId, newStatus);
      
      // Refresh data
      await fetchData(pagination.currentPage);
      
      console.log(`Restaurant verification status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(null);
    }
  };

  // View restaurant details
  const viewRestaurantDetails = (restaurantId: string) => {
    // Navigate to restaurant details page
    router.push(`/superadmin/restaurants/${restaurantId}`);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning' as const,
      verified: 'success' as const,
      rejected: 'error' as const
    };
    
    const labels = {
      pending: 'Pending Review',
      verified: 'Verified',
      rejected: 'Rejected'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]} size="sm">
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle date range change
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  // Handle view PDF
  const handleViewPDF = (filename: string, restaurantName: string) => {
    setPdfModal({
      isOpen: true,
      filename,
      restaurantName
    });
  };

  // Handle close PDF
  const handleClosePDF = () => {
    setPdfModal({
      isOpen: false,
      filename: '',
      restaurantName: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
<div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
  <div className="mb-6">
    <h1 className="text-3xl font-semibold text-gray-900">Restaurant Verification</h1>
    <p className="text-sm text-gray-500 mt-1">Review and manage restaurant verification requests</p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
    {/* Search */}
    <div className="md:col-span-4">
      <Input
        placeholder="Search restaurants..."
        value={filters.search}
        onChange={(e) => handleSearch(e.target.value)}
        leftIcon={<Search className="w-4 h-4 text-gray-500" />}
      />
    </div>

    {/* Status Filter */}
    <div className="md:col-span-2">
      <Select
        value={filters.status}
        onChange={(value) => handleFilterChange('status', value as string)}
        options={statusOptions}
      />
    </div>

    {/* Sort By */}
    <div className="md:col-span-2">
      <Select
        value={filters.sortBy}
        onChange={(value) => handleFilterChange('sortBy', value as string)}
        options={sortOptions}
      />
    </div>

    {/* Sort Order */}
    <div className="md:col-span-2">
      <Select
        value={filters.sortOrder}
        onChange={(value) => handleFilterChange('sortOrder', value as string)}
        options={sortOrderOptions}
      />
    </div>

    {/* Date Range */}
    <div className="md:col-span-4">
      <DateRangePicker
        startDate={filters.startDate}
        endDate={filters.endDate}
        onDateChange={handleDateRangeChange}
      />
    </div>
  </div>
</div>

      

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Restaurants"
          value={stats.totalRestaurants}
          icon={Store}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingVerifications}
          icon={Clock}
        />
        <StatCard
          title="Verified"
          value={stats.verifiedRestaurants}
          icon={CheckCircle}
        />
        <StatCard
          title="Rejected"
          value={stats.rejectedVerifications}
          icon={XCircle}
        />
      </div>


      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading verifications...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Government ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No verification requests found</p>
                    <p className="text-gray-500">Verification requests will appear here when restaurants submit them.</p>
                  </TableCell>
                </TableRow>
              ) : (
                restaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          {restaurant.logo ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/files/restaurant-icon/${restaurant.logo}`}
                              alt={restaurant.name}
                              className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                              width={40}
                              height={40}
                              onError={(e) => {
                                const target = e.currentTarget;
                                const fallback = target.nextElementSibling as HTMLElement;
                                target.style.display = 'none';
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div 
                            className={`h-10 w-10 rounded-full bg-green-500 flex items-center justify-center ${restaurant.logo ? 'hidden' : ''}`}
                          >
                            <Store className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                          <div className="text-sm text-gray-500">{restaurant.type}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm text-gray-900">{restaurant.email}</div>
                        <div className="text-sm text-gray-500">{restaurant.owner.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={restaurant.address}>
                        {restaurant.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{formatDate(restaurant.createdAt)}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPDF(restaurant.governmentIdUrl, restaurant.name)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        View PDF
                      </Button>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(restaurant.verificationStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewRestaurantDetails(restaurant.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {restaurant.verificationStatus === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(restaurant.id, 'verified')}
                              disabled={updating === restaurant.id}
                              className="text-green-600 hover:text-green-800"
                            >
                              {updating === restaurant.id ? 
                                <Loader2 className="h-4 w-4 animate-spin" /> : 
                                <Check className="h-4 w-4" />
                              }
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(restaurant.id, 'rejected')}
                              disabled={updating === restaurant.id}
                              className="text-red-600 hover:text-red-800"
                            >
                              {updating === restaurant.id ? 
                                <Loader2 className="h-4 w-4 animate-spin" /> : 
                                <X className="h-4 w-4" />
                              }
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-gray-200">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              limit={pagination.limit}
              onPageChange={handlePageChange}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
            />
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={pdfModal.isOpen}
        onClose={handleClosePDF}
        filename={pdfModal.filename}
        restaurantName={pdfModal.restaurantName}
      />
    </div>
  );
} 