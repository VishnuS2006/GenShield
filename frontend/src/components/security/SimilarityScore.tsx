import React from 'react';
import { Cpu } from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';

interface SimilarityScoreProps {
  score: number;
  warnThreshold?: number;
  blockThreshold?: number;
}

export const SimilarityScore: React.FC<SimilarityScoreProps> = ({
  score,
  warnThreshold = 0.6,
  blockThreshold = 0.85,
}) => {
  const percentage = Math.min(100, Math.max(0, score * 100));
  const isBlock = score >= blockThreshold;
  const isWarn = score >= warnThreshold && !isBlock;

  const barColor = isBlock
    ? 'bg-rose-500 shadow-glow-crimson'
    : isWarn
    ? 'bg-amber-500 shadow-glow-amber'
    : 'bg-emerald-500 shadow-glow-emerald';

  return (
    <div className="p-4 rounded-xl bg-cyber-850/80 border border-cyber-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-shield-cyan" />
          <span className="text-xs font-mono font-semibold uppercase text-cyber-300">
            Semantic Similarity
          </span>
        </div>
        <span className="text-base font-extrabold font-mono text-white">
          {formatPercentage(score)}
        </span>
      </div>

      {/* Progress Bar with Threshold Markers */}
      <div className="relative w-full h-3 bg-cyber-950 rounded-full overflow-hidden border border-cyber-750">
        <div
          className={`h-full transition-all duration-700 rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Marker Legends */}
      <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-cyber-400">
        <span>0%</span>
        <span className="text-amber-400">Warn ({warnThreshold * 100}%)</span>
        <span className="text-rose-400">Block ({blockThreshold * 100}%)</span>
        <span>100%</span>
      </div>
    </div>
  );
};
