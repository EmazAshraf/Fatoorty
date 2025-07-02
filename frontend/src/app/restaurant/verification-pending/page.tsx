'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusPage from '@/components/auth/StatusPage';
import { Clock } from 'lucide-react';

export default function VerificationPendingPage() {
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

    // If user has a token, they might have full access - redirect to check
    if (token) {
      router.push('/restaurant/dashboard');
      return;
    }

    // Get restaurant info from localStorage
    if (storedInfo) {
      const info = JSON.parse(storedInfo);
      if (info.verificationStatus !== 'pending') {
        // Redirect to appropriate page based on actual status
        if (info.verificationStatus === 'rejected') {
          router.push('/restaurant/verification-rejected');
        } else if (info.accountStatus === 'suspended') {
          router.push('/restaurant/account-suspended');
        } else {
          router.push('/restaurant/access-denied');
        }
        return;
      }
      setRestaurantInfo(info);
    }

    setLoading(false);
  }, [router]);

  const handleCheckStatus = () => {
    // Refresh the page to re-check status
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/restaurant/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <StatusPage
      type="pending"
      title="Verification Pending"
      message="Your restaurant registration is under review. Our team is verifying your documents and information."
      restaurantName={restaurantInfo?.name}
      details={[
        'We are reviewing your government ID document',
        'Verification typically takes 1-3 business days',
        'You will receive an email notification once approved',
        'Ensure your contact information is up to date'
      ]}
      actions={[
        {
          label: 'Check Status Again',
          onClick: handleCheckStatus,
          primary: true
        },
        {
          label: 'Contact Support',
          href: 'mailto:support@fatoorty.com',
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