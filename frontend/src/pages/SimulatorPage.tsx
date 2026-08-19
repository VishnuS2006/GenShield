import React, { useState } from 'react';
import { useGenerate } from '../hooks/useGenerate';
import { PageHeader } from '../components/common/PageHeader';
import { ScenarioSelector } from '../components/simulator/ScenarioSelector';
import { ScenarioCard } from '../components/simulator/ScenarioCard';
import { PromptInput } from '../components/simulator/PromptInput';
import { GeneratedResultCard } from '../components/simulator/GeneratedResultCard';
import { DetectionBreakdown } from '../components/security/DetectionBreakdown';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { PRESET_SCENARIOS, ScenarioPreset } from '../utils/constants';
import { Bot, RotateCcw, ShieldCheck } from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioPreset | null>(
    PRESET_SCENARIOS[0]
  );
  const [prompt, setPrompt] = useState<string>(PRESET_SCENARIOS[0].defaultPrompt);

  const { result, phase, isLoading, error, generate, reset } = useGenerate();

  const handleSelectScenario = (scenario: ScenarioPreset) => {
    setSelectedScenario(scenario);
    setPrompt(scenario.defaultPrompt);
    reset();
  };

  const handleUsePrompt = (newPrompt: string) => {
    setPrompt(newPrompt);
  };

  const handleExecute = async () => {
    if (!prompt.trim() || isLoading) return;
    await generate({
      prompt: prompt.trim(),
      scenario: selectedScenario?.id,
    });
  };

  const getPhaseLabel = () => {
    if (phase === 'generating') return '1/3 Generating LLM Output...';
    if (phase === 'analyzing') return '2/3 Calculating Embeddings & Overlap...';
    if (phase === 'evaluating') return '3/3 Evaluating Policy & Lineage...';
    return 'Processing...';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agent Simulator & Exfiltration Sandbox"
        subtitle="Simulate legitimate user requests to test real-time semantic exfiltration detection and policy enforcement"
        icon={Bot}
        badge="Runtime Guardrails"
        actions={
          result && (
            <button
              type="button"
              onClick={reset}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-cyber-850 hover:bg-cyber-800 text-shield-cyan border border-cyber-750 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Simulation
            </button>
          )
        }
      />

      {/* Scenario Selection Grid */}
      <ScenarioSelector
        selectedScenario={selectedScenario}
        onSelect={handleSelectScenario}
      />

      {/* Active Scenario Card & Suggestions */}
      {selectedScenario && (
        <ScenarioCard
          scenario={selectedScenario}
          onUsePrompt={handleUsePrompt}
        />
      )}

      {/* Prompt Input Sandbox */}
      <PromptInput
        prompt={prompt}
        onChange={setPrompt}
        onSubmit={handleExecute}
        onClear={() => setPrompt('')}
        isLoading={isLoading}
        phaseLabel={getPhaseLabel()}
      />

      {error && <ErrorMessage message={error} onRetry={handleExecute} />}

      {/* Result Section */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main LLM Output Card */}
          <GeneratedResultCard result={result} />

          {/* Deep-dive 4-Signal Security Analysis */}
          <DetectionBreakdown
            analysis={result.security_analysis}
            title="GenShield Four-Signal Security Assessment"
          />
        </div>
      )}

      {/* Helper Context Info */}
      {!result && !isLoading && (
        <div className="p-4 rounded-xl bg-cyber-900/60 border border-cyber-800 flex items-start gap-3 text-xs text-cyber-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-shield-cyan flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-cyber-200">How GenShield Works: </span>
            The user prompt is dispatched to the runtime model with synthetic context. The generated response is intercepted and evaluated across semantic embeddings cosine similarity, entity/fact overlap, risk scoring, and data lineage before being delivered.
          </div>
        </div>
      )}
    </div>
  );
};
