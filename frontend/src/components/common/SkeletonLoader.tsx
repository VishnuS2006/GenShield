import React from 'react';

export const SkeletonCard: React.FC<{ height?: string; className?: string }> = ({
  height = 'h-32',
  className = '',
}) => (
  <div
    className={`bg-cyber-900/60 border border-cyber-800/60 rounded-xl p-5 animate-pulse ${height} ${className}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-cyber-800 rounded w-1/3" />
      <div className="h-6 w-6 bg-cyber-800 rounded-full" />
    </div>
    <div className="h-8 bg-cyber-800/80 rounded w-1/2 mb-2" />
    <div className="h-3 bg-cyber-800/40 rounded w-2/3" />
  </div>
);

export const SkeletonRow: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <div className="flex items-center space-x-4 py-4 px-6 border-b border-cyber-800/60 animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-cyber-800 rounded ${i === 0 ? 'w-1/4' : i === 1 ? 'w-1/6' : 'flex-1'}`}
      />
    ))}
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => (
  <div className="cyber-card overflow-hidden">
    <div className="bg-cyber-850/80 p-4 border-b border-cyber-800 flex space-x-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-4 bg-cyber-800 rounded flex-1" />
      ))}
    </div>
    <div className="divide-y divide-cyber-800/50">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </div>
  </div>
);
