'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { Input, Button, Select } from '@/components/ui';
import Header from '@/components/layout/Header';
import { apiService } from '@/lib/api';
import { User, Mail, Lock, Phone, Store } from 'lucide-react';

const restaurantTypes = [
  { value: 'fast-food', label: 'Fast Food' },
  { value: 'casual-dining', label: 'Casual Dining' },
  { value: 'fine-dining', label: 'Fine Dining' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'bar', label: 'Bar' },
  { value: 'food-truck', label: 'Food Truck' },
  { value: 'buffet', label: 'Buffet' },
  { value: 'other', label: 'Other' }
];

export default function RestaurantSignup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Form data - removing file uploads for now
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    restaurantName: '',
    restaurantType: '',
    address: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateStep1 = () => {
    if (!formData.ownerName || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.restaurantName || !formData.restaurantType || !formData.address) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    try {
      // Send as JSON since files are optional
      const submitData = {
        ownerName: formData.ownerName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        restaurantName: formData.restaurantName,
        restaurantType: formData.restaurantType,
        address: formData.address
      };

      const response = await apiService.signupRestaurant(submitData);
      
      if (response.success && response.data) {
        localStorage.setItem('token', (response.data as any).token);
        localStorage.setItem('userType', 'restaurant');
        
        router.push('/restaurant/verification-pending');
      } else {
        setError(response.message || 'Signup failed');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Restaurant Portal" />
      <div className="flex-grow">
        <AuthCard 
          title="Join Fatoorty" 
          subtitle={step === 1 ? "Create your restaurant account" : "Tell us about your restaurant"}
        >
          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>

              <Input
                label="Owner Name"
                type="text"
                placeholder="Enter your full name"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                leftIcon={<User size={20} />}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                leftIcon={<Mail size={20} />}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                leftIcon={<Phone size={20} />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                leftIcon={<Lock size={20} />}
                required
              />

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
              >
                Next Step
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
              </div>

              <Input
                label="Restaurant Name"
                type="text"
                placeholder="Enter restaurant name"
                value={formData.restaurantName}
                onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                leftIcon={<Store size={20} />}
                required
              />

              <Select
                label="Restaurant Type"
                placeholder="Select restaurant type"
                value={formData.restaurantType}
                onChange={(value) => handleInputChange('restaurantType', value as string)}
                options={restaurantTypes}
                required
              />

              <Input
                label="Address"
                type="text"
                placeholder="Enter restaurant address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />

              <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p>Note: File uploads (Government ID and Restaurant Icon) are currently disabled.</p>
                <p>You can complete registration without them for now.</p>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="flex-1"
                >
                  Create Account
                </Button>
              </div>
            </form>
          )}
        </AuthCard>
      </div>
    </div>
  );
} 