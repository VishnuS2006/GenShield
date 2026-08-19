import React from 'react';
import { ScenarioPreset } from '../../utils/constants';
import { Sparkles, Tag, Building2, Lightbulb } from 'lucide-react';

interface ScenarioCardProps {
  scenario: ScenarioPreset;
  onUsePrompt: (prompt: string) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onUsePrompt }) => {
  return (
    <div className="cyber-card p-5 bg-gradient-to-br from-cyber-900 via-cyber-900 to-cyber-850 border-cyber-750">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyber-800/80 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-shield-cyan" />
          <h4 className="text-sm font-bold text-white">{scenario.title}</h4>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyber-800 border border-cyber-700 text-cyber-300">
            <Building2 className="w-3 h-3 text-cyber-400" />
            {scenario.department}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
            <Tag className="w-3 h-3 text-cyan-400" />
            {scenario.lineageTag}
          </span>
        </div>
      </div>

      <p className="text-xs text-cyber-300 mb-4 leading-relaxed">
        {scenario.description}
      </p>

      {/* Suggested prompts */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyber-400 uppercase tracking-wider mb-2">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          Suggested Enterprise Prompts:
        </div>

        <div className="space-y-1.5">
          {[scenario.defaultPrompt, ...scenario.alternativePrompts].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onUsePrompt(prompt)}
              className="w-full text-left text-xs font-mono px-3 py-2 rounded-lg bg-cyber-800/80 hover:bg-cyber-750 border border-cyber-700/60 hover:border-shield-cyan/50 text-cyber-200 hover:text-white transition flex items-center justify-between group"
            >
              <span className="truncate pr-2">"{prompt}"</span>
              <span className="text-[10px] text-shield-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                Use ↵
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
