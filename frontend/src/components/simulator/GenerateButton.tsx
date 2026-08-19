import React from 'react';
import { Play, Sparkles } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  onClick,
  isLoading,
  disabled = false,
  label = 'Generate & Analyze',
  loadingLabel = 'Analyzing Security...',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="relative group overflow-hidden px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-shield-cyan to-shield-emerald text-cyber-950 shadow-glow-cyan hover:shadow-glow-emerald disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-cyber-950 border-t-transparent rounded-full animate-spin" />
          <span className="font-bold">{loadingLabel}</span>
        </>
      ) : (
        <>
          <Play className="w-4 h-4 fill-cyber-950 group-hover:scale-110 transition-transform" />
          <span className="font-bold">{label}</span>
          <Sparkles className="w-3.5 h-3.5 opacity-70" />
        </>
      )}
    </button>
  );
};
