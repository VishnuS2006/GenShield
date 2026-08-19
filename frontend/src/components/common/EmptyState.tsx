import React from 'react';
import { LucideIcon, ShieldCheck } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = ShieldCheck,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`cyber-card flex flex-col items-center justify-center text-center p-8 sm:p-12 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-cyber-800/80 border border-cyber-700/60 flex items-center justify-center text-shield-cyan mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-cyber-100 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-cyber-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-shield-cyan hover:bg-shield-cyanDark text-cyber-950 font-semibold shadow-glow-cyan transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
