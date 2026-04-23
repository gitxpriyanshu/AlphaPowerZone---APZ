import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Scale, Target, TrendingUp, Calendar, 
  Plus, Edit3, Info, ChevronRight, Zap, 
  Dumbbell, Utensils, Activity, ArrowRight, Check
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@config/axiosInstance';
import { cn } from '@utils/cn';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Badge from '@components/ui/Badge';
import toast from 'react-hot-toast';

const ProgressTracker: React.FC = () => {
  const queryClient = useQueryClient();
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [period, setPeriod] = useState('30d');

  // Fetch Progress Data
  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['tracker-logs', period],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/tracker/logs?period=${period}`);
      return data.data;
    },
  });

  const { data: insights } = useQuery({
    queryKey: ['tracker-insights'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/tracker/insights');
      return data.data;
    },
  });

  // Log Stats Mutation
  const logMutation = useMutation({
    mutationFn: async (stats: any) => {
      const { data } = await axiosInstance.post('/tracker/log', stats);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker-logs'] });
      queryClient.invalidateQueries({ queryKey: ['tracker-insights'] });
      setLogModalOpen(false);
      toast.success('Stats logged successfully');
    },
  });

  const currentWeight = logs?.[logs.length - 1]?.weight || 0;
  const startingWeight = logs?.[0]?.weight || 0;
  const weightChange = currentWeight - startingWeight;

  return (
    <div className="min-h-screen bg-brand-background pt-28 pb-24 px-6 md:px-12 lg:px-24">
      <Helmet>
        <title>Progress Tracker | AlphaPowerZone</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="primary" className="mb-4">Live Performance Tracking</Badge>
            <h1 className="text-5xl md:text-7xl font-black font-display italic uppercase tracking-tighter leading-none">
              Progress <span className="text-brand-accent">Engine</span>
            </h1>
          </motion.div>
          <div className="flex gap-4">
            <Button size="lg" onClick={() => setLogModalOpen(true)}>
              <Plus className="mr-2" size={20} /> Log Today
            </Button>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'CURRENT WEIGHT', val: `${currentWeight} KG`, sub: 'Updated Today', icon: <Scale size={24} /> },
            { label: 'TOTAL CHANGE', val: `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} KG`, sub: 'Since start', icon: <TrendingUp size={24} />, color: weightChange <= 0 ? 'text-brand-success' : 'text-brand-error' },
            { label: 'LOGGING STREAK', val: insights?.logStreak || 0, sub: 'Days in a row', icon: <Zap size={24} /> },
            { label: 'DAYS ACTIVE', val: '47', sub: 'Elite Member', icon: <Calendar size={24} /> },
          ].map((card, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="premium-card p-8 border-t-4 border-brand-accent flex items-center gap-6"
            >
              <div className="w-14 h-14 rounded-brand-md bg-brand-surface-alt flex items-center justify-center text-brand-accent">
                {card.icon}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted mb-1">{card.label}</p>
                <p className={cn("text-3xl font-black font-mono", card.color || "text-brand-text-primary")}>{card.val}</p>
                <p className="text-[10px] font-bold text-brand-text-secondary uppercase">{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Chart */}
          <div className="lg:col-span-8 premium-card p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black font-display italic uppercase tracking-tighter">Weight Progression</h3>
              <div className="flex bg-brand-surface-alt p-1 rounded-full border border-brand-border">
                {['30d', '90d', 'all'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                      period === p ? "bg-brand-text-primary text-white" : "text-brand-text-muted hover:text-brand-text-primary"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logs}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8A96E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C8A96E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                  <XAxis 
                    dataKey="loggedAt" 
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#A1A1AA' }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 10, fontWeight: 900, fontFamily: 'monospace', fill: '#A1A1AA' }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090B', border: 'none', borderRadius: '8px', padding: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 900 }}
                    labelStyle={{ color: '#C8A96E', fontSize: '10px', marginBottom: '4px' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#C8A96E" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="premium-card p-8 space-y-6">
              <h3 className="text-xl font-black font-display italic uppercase tracking-tighter flex items-center gap-3">
                <Zap className="text-brand-accent" /> Elite Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-brand-surface-alt rounded-brand-lg border-l-4 border-brand-success">
                  <p className="text-xs font-bold leading-relaxed">
                    "You've maintained a 7-day logging streak! Consistency is the foundation of elite performance."
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Goal Progress</p>
                    <p className="text-sm font-black font-mono">68%</p>
                  </div>
                  <div className="h-2 bg-brand-border rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '68%' }}
                      className="h-full bg-brand-accent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-card p-8 space-y-6">
              <h3 className="text-xl font-black font-display italic uppercase tracking-tighter flex items-center gap-3">
                <Dumbbell className="text-brand-accent" /> Training Today
              </h3>
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                Your AI plan suggests <span className="font-bold text-brand-text-primary">Chest & Triceps</span> today. 6 Elite exercises waiting.
              </p>
              <Button fullWidth size="sm" variant="outline">View Workout Plan</Button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Supplements & Meals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Supplement Tracker */}
          <div className="premium-card p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black font-display italic uppercase tracking-tighter flex items-center gap-3">
                <Zap className="text-brand-accent fill-brand-accent" /> Active Supplements
              </h3>
              <Badge variant="primary">{insights?.suppStreak || 0} DAY STREAK</Badge>
            </div>
            <div className="space-y-4">
              {['Elite Whey Isolate', 'Creatine Monohydrate'].map((supp, i) => (
                <div key={i} className="p-6 bg-brand-surface-alt rounded-brand-xl flex items-center justify-between group hover:border-brand-accent border-2 border-transparent transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                      <Check size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm uppercase">{supp}</h4>
                      <p className="text-[10px] text-brand-text-muted font-mono uppercase">1 Scoop / Daily</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">Log Intake</Button>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Meal Summary */}
          <div className="premium-card p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black font-display italic uppercase tracking-tighter flex items-center gap-3">
                <Utensils className="text-brand-accent" /> Meal Logging
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Target: 2,450 KCAL</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal, i) => (
                <div key={i} className="p-4 rounded-brand-lg border-2 border-brand-border flex items-center justify-between hover:border-brand-text-primary transition-all cursor-pointer">
                  <span className="text-xs font-black uppercase tracking-widest">{meal}</span>
                  <Plus size={16} className="text-brand-text-muted" />
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-brand-border">
              <div className="flex justify-between items-end mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Consumed Today</p>
                <p className="text-sm font-black font-mono">1,820 / 2,450 KCAL</p>
              </div>
              <div className="h-2 bg-brand-border rounded-full overflow-hidden">
                <div className="h-full bg-brand-success w-[74%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Stats Modal */}
      <AnimatePresence>
        {logModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLogModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-lg h-fit bg-white z-[2001] rounded-brand-2xl p-10 shadow-2xl"
            >
              <h3 className="text-3xl font-black font-display italic uppercase tracking-tighter mb-8">Log Today's Stats</h3>
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                logMutation.mutate({
                  weight: Number(formData.get('weight')),
                  bodyFat: formData.get('bodyFat') ? Number(formData.get('bodyFat')) : null,
                  notes: formData.get('notes')
                });
              }}>
                <Input name="weight" label="Weight (KG)" type="number" step="0.1" required placeholder="e.g. 75.5" />
                <Input name="bodyFat" label="Body Fat % (Optional)" type="number" step="0.1" placeholder="e.g. 15.2" />
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Daily Notes</label>
                  <textarea 
                    name="notes"
                    className="w-full bg-brand-surface-alt border-2 border-brand-border rounded-brand-md p-4 text-sm focus:border-brand-accent transition-all outline-none h-32 resize-none"
                    placeholder="How was your energy? Any specific PRs?"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" fullWidth onClick={() => setLogModalOpen(false)}>Cancel</Button>
                  <Button fullWidth type="submit" isLoading={logMutation.isPending}>Submit Entry</Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressTracker;
