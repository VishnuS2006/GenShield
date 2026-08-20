import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { user, logout } = useAuth();

  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chat', label: 'AI Security Chatbot', icon: MessageSquare },
    { to: '/analysis', label: 'Security Analysis', icon: ShieldCheck },
    { to: '/profile', label: 'Profile', icon: UserCheck },
    { to: '/settings', label: 'Settings', icon: Settings },
  ].filter((item) => (user?.role === 'SECURITY_ANALYST' || user?.role === 'ADMINISTRATOR' ? true : item.to !== '/analysis'));

  return (
    <aside className="w-64 bg-cyber-900 border-r border-cyber-800 flex flex-col h-screen fixed top-0 left-0 z-30 select-none">
      <div className="h-16 px-5 flex items-center gap-3 border-b border-cyber-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-shield-cyan/20 to-shield-indigo/20 border border-shield-cyan/40 flex items-center justify-center text-shield-cyan shadow-glow-cyan">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-base tracking-wider text-white">GEN</span>
            <span className="font-extrabold text-base tracking-wider text-shield-cyan">SHIELD</span>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyber-400">
            Enterprise AI Security
          </p>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-cyber-500">
          Workspace
        </div>

        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-shield-cyan/10 border border-shield-cyan/30 text-shield-cyan font-semibold'
                  : 'text-cyber-300 hover:text-white hover:bg-cyber-850 border border-transparent'
              }`
            }
          >
            <item.icon className="w-4 h-4 transition-transform group-hover:scale-105" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-3.5 border-t border-cyber-800 bg-cyber-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-cyber-850 border border-cyber-750">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-shield-cyan/15 border border-shield-cyan/30 text-shield-cyan flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-cyber-100 truncate">{user?.full_name || 'Enterprise User'}</p>
              <p className="text-[10px] text-cyber-400 truncate">{user?.email || 'user@company.internal'}</p>
              <p className="text-[10px] text-cyber-500 font-mono truncate">{user?.role?.replace('_', ' ') || 'EMPLOYEE'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-cyber-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
