'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { Input, Button } from '@/components/ui';
import Header from '@/components/layout/Header';
import { apiService } from '@/lib/api';
import { Mail, Lock, Store } from 'lucide-react';
import { getErrorMessage } from '@/lib/utils';

export default function RestaurantLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError('');

      const response = await apiService.loginRestaurant(email, password);
      
      // Handle successful authentication
      if (response.success && response.data?.token) {
        // Store token and user info
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'restaurant');
        localStorage.setItem('userInfo', JSON.stringify({
          id: response.data.owner.id,
          name: response.data.owner.name,
          email: response.data.owner.email,
          restaurant: response.data.restaurant
        }));
        
        // Redirect to dashboard
        router.push(response.redirectTo || '/restaurant/dashboard');
        return;
      }

      // Handle status-based responses (no token provided)
      if (!response.success && response.errors?.redirectTo) {
        // Store minimal info for status pages
        localStorage.setItem('userType', 'restaurant');
        localStorage.setItem('restaurantInfo', JSON.stringify({
          name: response.errors.restaurant.name,
          verificationStatus: response.errors.verificationStatus,
          accountStatus: response.errors.accountStatus
        }));
        
        // Redirect to appropriate status page
        router.push(response.errors.redirectTo);
        return;
      }

      // Handle other errors
      setError(response.message || 'Login failed. Please try again.');

    } catch (err) {
      console.error('Login error:', err);
    
      // Handle network errors gracefully
      if (err instanceof Error) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          setError('Unable to connect to server. Please check your internet connection and try again.');
        } else {
          setError(getErrorMessage(err) || 'An unexpected error occurred. Please try again.');
        }
      } else {
        // Handle unknown error shapes (non-Error objects)
        setError('An unexpected error occurred. Please try again.');
      }
    }
     finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Restaurant Portal" />
      <div className="flex-grow">
        <AuthCard 
          title="Welcome Back" 
          subtitle="Sign in to manage your restaurant"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={20} />}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={20} />}
              required
            />

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <a href="/restaurant/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign up here
                </a>
              </p>
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
} 