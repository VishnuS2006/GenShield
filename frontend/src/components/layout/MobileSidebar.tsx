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
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chat', label: 'AI Security Chatbot', icon: MessageSquare },
    { to: '/analysis', label: 'Security Analysis', icon: ShieldCheck },
    { to: '/profile', label: 'Profile', icon: UserCheck },
    { to: '/settings', label: 'Settings', icon: Settings },
  ].filter((item) => (user?.role === 'SECURITY_ANALYST' || user?.role === 'ADMINISTRATOR' ? true : item.to !== '/analysis'));

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-cyber-950/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 left-0 w-72 bg-cyber-900 border-r border-cyber-800 flex flex-col z-10">
        <div className="h-16 px-5 flex items-center justify-between border-b border-cyber-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-shield-cyan/20 border border-shield-cyan/40 flex items-center justify-center text-shield-cyan">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 font-bold tracking-wider text-base text-white">
              <span>GEN</span>
              <span className="text-shield-cyan">SHIELD</span>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-cyber-400 hover:text-white hover:bg-cyber-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-cyber-400">
            Workspace
          </div>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-shield-cyan/15 border border-shield-cyan/30 text-shield-cyan font-semibold'
                    : 'text-cyber-300 hover:text-white hover:bg-cyber-800/60'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-cyber-800 bg-cyber-950/40">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyber-850 border border-cyber-800">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-medium text-white truncate">{user?.full_name || 'Enterprise User'}</p>
              <p className="text-[11px] text-cyber-400 truncate">{user?.email || 'user@company.internal'}</p>
              <p className="text-[11px] text-cyber-500 font-mono truncate">{user?.role?.replace('_', ' ') || 'EMPLOYEE'}</p>
            </div>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
