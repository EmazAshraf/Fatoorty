'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid3X3, CheckCircle, Package, Eye } from 'lucide-react';
import { Button, Input, StatCard } from '../../../../components/ui';
import MenuCategoryCard from '../../../../components/menu/MenuCategoryCard';
import CategoryFormModal from '../../../../components/ui/Modal/CategoryFormModal';
import { MenuCategory } from '../../../../types/api';
import { apiService } from '../../../../lib/api';
import { toast } from 'react-toastify';

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | undefined>();

  // Load menu categories
  const loadCategories = async () => {
    try {
      const response = await apiService.getFullMenu();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      toast.error('Failed to load menu categories');
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleCategoryModalClose = () => {
    setShowCategoryModal(false);
    setEditingCategory(undefined);
  };

  const handleCategorySuccess = () => {
    loadCategories();
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Categories"
          value={categories.length}
          icon={Grid3X3}
          loading={loading}
        />
        <StatCard
          title="Active Categories"
          value={categories.filter(c => c.isActive).length}
          icon={CheckCircle}
          loading={loading}
        />
        <StatCard
          title="Total Items"
          value={categories.reduce((sum, c) => sum + c.itemCount, 0)}
          icon={Package}
          loading={loading}
        />
        <StatCard
          title="Available Items"
          value={categories.reduce((sum, c) => sum + (c.items?.filter(i => i.isAvailable).length || 0), 0)}
          icon={Eye}
          loading={loading}
        />
      </div>

      {/* Search and Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex item-center justify-between">
          {/* Search */}
          <div className="w-1/3">
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-gray-500" />}
            />
          </div>

          {/* Add Category Button */}
          <div className="w-1/4 flex justify-end">
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleAddCategory}
            >
              Add Category
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          {searchTerm ? (
            <>
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500">
                No categories match your search term "{searchTerm}".
              </p>
            </>
          ) : (
            <>
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-500 mb-6">
                Get started by creating your first menu category.
              </p>
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={handleAddCategory}>
                Add Your First Category
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <MenuCategoryCard
              key={category._id}
              category={category}
              onEdit={handleEditCategory}
              onRefresh={loadCategories}
            />
          ))}
        </div>
      )}

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={showCategoryModal}
        onClose={handleCategoryModalClose}
        onSuccess={handleCategorySuccess}
        category={editingCategory}
      />
    </div>
  );
} 