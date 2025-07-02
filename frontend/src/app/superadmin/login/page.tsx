'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { Input, Button } from '@/components/ui';
import Header from '@/components/layout/Header';
import { apiService } from '@/lib/api';
import { Mail, Lock, Shield } from 'lucide-react';

export default function SuperadminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.loginSuperadmin(email, password);
      
      // Store the token directly from response
      localStorage.setItem('token', response.token);
      localStorage.setItem('userType', 'superadmin');
      router.push('/superadmin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Admin Portal" />
      <div className="flex-grow">
        <AuthCard 
          title="Admin Access" 
          subtitle="Secure login for system administrators"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <Input
              label="Admin Email"
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={20} />}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={20} />}
              required
            />

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Access Dashboard
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Authorized personnel only. All access is monitored.
              </p>
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
} 