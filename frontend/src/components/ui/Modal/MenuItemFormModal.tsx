import React, { useState, useEffect } from 'react';
import BaseModal, { BaseModalFooter } from './BaseModal';
import { Button } from '../Button';
import { Input } from '../Input';
import { X, Plus, Minus, Upload, ImageIcon } from 'lucide-react';
import { MenuItem, MenuItemFormData, MenuItemOption, MenuItemChoice } from '../../../types/api';
import { apiService } from '../../../lib/api';

interface MenuItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuItemFormData) => void;
  item?: MenuItem | null;
  loading?: boolean;
  categoryName: string;
}

const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  loading = false,
  categoryName
}) => {
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    image: null,
    price: 0,
    prepTime: undefined,
    ingredients: [],
    options: [],
    displayOrder: 0
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newIngredient, setNewIngredient] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        image: null,
        price: item.price,
        prepTime: item.prepTime,
        ingredients: [...item.ingredients],
        options: item.options.map(option => ({
          ...option,
          choices: [...option.choices]
        })),
        displayOrder: item.displayOrder
      });
      setImagePreview(item.image ? apiService.getMenuImageUrl(item.image) : null);
    } else {
      setFormData({
        name: '',
        description: '',
        image: null,
        price: 0,
        prepTime: undefined,
        ingredients: [],
        options: [],
        displayOrder: 0
      });
      setImagePreview(null);
    }
    setNewIngredient('');
    setErrors({});
  }, [item, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Item name must be at least 2 characters';
    } else if (formData.name.length > 80) {
      newErrors.name = 'Item name cannot exceed 80 characters';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    } else if (formData.price > 99999) {
      newErrors.price = 'Price cannot exceed 99,999';
    }

    if (formData.description && formData.description.length > 300) {
      newErrors.description = 'Description cannot exceed 300 characters';
    }

    if (formData.prepTime && (formData.prepTime < 1 || formData.prepTime > 240)) {
      newErrors.prepTime = 'Prep time must be between 1-240 minutes';
    }

    if (formData.ingredients.length > 20) {
      newErrors.ingredients = 'Cannot have more than 20 ingredients';
    }

    if (formData.options.length > 5) {
      newErrors.options = 'Cannot have more than 5 option groups';
    }

    // Validate option groups
    formData.options.forEach((option, index) => {
      if (!option.name.trim()) {
        newErrors[`option_${index}_name`] = 'Option name is required';
      }
      if (option.choices.length === 0) {
        newErrors[`option_${index}_choices`] = 'At least one choice is required';
      }
      if (option.choices.length > 10) {
        newErrors[`option_${index}_choices`] = 'Cannot have more than 10 choices per option';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size cannot exceed 5MB' });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Only image files are allowed' });
        return;
      }

      setFormData({ ...formData, image: file });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear image error
      const newErrors = { ...errors };
      delete newErrors.image;
      setErrors(newErrors);
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim() && formData.ingredients.length < 20) {
      if (newIngredient.length < 2 || newIngredient.length > 30) {
        setErrors({ ...errors, newIngredient: 'Ingredient must be 2-30 characters' });
        return;
      }
      
      if (formData.ingredients.includes(newIngredient.trim())) {
        setErrors({ ...errors, newIngredient: 'Ingredient already exists' });
        return;
      }

      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, newIngredient.trim()]
      });
      setNewIngredient('');
      
      // Clear ingredient error
      const newErrors = { ...errors };
      delete newErrors.newIngredient;
      delete newErrors.ingredients;
      setErrors(newErrors);
    }
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const addOption = () => {
    if (formData.options.length < 5) {
      setFormData({
        ...formData,
        options: [...formData.options, {
          name: '',
          type: 'single-select',
          required: false,
          choices: [{ name: '', priceModifier: 0, isDefault: false }]
        }]
      });
    }
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    });
  };

  const updateOption = (index: number, field: keyof MenuItemOption, value: any) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const addChoice = (optionIndex: number) => {
    const newOptions = [...formData.options];
    if (newOptions[optionIndex].choices.length < 10) {
      newOptions[optionIndex].choices.push({
        name: '',
        priceModifier: 0,
        isDefault: false
      });
      setFormData({ ...formData, options: newOptions });
    }
  };

  const removeChoice = (optionIndex: number, choiceIndex: number) => {
    const newOptions = [...formData.options];
    newOptions[optionIndex].choices = newOptions[optionIndex].choices.filter((_, i) => i !== choiceIndex);
    setFormData({ ...formData, options: newOptions });
  };

  const updateChoice = (optionIndex: number, choiceIndex: number, field: keyof MenuItemChoice, value: any) => {
    const newOptions = [...formData.options];
    newOptions[optionIndex].choices[choiceIndex] = {
      ...newOptions[optionIndex].choices[choiceIndex],
      [field]: value
    };
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? `Edit Item - ${categoryName}` : `Add New Item - ${categoryName}`}
      size="xl"
      loading={loading}
      footer={
        <BaseModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          cancelText="Cancel"
          confirmText={item ? 'Update Item' : 'Create Item'}
          confirmLoading={loading}
        />
      }
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Item Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter item name"
              error={errors.name}
              required
              maxLength={80}
            />
            <Input
              label="Price (SAR)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              step="0.01"
              min="0"
              max="99999"
              error={errors.price}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Prep Time (minutes)"
              type="number"
              value={formData.prepTime || ''}
              onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) || undefined })}
              placeholder="Optional"
              min="1"
              max="240"
              error={errors.prepTime}
            />
            <Input
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              placeholder="0"
              min="0"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the item..."
              rows={3}
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-between mt-1">
              <span className="text-sm text-red-600">{errors.description}</span>
              <span className="text-xs text-gray-500">
                {(formData.description || '').length}/300
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Image
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Item preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({ ...formData, image: null });
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="item-image"
                />
                <label htmlFor="item-image" className="cursor-pointer">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    Click to upload item image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </label>
              </div>
            )}
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingredients ({formData.ingredients.length}/20)
            </label>
            <div className="flex space-x-2 mb-3">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Add ingredient..."
                maxLength={30}
                className="flex-1"
                error={errors.newIngredient}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addIngredient();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addIngredient}
                disabled={!newIngredient.trim() || formData.ingredients.length >= 20}
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.ingredients && (
              <p className="text-red-500 text-sm mt-1">{errors.ingredients}</p>
            )}
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Item Options ({formData.options.length}/5)
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={formData.options.length >= 5}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>

            {formData.options.map((option, optionIndex) => (
              <div key={optionIndex} className="border rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Option Group {optionIndex + 1}</h4>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeOption(optionIndex)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label="Option Name"
                    value={option.name}
                    onChange={(e) => updateOption(optionIndex, 'name', e.target.value)}
                    placeholder="e.g., Size, Spice Level"
                    error={errors[`option_${optionIndex}_name`]}
                    required
                    maxLength={30}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={option.type}
                      onChange={(e) => updateOption(optionIndex, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="single-select">Single Select</option>
                      <option value="multi-select">Multi Select</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={option.required}
                      onChange={(e) => updateOption(optionIndex, 'required', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Required option</span>
                  </label>
                </div>

                {/* Choices */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Choices ({option.choices.length}/10)
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addChoice(optionIndex)}
                      disabled={option.choices.length >= 10}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Choice
                    </Button>
                  </div>

                  {option.choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex items-center space-x-2 mb-2">
                      <Input
                        value={choice.name}
                        onChange={(e) => updateChoice(optionIndex, choiceIndex, 'name', e.target.value)}
                        placeholder="Choice name"
                        maxLength={40}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={choice.priceModifier}
                        onChange={(e) => updateChoice(optionIndex, choiceIndex, 'priceModifier', parseFloat(e.target.value) || 0)}
                        placeholder="Price +/-"
                        step="0.01"
                        min="-999"
                        max="999"
                        className="w-24"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={choice.isDefault}
                          onChange={(e) => updateChoice(optionIndex, choiceIndex, 'isDefault', e.target.checked)}
                          className="mr-1"
                        />
                        <span className="text-xs text-gray-600">Default</span>
                      </label>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeChoice(optionIndex, choiceIndex)}
                        disabled={option.choices.length <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {errors[`option_${optionIndex}_choices`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`option_${optionIndex}_choices`]}</p>
                  )}
                </div>
              </div>
            ))}
            {errors.options && (
              <p className="text-red-500 text-sm mt-1">{errors.options}</p>
            )}
          </div>
        </form>
      </div>
    </BaseModal>
  );
};

export default MenuItemFormModal; 