import React, { useState } from 'react';
import { Bot, Copy, Check, ShieldAlert, Sparkles, Hash } from 'lucide-react';
import { GenerateResponse } from '../../types/detection';
import { DecisionBadge } from '../common/DecisionBadge';
import { DECISION_CONFIG } from '../../utils/constants';

interface GeneratedResultCardProps {
  result: GenerateResponse;
}

export const GeneratedResultCard: React.FC<GeneratedResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const decisionConfig = DECISION_CONFIG[result.security_analysis.decision];

  const handleCopy = () => {
    navigator.clipboard.writeText(result.generated_response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`cyber-card p-6 border transition-all ${
        result.security_analysis.decision === 'BLOCK'
          ? 'border-rose-800/80 bg-rose-950/20'
          : result.security_analysis.decision === 'WARN'
          ? 'border-amber-800/80 bg-amber-950/20'
          : 'border-emerald-800/80 bg-emerald-950/20'
      }`}
    >
      {/* Top Banner: Decision & Request ID */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyber-800/80 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyber-850 border border-cyber-700/80 text-shield-cyan">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">LLM Generated Response</h3>
              <DecisionBadge decision={result.security_analysis.decision} size="md" />
            </div>
            <p className="text-xs text-cyber-400 mt-0.5">{decisionConfig.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg bg-cyber-850 border border-cyber-750 text-cyber-300">
            <Hash className="w-3 h-3 text-cyber-500" />
            {result.request_id.substring(0, 8)}...
          </span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-cyber-400 hover:text-white bg-cyber-850 hover:bg-cyber-800 border border-cyber-750 transition flex items-center gap-1.5 text-xs"
            title="Copy response text"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-mono">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="font-mono">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prompt Context Accordion/Badge */}
      <div className="mb-4 p-3 rounded-lg bg-cyber-900/90 border border-cyber-800 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-shield-cyan flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyber-400 block mb-0.5">
            Prompt Submitted:
          </span>
          <p className="text-xs font-mono text-cyber-200 break-words">{result.prompt}</p>
        </div>
      </div>

      {/* Generated Response Body */}
      <div className="relative">
        <div className="p-4 sm:p-5 rounded-xl bg-cyber-950/95 border border-cyber-800 text-sm font-sans text-cyber-100 leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap selection:bg-shield-cyan/30">
          {result.generated_response}
        </div>

        {/* If Blocked, show prominent security badge */}
        {result.security_analysis.decision === 'BLOCK' && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-600/50 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-rose-300 uppercase">Policy Enforcement Action: </span>
              <span className="text-rose-200">
                This response contains high-risk confidential data exfiltration and would be blocked from reaching the client application in production.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
