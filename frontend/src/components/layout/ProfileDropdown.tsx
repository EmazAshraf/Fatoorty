'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileDropdownProps {
  userRole: 'superadmin' | 'restaurant';
}

export default function ProfileDropdown({ userRole }: ProfileDropdownProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    router.push(`/${userRole}/login`);
  };

  const handleSettings = () => {
    router.push(`/${userRole}/settings`);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">A</span>
          </div>
          <ChevronDown className="w-4 h-4 text-white/80" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSettings}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                >
                  <Settings className="mr-3 h-5 w-5" aria-hidden="true" />
                  Settings
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? 'bg-red-50 text-red-900' : 'text-red-700'
                  } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                >
                  <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
                  Logout
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 