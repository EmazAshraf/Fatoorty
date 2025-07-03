'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard, Building2, Globe, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen px-6 py-12 sm:px-12 lg:px-20 bg-gray-50 text-gray-800 grid grid-rows-[auto_1fr_auto] font-[family-name:var(--font-geist-sans)]">
      
      <main className="flex flex-col gap-12 items-center text-center max-w-4xl mx-auto w-full">
        
        {/* Branding Section */}
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-[#6D72CF] mb-4">Fatoorty</h1>
          <p className="text-xl text-gray-600">Your complete Restaurant Management System</p>
        </div>

        {/* Login Options */}
        <section className="w-full max-w-md space-y-6">
          <h2 className="text-lg font-semibold text-gray-700">Login as</h2>
          <div className="space-y-4">
            <Link
              href="/superadmin/login"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#6D72CF] text-white rounded-lg shadow hover:bg-[#5a5fb8] transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              Superadmin Login
            </Link>
            <Link
              href="/restaurant/login"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors"
            >
              <Building2 className="w-5 h-5" />
              Restaurant Owner Login
            </Link>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="p-6 bg-white rounded-2xl shadow border">
            <h3 className="text-lg font-semibold text-[#6D72CF] mb-3">Superadmin Features</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Manage restaurant owners</li>
              <li>View system analytics</li>
              <li>Handle verifications</li>
              <li>Support ticket management</li>
            </ul>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow border">
            <h3 className="text-lg font-semibold text-green-700 mb-3">Restaurant Owner Features</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Manage restaurants</li>
              <li>Create QR codes for tables</li>
              <li>Manage menus and staff</li>
              <li>View orders and analytics</li>
            </ul>
          </div>
        </section>

        {/* Server Notice */}
        <p className="text-sm text-gray-500 text-center">
          Make sure your backend server is running on{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">http://localhost:5000</code>
        </p>
      </main>
     
    </div>
  );
}
