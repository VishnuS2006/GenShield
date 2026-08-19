import React from 'react';
import { Eye, CheckCircle2, ShieldX } from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';

interface FactOverlapProps {
  factsMatched: number;
  factsTotal: number;
  overlapScore: number;
  matchedFacts?: string[];
}

export const FactOverlap: React.FC<FactOverlapProps> = ({
  factsMatched,
  factsTotal,
  overlapScore,
  matchedFacts = [],
}) => {
  const isHighOverlap = overlapScore >= 0.5 || factsMatched >= 2;

  return (
    <div className="p-4 rounded-xl bg-cyber-850/80 border border-cyber-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-shield-cyan" />
          <span className="text-xs font-mono font-semibold uppercase text-cyber-300">
            Factual Overlap
          </span>
        </div>
        <div className="text-right font-mono">
          <span className="text-base font-extrabold text-white">
            {factsMatched} / {factsTotal}
          </span>
          <span className="text-xs text-cyber-400 ml-1.5">
            ({formatPercentage(overlapScore)})
          </span>
        </div>
      </div>

      <div className="relative w-full h-3 bg-cyber-950 rounded-full overflow-hidden border border-cyber-750">
        <div
          className={`h-full transition-all duration-700 rounded-full ${
            isHighOverlap ? 'bg-rose-500 shadow-glow-crimson' : 'bg-emerald-500 shadow-glow-emerald'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, overlapScore * 100))}%` }}
        />
      </div>

      {/* Matched Facts Tags */}
      {matchedFacts.length > 0 ? (
        <div className="mt-3 pt-3 border-t border-cyber-800">
          <span className="text-[10px] font-mono uppercase text-cyber-400 block mb-1.5">
            Extracted Confidential Facts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matchedFacts.map((fact, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-rose-950/60 border border-rose-600/40 text-rose-300"
              >
                <ShieldX className="w-3 h-3 text-rose-400 flex-shrink-0" />
                {fact}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-cyber-800 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>No confidential facts detected in response text</span>
        </div>
      )}
    </div>
  );
};
