'use client';

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Button, Select } from '@/components/ui';
import { Calendar } from 'lucide-react';

const data = [
  { name: '1 May', value: 250 },
  { name: '2 May', value: 280 },
  { name: '3 May', value: 200 },
  { name: '4 May', value: 350 },
  { name: '5 May', value: 280 },
  { name: '6 May', value: 500 },
  { name: '7 May', value: 480 },
];

interface EarningsChartProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const periodOptions = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'all', label: 'All Restaurants' }
];

export default function EarningsChart({ selectedPeriod, onPeriodChange }: EarningsChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Earnings</h3>
        <div className="flex items-center space-x-3">
          <Select
            value={selectedPeriod}
            onChange={(value: string | number) => onPeriodChange(value as string)}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' }
            ]}
            className="min-w-[150px]"
          />
          <div className="flex space-x-2">
            <Button variant="primary" size="sm">
              Last 7 Days
            </Button>
            <Button variant="outline" size="sm">
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
              Select Date Range
            </Button>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              domain={[0, 600]}
              tickFormatter={(value) => `$${value}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              strokeWidth={3}
              fill="url(#colorEarnings)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  );
} 