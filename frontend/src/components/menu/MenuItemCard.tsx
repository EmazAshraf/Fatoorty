import React, { useState } from 'react';
import { Edit, Trash2, Clock, Star, Image as ImageIcon } from 'lucide-react';
import { Button, Toggle, Badge } from '../ui';
import { MenuItem } from '../../types/api';
import { apiService } from '../../lib/api';
import { toast } from 'react-toastify';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem) => void;
  onRefresh: () => void;
}

export default function MenuItemCard({
  item,
  onEdit,
  onDelete,
  onToggleAvailability,
  onRefresh
}: MenuItemCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticAvailable, setOptimisticAvailable] = useState(item.isAvailable);

  // Update optimistic state when item prop changes
  React.useEffect(() => {
    setOptimisticAvailable(item.isAvailable);
  }, [item.isAvailable]);

  const handleToggleAvailability = async () => {
    const newStatus = !optimisticAvailable;
    
    // Optimistically update UI immediately
    setOptimisticAvailable(newStatus);
    
    setIsToggling(true);
    try {
      await apiService.toggleItemAvailability(item._id);
      toast.success(`Item ${item.isAvailable ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticAvailable(item.isAvailable);
      toast.error(error instanceof Error ? error.message : 'Failed to toggle item availability');
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiService.deleteMenuItem(item._id);
      toast.success('Menu item deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    return apiService.getMenuImageUrl(imagePath);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Item Header */}
      <div className="relative">
        {item.image ? (
          <img
            src={getImageUrl(item.image) || ''}
            alt={item.name}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              optimisticAvailable
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {optimisticAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-semibold">
            {formatPrice(item.price)}
          </span>
        </div>
      </div>

      {/* Item Content */}
      <div className="p-4">
        <div className="mb-3">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">
            {item.name}
          </h4>
          {item.description && (
            <p className="text-sm text-gray-600 mb-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Item Details */}
        <div className="flex items-center text-xs text-gray-500 space-x-4 mb-3">
          {item.rating.count > 0 && (
            <div className="flex items-center">
              <Star className="w-3 h-3 text-yellow-400 mr-1" />
              <span>{item.rating.average.toFixed(1)} ({item.rating.count})</span>
            </div>
          )}
          {item.prepTime && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{item.prepTime} min</span>
            </div>
          )}
          <span>Orders: {item.totalOrders}</span>
        </div>

        {/* Ingredients */}
        {item.ingredients.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {item.ingredients.slice(0, 5).map((ingredient, index) => (
                <Badge key={index} variant="default" className="text-xs">
                  {ingredient}
                </Badge>
              ))}
              {item.ingredients.length > 5 && (
                <Badge variant="default" className="text-xs">
                  +{item.ingredients.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Options */}
        {item.options.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Options:</p>
            <div className="flex flex-wrap gap-1">
              {item.options.map((option, index) => (
                <Badge key={index} variant="info" className="text-xs">
                  {option.name} ({option.choices.length} choices)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Toggle */}
        <div className="mb-4">
          <Toggle
            enabled={optimisticAvailable}
            onChange={handleToggleAvailability}
            disabled={isToggling}
            label="Available"
            description="Toggle item availability"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => onEdit(item)}
          >
            Edit
          </Button>
          
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