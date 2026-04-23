import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FiInstagram, FiTwitter, FiYoutube, FiFacebook } from 'react-icons/fi';
import { cn } from '@utils/cn';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Shop Elite',
      links: [
        { label: 'Strength Equipment', path: '/shop/strength' },
        { label: 'Athletic Apparel', path: '/shop/apparel' },
        { label: 'Elite Supplements', path: '/shop/supplements' },
        { label: 'Cardio Training', path: '/shop/cardio' },
        { label: 'New Arrivals', path: '/shop?filter=new' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'Our Story', path: '/about' },
        { label: 'The Science', path: '/science' },
        { label: 'APZ Blog', path: '/blog' },
        { label: 'Store Locator', path: '/stores' },
        { label: 'Contact Us', path: '/contact' },
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Track Order', path: '/track-order' },
        { label: 'Returns & Exchanges', path: '/returns' },
        { label: 'Shipping Info', path: '/shipping' },
        { label: 'Help Center', path: '/faq' },
        { label: 'Privacy Policy', path: '/privacy' },
      ]
    }
  ];

  return (
    <footer className="bg-white border-t border-brand-border pt-20 pb-10 px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 xl:gap-24 mb-16">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-6 mb-6 group">
              <img src="/images/apz_logo.png" alt="APZ Wolf" className="w-20 h-auto object-contain transform group-hover:scale-110 transition-transform duration-500" />
              <div className="text-4xl xl:text-5xl font-black font-display italic uppercase tracking-tighter leading-[0.85]">
                <span className="block text-brand-text-primary">Alpha</span>
                <span className="block text-brand-accent">Power</span>
                <span className="block text-brand-text-primary">Zone</span>
              </div>
            </Link>
            <p className="text-sm text-brand-text-secondary leading-relaxed max-w-sm">
              Engineered for those who demand more. APZ is the pinnacle of performance gear, supplements, and AI-driven training intelligence.
            </p>
            <div className="flex gap-4">
              {[FiInstagram, FiTwitter, FiYoutube, FiFacebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-brand-surface-alt flex items-center justify-center text-brand-text-primary hover:bg-brand-accent hover:text-white transition-all transform hover:-translate-y-1">
                  <Icon size={18} />
                </a>
              ))}
            </div>
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-xs text-brand-text-muted font-bold uppercase tracking-widest">
                <Mail size={14} className="text-brand-accent" /> support@alphapowerzone.com
              </div>
              <div className="flex items-center gap-3 text-xs text-brand-text-muted font-bold uppercase tracking-widest">
                <Phone size={14} className="text-brand-accent" /> +91 (800) 555-0123
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            {footerSections.map((section, i) => (
              <div key={i} className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand-text-primary">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link to={link.path} className="text-sm text-brand-text-secondary hover:text-brand-accent transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-brand-border flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
            © {currentYear} ALPHAPOWERZONE. ALL RIGHTS RESERVED. <span className="mx-2">|</span> DESIGNED FOR ELITE ATHLETES.
          </p>
          <div className="flex items-center gap-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
            {['Visa', 'Mastercard', 'Razorpay', 'UPI', 'COD'].map((method) => (
              <span key={method} className="text-[10px] font-black uppercase tracking-widest border border-brand-text-primary px-2 py-1 rounded">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
