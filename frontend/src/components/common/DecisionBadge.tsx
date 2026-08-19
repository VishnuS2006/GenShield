import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Decision } from '../../types/detection';
import { DECISION_CONFIG } from '../../utils/constants';

interface DecisionBadgeProps {
  decision: Decision | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({
  decision,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const normDecision = (decision?.toUpperCase() || 'ALLOW') as Decision;
  const config = DECISION_CONFIG[normDecision] || DECISION_CONFIG.ALLOW;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-xs sm:text-sm gap-1.5 font-semibold',
    lg: 'px-4 py-2 text-sm sm:text-base gap-2 font-bold tracking-wider',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const IconComponent =
    normDecision === 'BLOCK'
      ? ShieldAlert
      : normDecision === 'WARN'
      ? AlertTriangle
      : ShieldCheck;

  return (
    <span
      className={`inline-flex items-center rounded-full border uppercase font-mono transition-all ${config.badgeBg} ${config.badgeText} ${config.badgeBorder} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <IconComponent className={`${iconSizes[size]} flex-shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
};
