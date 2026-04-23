import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, ShoppingBag, 
  Package, Users, IndianRupee, AlertTriangle, ArrowRight
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import adminAxios from '@config/adminAxios';
import { cn } from '@utils/cn';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Checklist from './Checklist';

const Dashboard: React.FC = () => {
  const [period, setPeriod] = useState('7d');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-overview', period],
    queryFn: async () => {
      const { data } = await adminAxios.get(`/analytics/overview?period=${period}`);
      return data.data;
    },
  });

  const { data: topProducts } = useQuery({
    queryKey: ['admin-top-products'],
    queryFn: async () => {
      const { data } = await adminAxios.get('/analytics/top-products');
      return data.data;
    },
  });

  const COLORS = ['#C8A96E', '#09090B', '#A1A1AA', '#E4E4E7'];

  return (
    <div className="space-y-10">
      <Checklist />
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Today's Revenue", val: `₹${analytics?.totalRevenue || 0}`, trend: '+12.5%', isUp: true, icon: <IndianRupee size={20} /> },
          { label: "Today's Orders", val: analytics?.totalOrders || 0, trend: '+4.2%', isUp: true, icon: <ShoppingBag size={20} /> },
          { label: "Total Products", val: analytics?.totalProducts || 0, trend: '4 low stock', isUp: false, icon: <Package size={20} />, warning: true },
          { label: "Total Customers", val: analytics?.totalUsers || 0, trend: '+18 new', isUp: true, icon: <Users size={20} /> },
        ].map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-brand-xl border border-brand-border shadow-brand-sm flex items-start justify-between"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted mb-2">{card.label}</p>
              <h3 className="text-2xl font-black font-display italic tracking-tighter">{card.val}</h3>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-bold mt-2",
                card.warning ? "text-brand-error" : card.isUp ? "text-brand-success" : "text-brand-text-muted"
              )}>
                {card.isUp ? <TrendingUp size={12} /> : card.warning ? <AlertTriangle size={12} /> : <TrendingDown size={12} />}
                {card.trend} vs yesterday
              </div>
            </div>
            <div className="w-10 h-10 rounded-brand-md bg-brand-surface-alt flex items-center justify-center text-brand-text-primary">
              {card.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-brand-xl border border-brand-border shadow-brand-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black font-display italic uppercase tracking-tighter">Revenue Overview</h3>
            <div className="flex bg-brand-surface-alt p-1 rounded-full">
              {['7d', '30d', '90d'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    period === p ? "bg-brand-text-primary text-white" : "text-brand-text-muted hover:text-brand-text-primary"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.revenueData || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8A96E" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#C8A96E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090B', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#C8A96E' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C8A96E" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-8 rounded-brand-xl border border-brand-border shadow-brand-sm">
          <h3 className="text-lg font-black font-display italic uppercase tracking-tighter mb-8">Order Status</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.orderStatusData || []}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {analytics?.orderStatusData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {analytics?.orderStatusData?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-brand-text-muted">{item.status}</span>
                </div>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-8 rounded-brand-xl border border-brand-border shadow-brand-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black font-display italic uppercase tracking-tighter">Recent Orders</h3>
            <Link to="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-brand-accent flex items-center gap-1 hover:underline">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-brand-border">
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Order ID</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Customer</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Status</th>
                  <th className="pb-4 text-right text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {analytics?.recentOrders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-brand-surface-alt transition-colors">
                    <td className="py-4 text-xs font-bold font-mono">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="py-4 text-xs font-bold">{order.user.name}</td>
                    <td className="py-4">
                      <Badge variant={order.status === 'DELIVERED' ? 'success' : 'primary'} className="text-[8px]">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-right text-xs font-black font-mono">₹{order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-8 rounded-brand-xl border border-brand-border shadow-brand-sm">
          <h3 className="text-lg font-black font-display italic uppercase tracking-tighter mb-8">Top Products</h3>
          <div className="space-y-6">
            {topProducts?.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-4 group">
                <img src={p.images[0]} className="w-12 h-12 rounded-brand-md object-cover flex-shrink-0" />
                <div className="flex-grow">
                  <p className="text-xs font-black uppercase tracking-tight line-clamp-1">{p.name}</p>
                  <p className="text-[10px] font-mono text-brand-text-muted">{p.unitsSold} units sold</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black font-mono">₹{p.revenue}</p>
                  <p className="text-[8px] font-bold text-brand-success uppercase">Performance Top</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
