'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusPage from '@/components/auth/StatusPage';
import { XCircle } from 'lucide-react';

export default function VerificationRejectedPage() {
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
      if (info.verificationStatus !== 'rejected') {
        // Redirect to appropriate page based on actual status
        if (info.verificationStatus === 'pending') {
          router.push('/restaurant/verification-pending');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-8 h-8 animate-pulse text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <StatusPage
      type="rejected"
      title="Verification Rejected"
      message="Unfortunately, your restaurant verification has been rejected. Please review the information below and contact support."
      restaurantName={restaurantInfo?.name}
      details={[
        'Your submitted documents did not meet our verification requirements',
        'Common issues: unclear images, expired documents, mismatched information',
        'Please ensure all documents are clear and up-to-date',
        'You can resubmit your application after addressing the issues'
      ]}
      actions={[
        {
          label: 'Contact Support',
          href: 'mailto:support@fatoorty.com',
          primary: true
        },
        {
          label: 'Resubmit Application',
          href: '/restaurant/signup',
          primary: false
        }
      ]}
    />
  );
} 