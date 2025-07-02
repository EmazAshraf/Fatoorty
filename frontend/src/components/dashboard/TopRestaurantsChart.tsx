'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui';
import { Calendar } from 'lucide-react';

const data = [
  { name: 'Pizza Palace', value: 450 },
  { name: 'Burger Barn', value: 380 },
  { name: 'Sushi Spot', value: 320 },
  { name: 'Taco Time', value: 280 },
  { name: 'Pasta Place', value: 240 },
];

export default function TopRestaurantsChart() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Restaurants</h3>
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
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Bar
              dataKey="value"
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 