import React, { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, 
  Layers, BarChart3, Settings, LogOut, Menu, X, Bell
} from 'lucide-react';
import { useOwnerStore } from '@store/ownerStore';
import { cn } from '@utils/cn';

const AdminLayout: React.FC = () => {
  const { owner, logout } = useOwnerStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { label: 'Orders', icon: <ShoppingCart size={20} />, path: '/admin/orders' },
    { label: 'Products', icon: <Package size={20} />, path: '/admin/products' },
    { label: 'Categories', icon: <Layers size={20} />, path: '/admin/categories' },
    { label: 'Analytics', icon: <BarChart3 size={20} />, path: '/admin/analytics' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-brand-border transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <Link to="/admin" className={cn("font-black font-display tracking-tighter uppercase italic flex items-center gap-2 transition-all", !isSidebarOpen && "scale-0 w-0")}>
            <span className="text-xl">APZ</span>
            <span className="text-[10px] bg-brand-accent text-white px-2 py-0.5 rounded">Admin</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-brand-surface-alt rounded-brand-md">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-4 py-3 rounded-brand-md transition-all group",
                isActive 
                  ? "bg-brand-accent text-white shadow-brand-md" 
                  : "text-brand-text-secondary hover:bg-brand-surface-alt"
              )}
            >
              <div className={cn("transition-transform group-hover:scale-110", !isSidebarOpen && "mx-auto")}>
                {item.icon}
              </div>
              <span className={cn("text-sm font-bold uppercase tracking-widest transition-all", !isSidebarOpen && "scale-0 w-0")}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-border">
          <div className={cn("flex items-center gap-4 p-4 rounded-brand-md bg-brand-surface-alt mb-4 transition-all", !isSidebarOpen && "p-2")}>
            <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center text-white font-black flex-shrink-0">
              {owner?.name?.[0].toUpperCase()}
            </div>
            <div className={cn("transition-all", !isSidebarOpen && "scale-0 w-0 overflow-hidden")}>
              <p className="text-xs font-black uppercase truncate">{owner?.name}</p>
              <p className="text-[10px] text-brand-text-muted uppercase">Store Owner</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 text-brand-error hover:bg-brand-error/5 rounded-brand-md transition-all font-bold uppercase tracking-widest text-xs",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={18} />
            <span className={cn(!isSidebarOpen && "hidden")}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-grow transition-all duration-300",
        isSidebarOpen ? "ml-64" : "ml-20"
      )}>
        <header className="h-20 bg-white border-b border-brand-border px-8 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-xl font-black font-display italic uppercase tracking-tighter">System Console</h2>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-brand-text-muted hover:text-brand-text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-error rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-[1px] bg-brand-border" />
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Current Date</p>
              <p className="text-xs font-bold font-mono">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </header>

        <div className="p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
