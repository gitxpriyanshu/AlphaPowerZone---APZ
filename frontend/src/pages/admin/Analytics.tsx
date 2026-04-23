import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, PieChart as PieChartIcon, 
  ArrowUpRight, Users, ShoppingBag, Package 
} from 'lucide-react';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import adminAxios from '@config/adminAxios';
import { cn } from '@utils/cn';
import Badge from '@components/ui/Badge';

const Analytics: React.FC = () => {
  const [range, setRange] = useState('30d');

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics', range],
    queryFn: async () => {
      const { data } = await adminAxios.get(`/analytics/revenue?period=${range}`);
      return data.data;
    },
  });

  const COLORS = ['#C8A96E', '#09090B', '#A1A1AA', '#E4E4E7'];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-display italic uppercase tracking-tighter">Analytics</h1>
          <p className="text-sm text-brand-text-muted mt-1">Deep dive into your store's performance metrics</p>
        </div>
        <div className="flex bg-white p-1 rounded-brand-md border border-brand-border">
          {['7d', '30d', '90d', '1y'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-6 py-2 rounded-brand-md text-[10px] font-black uppercase tracking-widest transition-all",
                range === r ? "bg-brand-text-primary text-white" : "text-brand-text-muted hover:text-brand-text-primary"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Revenue vs Orders Chart */}
      <div className="bg-white p-10 rounded-brand-xl border border-brand-border shadow-brand-sm">
        <h3 className="text-xl font-black font-display italic uppercase tracking-tighter mb-8">Revenue vs Orders</h3>
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={analytics || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 900, fill: '#9CA3AF' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fontWeight: 900, fill: '#9CA3AF' }} axisLine={false} tickLine={false} dx={-10} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fontWeight: 900, fill: '#9CA3AF' }} axisLine={false} tickLine={false} dx={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090B', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar yAxisId="left" dataKey="revenue" fill="#C8A96E" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#09090B" strokeWidth={3} dot={{ r: 4, fill: '#09090B' }} name="Orders Count" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Insights */}
        <div className="bg-white p-10 rounded-brand-xl border border-brand-border shadow-brand-sm">
          <h3 className="text-xl font-black font-display italic uppercase tracking-tighter mb-8">Customer Segment</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'New Customers', value: 65 },
                    { name: 'Repeat Customers', value: 35 },
                  ]}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Product Categories */}
        <div className="bg-white p-10 rounded-brand-xl border border-brand-border shadow-brand-sm">
          <h3 className="text-xl font-black font-display italic uppercase tracking-tighter mb-8">Top Categories</h3>
          <div className="space-y-6">
            {[
              { name: 'Strength Training', revenue: '₹4.2L', share: 45 },
              { name: 'Performance Apparel', revenue: '₹2.8L', share: 30 },
              { name: 'Premium Supplements', revenue: '₹1.5L', share: 15 },
              { name: 'Cardio Gear', revenue: '₹0.9L', share: 10 },
            ].map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                  <span>{cat.name}</span>
                  <span className="text-brand-accent">{cat.revenue}</span>
                </div>
                <div className="h-2 bg-brand-surface-alt rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.share}%` }}
                    className="h-full bg-brand-text-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
