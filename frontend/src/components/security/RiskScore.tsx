import React from 'react';
import { RiskScoreGauge } from '../common/RiskScoreGauge';
import { DecisionBadge } from '../common/DecisionBadge';
import { Decision } from '../../types/detection';
import { Shield, Info } from 'lucide-react';

interface RiskScoreProps {
  score: number;
  decision: Decision;
  className?: string;
}

export const RiskScore: React.FC<RiskScoreProps> = ({ score, decision, className = '' }) => {
  return (
    <div className={`p-5 rounded-xl bg-cyber-850/80 border border-cyber-800 flex flex-col items-center justify-between text-center ${className}`}>
      <div className="w-full flex items-center justify-between pb-3 border-b border-cyber-800 mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-shield-cyan" />
          <span className="text-xs font-mono font-semibold uppercase text-cyber-300">
            Risk Assessment
          </span>
        </div>
        <DecisionBadge decision={decision} size="sm" />
      </div>

      <div className="my-2">
        <RiskScoreGauge score={score} size={130} strokeWidth={11} showLabel={false} />
      </div>

      <div className="w-full mt-4 pt-3 border-t border-cyber-800 text-left">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyber-400 mb-1">
          <Info className="w-3.5 h-3.5 text-shield-cyan" />
          <span>Decision Rule:</span>
        </div>
        <p className="text-xs text-cyber-300 leading-snug">
          {decision === 'BLOCK'
            ? 'Score exceeds block boundary (≥90) or critical facts leaked.'
            : decision === 'WARN'
            ? 'Score in warning band (60-89). Moderate semantic overlap.'
            : 'Score below warning threshold (<60). Permitted output.'}
        </p>
      </div>
    </div>
  );
};
