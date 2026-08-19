import React from 'react';
import { PRESET_SCENARIOS, ScenarioPreset } from '../../utils/constants';
import { Layers, ChevronRight } from 'lucide-react';

interface ScenarioSelectorProps {
  selectedScenario: ScenarioPreset | null;
  onSelect: (scenario: ScenarioPreset) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selectedScenario,
  onSelect,
}) => {
  return (
    <div className="cyber-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-shield-cyan" />
        <h3 className="text-sm font-semibold text-white">Select Synthetic Enterprise Scenario</h3>
      </div>
      <p className="text-xs text-cyber-400 mb-4">
        Choose a confidential business domain to simulate legitimate employee prompts and test GenShield’s semantic DLP prevention.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRESET_SCENARIOS.map((scenario) => {
          const isSelected = selectedScenario?.id === scenario.id;

          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelect(scenario)}
              className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between group ${
                isSelected
                  ? 'bg-shield-cyan/15 border-shield-cyan shadow-glow-cyan/40 text-white'
                  : 'bg-cyber-850/70 border-cyber-800 hover:border-cyber-700 hover:bg-cyber-800/80 text-cyber-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-shield-cyan transition-colors">
                    {scenario.title}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-900 border border-cyber-750 text-cyber-300">
                    {scenario.department}
                  </span>
                </div>
                <p className="text-[11px] text-cyber-400 leading-snug line-clamp-2">
                  {scenario.description}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-cyber-400">
                <span>{scenario.lineageTag}</span>
                <span className="flex items-center text-shield-cyan group-hover:translate-x-0.5 transition-transform">
                  Load <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
