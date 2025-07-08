import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import BaseModal, { BaseModalFooter } from './BaseModal';
import { Input } from '../';
import { MenuCategory, MenuCategoryFormData } from '../../../types/api';
import { apiService } from '../../../lib/api';
import { toast } from 'react-toastify';
import Image from 'next/image';
interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: MenuCategory;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  category
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState<MenuCategoryFormData>({
    name: '',
    description: '',
    image: null,
    displayOrder: 0
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = Boolean(category);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name,
          description: category.description || '',
          image: null,
          displayOrder: category.displayOrder
        });
        if (category.image) {
          setImagePreview(apiService.getMenuImageUrl(category.image));
        }
      } else {
        setFormData({
          name: '',
          description: '',
          image: null,
          displayOrder: 0
        });
        setImagePreview(null);
      }
      setErrors({});
    }
  }, [isOpen, category]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Category name cannot exceed 50 characters';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof MenuCategoryFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && category) {
        await apiService.updateMenuCategory(category._id, formData);
        toast.success('Category updated successfully');
      } else {
        await apiService.createMenuCategory(formData);
        toast.success('Category created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      image: null,
      displayOrder: 0
    });
    setImagePreview(null);
    setErrors({});
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Category' : 'Add New Category'}
      size="md"
      loading={isSubmitting}
      footer={
        <BaseModalFooter
          onCancel={handleClose}
          onConfirm={handleSubmit}
          cancelText="Cancel"
          confirmText={isEditing ? 'Update Category' : 'Create Category'}
          confirmLoading={isSubmitting}
        />
      }
    >
      <div className="space-y-4">
        {/* Category Name */}
        <Input
          label="Category Name"
          placeholder="e.g., Starters, Main Course, Beverages"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
          required
          maxLength={50}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm
              placeholder-gray-400 text-gray-900 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of this category..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            maxLength={200}
          />
          <div className="flex justify-between mt-1">
            <span className="text-sm text-red-600">{errors.description}</span>
            <span className="text-xs text-gray-500">
              {(formData.description || '').length}/200
            </span>
          </div>
        </div>

        {/* Display Order */}
        <Input
          label="Display Order"
          type="number"
          placeholder="0"
          value={formData.displayOrder}
          onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
          helperText="Lower numbers appear first"
          min={0}
        />

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Image
          </label>
          
          {imagePreview ? (
            <div className="relative">
              <Image
                src={imagePreview}
                alt="Category preview"
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
                width={128}
                height={128}
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="category-image"
              />
              <label htmlFor="category-image" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload category image
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </label>
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
} 