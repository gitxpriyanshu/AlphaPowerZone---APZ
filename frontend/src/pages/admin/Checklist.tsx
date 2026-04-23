import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Shield, Globe, Database, CreditCard, Mail, Activity } from 'lucide-react';
import { cn } from '@utils/cn';

const Checklist: React.FC = () => {
  const items = [
    { label: 'SSL/HTTPS Active', status: 'ready', icon: <Shield className="text-brand-success" size={20} /> },
    { label: 'Environment Variables Configured', status: 'ready', icon: <Globe className="text-brand-success" size={20} /> },
    { label: 'Database Migrations Synced', status: 'ready', icon: <Database className="text-brand-success" size={20} /> },
    { label: 'Razorpay Live Mode', status: 'pending', icon: <CreditCard className="text-brand-warning" size={20} /> },
    { label: 'Email Notifications (Nodemailer)', status: 'ready', icon: <Mail className="text-brand-success" size={20} /> },
    { label: 'AI Service Proxy Connectivity', status: 'ready', icon: <Activity className="text-brand-success" size={20} /> },
  ];

  return (
    <div className="bg-white p-10 rounded-brand-xl border border-brand-border shadow-brand-sm">
      <h3 className="text-2xl font-black font-display italic uppercase tracking-tighter mb-8">Production Readiness</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-brand-surface-alt rounded-brand-md border border-brand-border">
            <div className="flex items-center gap-4">
              {item.icon}
              <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
            </div>
            {item.status === 'ready' ? (
              <CheckCircle2 size={20} className="text-brand-success" />
            ) : (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-warning">
                <AlertCircle size={16} /> Action Required
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Checklist;
