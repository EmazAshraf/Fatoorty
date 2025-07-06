import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export default function StatCard({ title, value, icon: Icon, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        {trend && (
          <div className="mt-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-sm text-gray-500 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
} 