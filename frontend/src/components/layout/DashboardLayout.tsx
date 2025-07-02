'use client';

import { useState } from 'react';
import { brandColors } from '@/lib/colors';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProfileDropdown from './ProfileDropdown';
import { 
  LayoutDashboard, 
  Store, 
  CheckCircle, 
  DollarSign, 
  HeadphonesIcon, 
  Settings,
  ShoppingCart,
  Users,
  Utensils,
  Star,
  CreditCard,
  Crown,
  Menu,
  X,
  Bell
} from 'lucide-react';

export interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  role: 'superadmin' | 'restaurant';
}

export default function DashboardLayout({ children, sidebarItems, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Full Width with Brand Color */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 h-16 shadow-md flex items-center justify-between px-6"
        style={{ backgroundColor: brandColors.primary }}
      >
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white hover:text-gray-200 mr-4"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <Image
              src="/fatoorty-logo.png"
              alt="Fatoorty Logo"
              width={96}
              height={96}
              className="w-20"
            />
            
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <Bell size={20} />
          </button>
          <div className="text-white">
            <ProfileDropdown userRole={role} />
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Height */}
      <div className={`
        fixed top-16 left-0 bottom-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full overflow-y-auto">
          <nav className="mt-6 px-3 pb-6">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                        ${active 
                          ? 'text-white shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                      style={active ? { backgroundColor: brandColors.primary } : {}}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon 
                        size={20} 
                        className={`mr-3 ${active ? 'text-white' : 'text-gray-400'}`} 
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 pt-16">
        <main className="p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

// Predefined sidebar items
export const superadminSidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/superadmin/dashboard', icon: LayoutDashboard },
  { name: 'Restaurants', href: '/superadmin/restaurants', icon: Store },
  { name: 'Verifications', href: '/superadmin/verification', icon: CheckCircle },
  { name: 'Commissions', href: '/superadmin/commissions', icon: DollarSign },
  { name: 'Support Tickets', href: '/superadmin/support-tickets', icon: HeadphonesIcon },
  { name: 'Settings', href: '/superadmin/settings', icon: Settings },
];

export const restaurantSidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/restaurant/dashboard', icon: LayoutDashboard },
  { name: 'Order Management', href: '/restaurant/orders', icon: ShoppingCart },
  { name: 'Table Management', href: '/restaurant/tables', icon: Utensils },
  { name: 'Staff Management', href: '/restaurant/staff', icon: Users },
  { name: 'Menu Management', href: '/restaurant/menu', icon: Utensils },
  { name: 'Tips & Reviews', href: '/restaurant/reviews', icon: Star },
  { name: 'Payment Overview', href: '/restaurant/payments', icon: CreditCard },
  { name: 'Settings', href: '/restaurant/settings', icon: Settings },
  { name: 'Subscription Plan', href: '/restaurant/subscription', icon: Crown },
]; 