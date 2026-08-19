import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'emerald' | 'amber' | 'crimson' | 'indigo';
  change?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'cyan',
  change,
  className = '',
}) => {
  const variantStyles = {
    cyan: {
      border: 'border-cyber-800 hover:border-shield-cyan/50',
      iconBg: 'bg-shield-cyan/10 border-shield-cyan/30 text-shield-cyan',
      glow: 'shadow-card',
      textAccent: 'text-shield-cyan',
    },
    emerald: {
      border: 'border-cyber-800 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400',
      glow: 'shadow-card hover:shadow-glow-emerald',
      textAccent: 'text-emerald-400',
    },
    amber: {
      border: 'border-cyber-800 hover:border-amber-500/50',
      iconBg: 'bg-amber-950/60 border-amber-500/40 text-amber-400',
      glow: 'shadow-card hover:shadow-glow-amber',
      textAccent: 'text-amber-400',
    },
    crimson: {
      border: 'border-cyber-800 hover:border-rose-500/50',
      iconBg: 'bg-rose-950/60 border-rose-500/40 text-rose-400',
      glow: 'shadow-card hover:shadow-glow-crimson',
      textAccent: 'text-rose-400',
    },
    indigo: {
      border: 'border-cyber-800 hover:border-indigo-500/50',
      iconBg: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-400',
      glow: 'shadow-card',
      textAccent: 'text-indigo-400',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`cyber-card p-5 bg-cyber-900/90 border rounded-xl transition-all duration-300 ${style.border} ${style.glow} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyber-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${style.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {change && (
          <span className="text-xs font-mono text-cyber-400">
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-cyber-400 leading-normal truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
