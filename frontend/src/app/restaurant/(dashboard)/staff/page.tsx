'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  UserCheck,
  UserX,
  DollarSign
} from 'lucide-react';
import dayjs from 'dayjs';

// Import our new UI components
import { 
  Button, 
  Input, 
  Select, 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Modal, 
  ModalFooter, 
  Badge,
  type SelectOption 
} from '@/components/ui';
import { apiService } from '@/lib/api';
import type { StaffMember, StaffFormData, StaffStats } from '@/types/api';
import DateRangePicker from '@/components/ui/DateRangePicker';

// Position options
const positionOptions: SelectOption[] = [
  { value: 'accountant', label: 'Accountant' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'chef', label: 'Chef' },
  { value: 'cleaner', label: 'Cleaner' },
  { value: 'delivery', label: 'Delivery Staff' },
  { value: 'hr', label: 'HR' },
  { value: 'inventory_manager', label: 'Inventory Manager' },
  { value: 'manager', label: 'Manager' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'security', label: 'Security' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'waiter', label: 'Waiter' },
  { value: 'other', label: 'Other' } // Always last
];


const statusOptions: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function StaffManagementPage() {
  // State
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  
  // Form data
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    phone: '',
    position: '',
    salary: 0,
    joiningDate: '',
    status: 'active',
    image: null
  });

  // Load staff data
  const loadStaff = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await apiService.getStaff({
        page,
        limit: 10,
        search
      });
      
      if (response.success) {
        console.log('setstaff', response.data);
        setStaff(response.data || []);
        if (response.pagination) {
          setCurrentPage(response.pagination.currentPage);
          setTotalPages(response.pagination.totalPages);
          setTotalCount(response.pagination.totalCount);
        }
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const response = await apiService.getStaffStats();
      if (response.success) {
        setStats(response.data || null);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadStaff();
    loadStats();
  }, []);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    loadStaff(1, value);
  };

  // Handle position filter
  const handlePositionFilter = (value: string | number) => {
    setSelectedPosition(value as string);
    // TODO: Implement position filtering in loadStaff
  };

  // Handle status filter
  const handleStatusFilter = (value: string | number) => {
    setSelectedStatus(value as string);
    // TODO: Implement status filtering in loadStaff
  };

  // Handle date range filter
  const handleDateRangeFilter = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
    // TODO: Implement date range filtering in loadStaff
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    loadStaff(page, searchTerm);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      salary: 0,
      joiningDate: '',
      status: 'active',
      image: null
    });
  };

  // Handle add staff
  const handleAddStaff = async () => {
    try {
      setActionLoading('add');

      const response = await apiService.createStaff(formData);
      console.log('response',response);
      
      if (response.success) {
        setAddModalOpen(false);
        resetForm();
        loadStaff(currentPage, searchTerm);
        loadStats();
      }
    } catch (error) {
      console.error('Error adding staff:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle edit staff
  const handleEditStaff = async () => {
    if (!selectedStaff) return;
    
    try {
      setActionLoading('edit');
      const response = await apiService.updateStaff(selectedStaff._id, formData);
      
      if (response.success) {
        setEditModalOpen(false);
        setSelectedStaff(null);
        resetForm();
        loadStaff(currentPage, searchTerm);
        loadStats();
      }
    } catch (error) {
      console.error('Error updating staff:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete staff
  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;
    
    try {
      setActionLoading('delete');
      const response = await apiService.deleteStaff(selectedStaff._id);
      
      if (response.success) {
        setDeleteModalOpen(false);
        setSelectedStaff(null);
        loadStaff(currentPage, searchTerm);
        loadStats();
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Open edit modal
  const openEditModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      position: staffMember.position,
      salary: staffMember.salary,
      joiningDate: staffMember.joiningDate,
      status: staffMember.status,
      image: null
    });
    setEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setDeleteModalOpen(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeStaff}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <UserX className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Staff</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactiveStaff}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Salary</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalSalaryExpense)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="md:col-span-3">
            <Input
              placeholder="Search staff members..."
              value={searchTerm}
              onChange={handleSearch}
              leftIcon={<Search className="w-4 h-4 text-gray-500" />}
            />
          </div>

          {/* Position Filter */}
          <div className="md:col-span-2">
            <Select
              value={selectedPosition}
              onChange={handlePositionFilter}
              options={[
                { value: '', label: 'All Positions' },
                ...positionOptions
              ]}
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <Select
              value={selectedStatus}
              onChange={handleStatusFilter}
              options={[
                { value: '', label: 'All Status' },
                ...statusOptions
              ]}
            />
          </div>

          {/* Date Range */}
          <div className="md:col-span-3">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateChange={handleDateRangeFilter}
            />
          </div>

          {/* Add Staff Button */}
          <div className="md:col-span-2 flex justify-end">
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setAddModalOpen(true)}
            >
              Add Staff
            </Button>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading staff...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No staff members found
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((staffMember) => (
                  <TableRow key={staffMember._id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        <img 
                          src="/User.jpg" 
                          alt={staffMember.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const imgElement = e.currentTarget;
                            const parentDiv = imgElement.parentElement;
                            if (parentDiv) {
                              imgElement.style.display = 'none';
                              const iconElement = parentDiv.querySelector('.fallback-icon') as HTMLElement;
                              if (iconElement) {
                                iconElement.style.display = 'flex';
                              }
                            }
                          }}
                        />
                        <Users className="w-5 h-5 text-gray-400 hidden fallback-icon" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{staffMember.name}</TableCell>
                    <TableCell>{staffMember.email}</TableCell>
                    <TableCell>{staffMember.phone}</TableCell>
                    <TableCell className="capitalize">{staffMember.position}</TableCell>
                    <TableCell>{formatCurrency(staffMember.salary)}</TableCell>
                    <TableCell>{dayjs(staffMember.joiningDate).format('MMM DD, YYYY')}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={staffMember.status === 'active' ? 'success' : 'error'}
                        size="sm"
                      >
                        {staffMember.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(staffMember)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(staffMember)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Staff Member"
        size="lg"
        footer={
          <ModalFooter
            onCancel={() => setAddModalOpen(false)}
            onConfirm={handleAddStaff}
            confirmText="Add Staff"
            confirmLoading={actionLoading === 'add'}
          />
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
          <Select
            label="Position"
            value={formData.position}
            onChange={(value) => setFormData(prev => ({ ...prev, position: value as string }))}
            options={positionOptions}
            required
          />
          <Input
            label="Salary"
            type="number"
            value={formData.salary.toString()}
            onChange={(e) => setFormData(prev => ({ ...prev, salary: Number(e.target.value) }))}
            required
          />
          <Input
            label="Joining Date"
            type="date"
            value={formData.joiningDate}
            onChange={(e) => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))}
            required
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}
            options={statusOptions}
            required
          />
        </div>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Staff Member"
        size="lg"
        footer={
          <ModalFooter
            onCancel={() => setEditModalOpen(false)}
            onConfirm={handleEditStaff}
            confirmText="Update Staff"
            confirmLoading={actionLoading === 'edit'}
          />
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
          <Select
            label="Position"
            value={formData.position}
            onChange={(value) => setFormData(prev => ({ ...prev, position: value as string }))}
            options={positionOptions}
            required
          />
          <Input
            label="Salary"
            type="number"
            value={formData.salary.toString()}
            onChange={(e) => setFormData(prev => ({ ...prev, salary: Number(e.target.value) }))}
            required
          />
          <Input
            label="Joining Date"
            type="date"
            value={formData.joiningDate}
            onChange={(e) => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))}
            required
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}
            options={statusOptions}
            required
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Staff Member"
        footer={
          <ModalFooter
            onCancel={() => setDeleteModalOpen(false)}
            onConfirm={handleDeleteStaff}
            confirmText="Delete"
            confirmVariant="danger"
            confirmLoading={actionLoading === 'delete'}
          />
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{selectedStaff?.name}</strong>? 
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
} 