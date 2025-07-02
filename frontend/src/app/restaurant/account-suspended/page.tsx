'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusPage from '@/components/auth/StatusPage';
import { AlertTriangle } from 'lucide-react';

export default function AccountSuspendedPage() {
  const [restaurantInfo, setRestaurantInfo] = useState<{
    name: string;
    verificationStatus: string;
    accountStatus: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user should be on this page
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');
    const storedInfo = localStorage.getItem('restaurantInfo');

    if (userType !== 'restaurant') {
      router.push('/restaurant/login');
      return;
    }

    // If user has a token but account is suspended, clear it
    if (token) {
      localStorage.removeItem('token');
    }

    // Get restaurant info from localStorage
    if (storedInfo) {
      const info = JSON.parse(storedInfo);
      if (info.accountStatus !== 'suspended') {
        // Redirect to appropriate page based on actual status
        if (info.verificationStatus === 'pending') {
          router.push('/restaurant/verification-pending');
        } else if (info.verificationStatus === 'rejected') {
          router.push('/restaurant/verification-rejected');
        } else {
          router.push('/restaurant/access-denied');
        }
        return;
      }
      setRestaurantInfo(info);
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/restaurant/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 animate-pulse text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <StatusPage
      type="suspended"
      title="Account Suspended"
      message="Your restaurant account has been temporarily suspended. Please contact our support team to resolve this issue."
      restaurantName={restaurantInfo?.name}
      details={[
        'Your account access has been temporarily restricted',
        'This may be due to policy violations or account issues',
        'All restaurant operations are currently on hold',
        'Contact our support team for immediate assistance'
      ]}
      actions={[
        {
          label: 'Contact Support',
          href: 'mailto:support@fatoorty.com',
          primary: true
        },
        {
          label: 'Appeal Suspension',
          href: 'mailto:appeals@fatoorty.com',
          primary: false
        },
        {
          label: 'Logout',
          onClick: handleLogout,
          primary: false
        }
      ]}
    />
  );
} 