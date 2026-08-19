import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full border-cyber-700/60 border-t-shield-cyan animate-spin`}
        />
        <div className="absolute inset-0 rounded-full blur-sm bg-shield-cyan/20 animate-pulse" />
      </div>
      {label && <p className="text-xs text-cyber-400 font-mono animate-pulse">{label}</p>}
    </div>
  );
};
