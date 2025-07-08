'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Package,
  Eye,
  DollarSign,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Button, Input, StatCard } from '../../../../../../components/ui';
import MenuItemCard from '../../../../../../components/menu/MenuItemCard';
import MenuItemFormModal from '../../../../../../components/ui/Modal/MenuItemFormModal';
import { MenuItem, MenuItemFormData, MenuCategory } from '../../../../../../types/api';
import { apiService } from '../../../../../../lib/api';
import { toast } from 'react-toastify';

export default function MenuItemsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;

  const [category, setCategory] = useState<MenuCategory | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'unavailable'>('all');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load category and items
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load category details
      const categoryResponse = await apiService.getMenuCategories();
      if (categoryResponse.success && categoryResponse.data) {
        const foundCategory = categoryResponse.data.find(cat => cat._id === categoryId);
        setCategory(foundCategory || null);
      }

      // Load items for this category
      const itemsResponse = await apiService.getMenuItems(categoryId);
      if (itemsResponse.success && itemsResponse.data) {
        setItems(itemsResponse.data);
      } else {
        setItems([]);
      }
    } catch (error) {
      toast.error('Failed to load menu data');
      console.error('Error loading menu data:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      loadData();
    }
  }, [categoryId, loadData]);

  // Filter items based on search and status
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'available' && item.isAvailable) ||
      (filterStatus === 'unavailable' && !item.isAvailable);

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    totalItems: items.length,
    availableItems: items.filter(item => item.isAvailable).length,
    unavailableItems: items.filter(item => !item.isAvailable).length,
    averagePrice: items.length > 0 
      ? (items.reduce((sum, item) => sum + item.price, 0) / items.length).toFixed(2)
      : '0.00'
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowItemModal(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowItemModal(true);
  };

  const handleItemSubmit = async (data: MenuItemFormData) => {
    try {
      setSubmitting(true);
      
      if (editingItem) {
        await apiService.updateMenuItem(editingItem._id, data);
        toast.success('Item updated successfully');
      } else {
        await apiService.createMenuItem(categoryId, data);
        toast.success('Item created successfully');
      }
      
      setShowItemModal(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      toast.error(editingItem ? 'Failed to update item' : 'Failed to create item');
      console.error('Error saving item:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Category Not Found</h2>
            <p className="text-gray-600 mb-4">The requested category could not be found.</p>
            <Button onClick={() => router.push('/restaurant/menu')}>
              Back to Menu Categories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="hidden md:flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-400 transition-all duration-300 hover:text-gray-900 cursor-pointer  " onClick={() => router.push('/restaurant/menu')}>Menu Categories</h1>
            <ChevronRight className="w-4 h-4" />
            <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          </div>
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          loading={loading}
        />
        <StatCard
          title="Available Items"
          value={stats.availableItems}
          icon={Eye}
          loading={loading}
        />
        <StatCard
          title="Unavailable Items"
          value={stats.unavailableItems}
          icon={Clock}
          loading={loading}
        />
        <StatCard
          title="Average Price"
          value={`EGP ${stats.averagePrice}`}
          icon={DollarSign}
          loading={loading}
        />
      </div>

      {/* Search and Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Search */}
          <div className="col-span-4">
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-gray-500" />}
            />
          </div>

          {/* Status Filter */}
          <div className="col-span-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'available' | 'unavailable')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Items</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
          </div>

          {/* Add Item Button */}
          <div className="col-span-4 flex justify-end">
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          {searchTerm || filterStatus !== 'all' ? (
            <>
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">
                No items match your current search and filter criteria.
              </p>
            </>
          ) : (
            <>
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
              <p className="text-gray-500 mb-6">
                Get started by adding your first menu item to this category.
              </p>
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={handleAddItem}>
                Add Your First Item
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              onEdit={handleEditItem}
              onRefresh={loadData}
            />
          ))}
        </div>
      )}

      {/* Item Form Modal */}
      <MenuItemFormModal
        isOpen={showItemModal}
        onClose={() => {
          setShowItemModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleItemSubmit}
        item={editingItem}
        loading={submitting}
        categoryName={category.name}
      />
    </div>
  );
} 