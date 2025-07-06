import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, Image as ImageIcon, Eye } from 'lucide-react';
import { Button, Toggle } from '../ui';
import { MenuCategory } from '../../types/api';
import { apiService } from '../../lib/api';
import { toast } from 'react-toastify';

interface MenuCategoryCardProps {
  category: MenuCategory;
  onEdit: (category: MenuCategory) => void;
  onRefresh: () => void;
}

export default function MenuCategoryCard({
  category,
  onEdit,
  onRefresh
}: MenuCategoryCardProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticActive, setOptimisticActive] = useState(category.isActive);

  // Update optimistic state when category prop changes
  React.useEffect(() => {
    setOptimisticActive(category.isActive);
  }, [category.isActive]);

  const handleToggleStatus = async () => {
    const newStatus = !optimisticActive;
    
    // Optimistically update UI immediately
    setOptimisticActive(newStatus);
    
    setIsToggling(true);
    try {
      await apiService.toggleCategoryStatus(category._id);
      toast.success(`Category ${category.isActive ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticActive(category.isActive);
      toast.error(error instanceof Error ? error.message : 'Failed to toggle category status');
    } finally {
      setIsToggling(false);
    }
  };

  const handleViewItems = () => {
    router.push(`/restaurant/menu/${category._id}/items`);
  };

  const handleAddItem = () => {
    router.push(`/restaurant/menu/${category._id}/items`);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"? This will also delete all items in this category.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiService.deleteMenuCategory(category._id);
      toast.success('Category deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    return apiService.getMenuImageUrl(imagePath);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Category Header */}
      <div className="relative">
        {category.image ? (
          <img
            src={getImageUrl(category.image) || ''}
            alt={category.name}
            className="w-full h-32 object-cover"
          />
        ) : (
          <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              optimisticActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {optimisticActive ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Category Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-gray-600 mb-2">
                {category.description}
              </p>
            )}
            <div className="flex items-center text-xs text-gray-500 space-x-4">
              <span>{category.itemCount} items</span>
              <span>Order: {category.displayOrder}</span>
              {category.itemCount > 0 && (
                <button
                  onClick={handleViewItems}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View Items
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Toggle */}
        <div className="mb-4">
          <Toggle
            enabled={optimisticActive}
            onChange={handleToggleStatus}
            disabled={isToggling}
            label="Enable Category"
            description="Toggle to enable/disable this category"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit className="w-4 h-4" />}
              onClick={() => onEdit(category)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye className="w-4 h-4" />}
              onClick={handleViewItems}
            >
              View Items
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </div>
          
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={handleDelete}
            loading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
} 