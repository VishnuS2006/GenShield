import React from 'react';
import { SensitivityLevel } from '../../types/detection';
import { SENSITIVITY_CONFIG } from '../../utils/constants';

interface SensitivityBadgeProps {
  sensitivity: SensitivityLevel | string | undefined | null;
  className?: string;
}

export const SensitivityBadge: React.FC<SensitivityBadgeProps> = ({
  sensitivity,
  className = '',
}) => {
  if (!sensitivity) return <span className="text-cyber-500 font-mono text-xs">—</span>;

  const norm = (sensitivity?.toUpperCase() || 'LOW') as SensitivityLevel;
  const config = SENSITIVITY_CONFIG[norm] || SENSITIVITY_CONFIG.LOW;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold border uppercase ${config.badgeBg} ${config.badgeText} ${config.badgeBorder} ${className}`}
    >
      {config.label}
    </span>
  );
};
