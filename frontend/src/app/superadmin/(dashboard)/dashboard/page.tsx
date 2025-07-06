'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/ui';
import TopRestaurantsChart from '@/components/dashboard/TopRestaurantsChart';
import EarningsChart from '@/components/dashboard/EarningsChart';
import { 
  Users, 
  UserCheck, 
  DollarSign 
} from 'lucide-react';

export default function SuperadminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topRestaurantsPeriod, setTopRestaurantsPeriod] = useState('restaurant');
  const [earningsPeriod, setEarningsPeriod] = useState('restaurant');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'superadmin') {
      router.push('/superadmin/login');
      return;
    }

    setUser({ name: 'Superadmin User' });
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    router.push('/superadmin/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-lg ">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>        
      </div>
      

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Restaurants"
          value="50"
          icon={Users}
        />
        
        <StatCard
          title="Total Staff"
          value="50"
          icon={UserCheck}
        />
        
        <StatCard
          title="Total Earnings"
          value="$2000.00"
          icon={DollarSign}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Top Restaurants Chart */}
        <TopRestaurantsChart />
        
        {/* Earnings Chart */}
        <EarningsChart 
          selectedPeriod={earningsPeriod}
          onPeriodChange={setEarningsPeriod}
        />
      </div>
    </div>
  );
} 