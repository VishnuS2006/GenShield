import React from 'react';

interface RiskScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({
  score,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
  label = 'RISK SCORE',
  className = '',
}) => {
  const normalizedScore = Math.max(0, Math.min(100, score || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let colorClass = '#10b981'; // green
  let textClass = 'text-emerald-400';
  let glowColor = 'rgba(16, 185, 129, 0.4)';

  if (normalizedScore >= 90) {
    colorClass = '#ef4444'; // red
    textClass = 'text-rose-400';
    glowColor = 'rgba(239, 68, 68, 0.4)';
  } else if (normalizedScore >= 60) {
    colorClass = '#f59e0b'; // amber
    textClass = 'text-amber-400';
    glowColor = 'rgba(245, 158, 11, 0.4)';
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#172033"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorClass}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s ease-in-out',
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${textClass}`}>
            {normalizedScore}
          </span>
          <span className="text-[10px] uppercase font-mono text-cyber-400 -mt-0.5">/ 100</span>
        </div>
      </div>

      {showLabel && (
        <span className="mt-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyber-300">
          {label}
        </span>
      )}
    </div>
  );
};
