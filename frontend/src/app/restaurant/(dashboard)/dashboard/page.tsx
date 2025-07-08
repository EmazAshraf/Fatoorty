'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { LogOut, ShoppingCart, DollarSign, Users, Utensils, QrCode, ClipboardList } from 'lucide-react';

interface DashboardUser {
  name: string;
}

export default function RestaurantDashboard() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'restaurant') {
      router.push('/restaurant/login');
      return;
    }

    // You can fetch user data here if needed
    setUser({ name: 'Restaurant Owner' });
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    router.push('/restaurant/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h2>
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            icon={<LogOut className="w-4 h-4" />}
          >
            Logout
          </Button>
        </div>
        <p className="text-gray-600">
          You have successfully logged in as a restaurant owner. From here you can manage your restaurant operations.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today&apos;s Orders</p>
              <p className="text-2xl font-semibold text-gray-900">42</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue Today</p>
              <p className="text-2xl font-semibold text-gray-900">$1,240</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tables</p>
              <p className="text-2xl font-semibold text-gray-900">12/20</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-md">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Staff Online</p>
              <p className="text-2xl font-semibold text-gray-900">8/12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center mb-3">
            <Utensils className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900 ml-2">Menu Management</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Create and manage your restaurant menus</p>
          <Button variant="outline" size="sm" className="w-full">
            Manage Menu →
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center mb-3">
            <QrCode className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900 ml-2">QR Code Generator</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Generate QR codes for tables</p>
          <Button variant="outline" size="sm" className="w-full">
            Generate QR →
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center mb-3">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900 ml-2">Order Management</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">View and manage incoming orders</p>
          <Button variant="outline" size="sm" className="w-full">
            View Orders →
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">New order from Table 5</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">New</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Payment received - $45.50</p>
              <p className="text-xs text-gray-500">5 minutes ago</p>
            </div>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Payment</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Table 3 requested service</p>
              <p className="text-xs text-gray-500">8 minutes ago</p>
            </div>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Service</span>
          </div>
        </div>
      </div>
    </div>
  );
} 