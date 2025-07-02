'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusPage from '@/components/auth/StatusPage';
import { Shield } from 'lucide-react';

export default function AccessDeniedPage() {
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
    const storedInfo = localStorage.getItem('restaurantInfo');

    if (userType !== 'restaurant') {
      router.push('/restaurant/login');
      return;
    }

    // Get restaurant info from localStorage
    if (storedInfo) {
      const info = JSON.parse(storedInfo);
      setRestaurantInfo(info);
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/restaurant/login');
  };

  const handleRetryLogin = () => {
    localStorage.clear();
    router.push('/restaurant/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-8 h-8 animate-pulse text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <StatusPage
      type="pending"
      title="Access Denied"
      message="We're unable to process your request at this time. Please contact support for assistance."
      restaurantName={restaurantInfo?.name}
      details={[
        'Your account status could not be determined',
        'This may be a temporary system issue',
        'Please contact support for immediate assistance',
        'Have your account details ready when contacting us'
      ]}
      actions={[
        {
          label: 'Contact Support',
          href: 'mailto:support@fatoorty.com',
          primary: true
        },
        {
          label: 'Try Login Again',
          onClick: handleRetryLogin,
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