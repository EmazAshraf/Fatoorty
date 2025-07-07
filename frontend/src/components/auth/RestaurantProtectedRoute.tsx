'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Loader2 } from 'lucide-react';
interface RestaurantProtectedRouteProps {
  children: React.ReactNode;
}

export default function RestaurantProtectedRoute({ children }: RestaurantProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        if (!token || userType !== 'restaurant') {
          router.push('/restaurant/login');
          return;
        }

        // Since we do status checking at login, if user has a token and made it here,
        // they should have access. But let's do a quick verification.
        try {
          // Try to make an authenticated request to verify token is still valid
          await apiService.getRestaurantStatus();
          setAuthorized(true);
        } catch (error: any) {
          console.error('Token validation failed:', error);
          
          // Token is invalid or expired
          localStorage.clear();
          router.push('/restaurant/login');
          return;
        }
      } catch (error: any) {
        console.error('Access check failed:', error);
        
        // Handle network errors gracefully - allow access if token exists locally
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        
        if (token && userType === 'restaurant') {
          setAuthorized(true);
        } else {
          router.push('/restaurant/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center flex justify-center items-center flex-col">
          <Loader2 className="animate-spin" />
          <p className="mt-4 text-gray-600">Verifying access</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
} 