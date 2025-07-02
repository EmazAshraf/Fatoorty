'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Calendar,
  Eye,
  Check,
  X,
  ChevronDown,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Store,
  Users,
  Loader2
} from 'lucide-react';
import { apiService } from '@/lib/api';
import StatCard from '@/components/dashboard/StatCard';
import { Table, Button, Input, Select, Badge, Modal, type Column, type SelectOption } from '@/components/ui';
import Pagination from '@/components/ui/Pagination';
import DateRangePicker from '@/components/ui/DateRangePicker';
import PDFViewerModal from '@/components/ui/PDFViewerModal';

interface Restaurant {
  id: string;
  name: string;
  email: string;
  address: string;
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
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
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

  const [bulkActionModal, setBulkActionModal] = useState<{
    isOpen: boolean;
    action: 'verified' | 'rejected' | null;
  }>({
    isOpen: false,
    action: null
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
        setRestaurants(response.data);
        setPagination(response.pagination);
        
        // Calculate stats from the data
        const pending = response.data.filter((r: Restaurant) => r.verificationStatus === 'pending').length;
        const verified = response.data.filter((r: Restaurant) => r.verificationStatus === 'verified').length;
        const rejected = response.data.filter((r: Restaurant) => r.verificationStatus === 'rejected').length;
        
        setStats({
          totalRestaurants: response.pagination.totalCount,
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
  }, [filters]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page);
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSelectedRestaurants([]);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setSelectedRestaurants([]);
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

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedRestaurants.length === 0) return;

    try {
      setLoading(true);
      await apiService.bulkUpdateVerificationStatus(selectedRestaurants, action);
      
      // Refresh data
      await fetchData(pagination.currentPage);
      setSelectedRestaurants([]);
      setBulkActionModal({ isOpen: false, action: null });
      
      console.log(`Bulk ${action} completed for ${selectedRestaurants.length} restaurants`);
    } catch (error) {
      console.error('Error in bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRestaurants(restaurants.map(r => r.id));
    } else {
      setSelectedRestaurants([]);
    }
  };

  // Handle select restaurant
  const handleSelectRestaurant = (restaurantId: string, checked: boolean) => {
    if (checked) {
      setSelectedRestaurants(prev => [...prev, restaurantId]);
    } else {
      setSelectedRestaurants(prev => prev.filter(id => id !== restaurantId));
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

  // Table columns
  const columns: Column<Restaurant>[] = [
    {
      key: 'select',
      title: (
        <input
          type="checkbox"
          checked={selectedRestaurants.length === restaurants.length && restaurants.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      ),
      width: 50,
      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedRestaurants.includes(record.id)}
          onChange={(e) => handleSelectRestaurant(record.id, e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      )
    },
    {
      key: 'restaurant',
      title: 'Restaurant',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10">
            {record.logo ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/files/restaurant-icon/${record.logo}`}
                alt={record.name}
                className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
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
              className={`h-10 w-10 rounded-full bg-green-500 flex items-center justify-center ${record.logo ? 'hidden' : ''}`}
            >
              <Store className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{record.name}</div>
            <div className="text-sm text-gray-500">{record.type}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (_, record) => (
        <div>
          <div className="text-sm text-gray-900">{record.email}</div>
          <div className="text-sm text-gray-500">{record.owner.phone}</div>
        </div>
      )
    },
    {
      key: 'address',
      title: 'Address',
      dataIndex: 'address',
      render: (value) => (
        <div className="text-sm text-gray-900 max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'requestDate',
      title: 'Request Date',
      dataIndex: 'createdAt',
      render: (value) => (
        <div className="text-sm text-gray-900">{formatDate(value)}</div>
      )
    },
    {
      key: 'governmentId',
      title: 'Government ID',
      render: (_, record) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewPDF(record.governmentIdUrl, record.name)}
          className="text-blue-600 hover:text-blue-800"
        >
          <FileText className="w-4 h-4 mr-1" />
          View PDF
        </Button>
      )
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'verificationStatus',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewRestaurantDetails(record.id)}
            icon={<Eye className="h-4 w-4" />}
          />
          
          {record.verificationStatus === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusUpdate(record.id, 'verified')}
                disabled={updating === record.id}
                className="text-green-600 hover:text-green-800"
                icon={updating === record.id ? 
                  <Loader2 className="h-4 w-4 animate-spin" /> : 
                  <Check className="h-4 w-4" />
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusUpdate(record.id, 'rejected')}
                disabled={updating === record.id}
                className="text-red-600 hover:text-red-800"
                icon={updating === record.id ? 
                  <Loader2 className="h-4 w-4 animate-spin" /> : 
                  <X className="h-4 w-4" />
                }
              />
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Verification</h1>
        <p className="text-gray-600 mt-1">Review and manage restaurant verification requests</p>
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

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search restaurants..."
            value={filters.search}
            onChange={handleSearch}
            leftIcon={<Search className="w-4 h-4" />}
          />
          
          <Select
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value as string)}
            options={statusOptions}
          />
          
          <Select
            value={filters.sortBy}
            onChange={(value) => handleFilterChange('sortBy', value as string)}
            options={sortOptions}
          />
          
          <Select
            value={filters.sortOrder}
            onChange={(value) => handleFilterChange('sortOrder', value as string)}
            options={sortOrderOptions}
          />
        </div>
        
        <div className="mt-4">
          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            onDateChange={handleDateRangeChange}
          />
        </div>

        {/* Bulk Actions */}
        {selectedRestaurants.length > 0 && (
          <div className="mt-4 flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedRestaurants.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkActionModal({ isOpen: true, action: 'verified' })}
              icon={<Check className="h-4 w-4" />}
            >
              Accept All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkActionModal({ isOpen: true, action: 'rejected' })}
              icon={<X className="h-4 w-4" />}
            >
              Reject All
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table
          columns={columns}
          data={restaurants}
          loading={loading}
          rowKey="id"
          hoverable
          empty={
            <div className="text-center py-12">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No verification requests found</p>
              <p className="text-gray-500">Verification requests will appear here when restaurants submit them.</p>
            </div>
          }
        />

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

      {/* Bulk Action Confirmation Modal */}
      <Modal
        isOpen={bulkActionModal.isOpen}
        onClose={() => setBulkActionModal({ isOpen: false, action: null })}
        title={`Bulk ${bulkActionModal.action === 'verified' ? 'Accept' : 'Reject'} Confirmation`}
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setBulkActionModal({ isOpen: false, action: null })}
            >
              Cancel
            </Button>
            <Button 
              variant={bulkActionModal.action === 'verified' ? 'primary' : 'danger'}
              onClick={() => bulkActionModal.action && handleBulkAction(bulkActionModal.action)}
            >
              {bulkActionModal.action === 'verified' ? 'Accept' : 'Reject'} {selectedRestaurants.length} Restaurant(s)
            </Button>
          </div>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to {bulkActionModal.action === 'verified' ? 'accept' : 'reject'} {selectedRestaurants.length} restaurant verification request(s)? 
          This action cannot be undone.
        </p>
      </Modal>

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