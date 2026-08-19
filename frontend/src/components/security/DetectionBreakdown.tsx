import React from 'react';
import { SecurityAnalysis } from '../../types/detection';
import { RiskScore } from './RiskScore';
import { SimilarityScore } from './SimilarityScore';
import { FactOverlap } from './FactOverlap';
import { LineageCard } from './LineageCard';
import { ShieldCheck, HelpCircle } from 'lucide-react';

interface DetectionBreakdownProps {
  analysis: SecurityAnalysis;
  title?: string;
}

export const DetectionBreakdown: React.FC<DetectionBreakdownProps> = ({
  analysis,
  title = 'Four-Signal Security Analysis',
}) => {
  return (
    <div className="cyber-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-cyber-800/80 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-shield-cyan/10 border border-shield-cyan/30 text-shield-cyan">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-cyber-400">
              Explainable multi-vector inspection of LLM generated output
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-cyber-400">
          <HelpCircle className="w-3.5 h-3.5 text-shield-cyan" />
          <span>Explainable AI Security</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signal 1: Risk Score & Decision */}
        <div className="lg:col-span-1">
          <RiskScore score={analysis.risk_score} decision={analysis.decision} className="h-full" />
        </div>

        {/* Signals 2, 3, 4 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Signal 2: Semantic Similarity */}
          <SimilarityScore score={analysis.similarity_score} />

          {/* Signal 3: Factual Overlap */}
          <FactOverlap
            factsMatched={analysis.facts_matched}
            factsTotal={analysis.facts_total}
            overlapScore={analysis.factual_overlap_score}
            matchedFacts={analysis.matched_facts}
          />

          {/* Signal 4: Lineage & Provenance */}
          <LineageCard
            matchedSource={analysis.matched_source}
            lineageTag={analysis.lineage_tag}
            sensitivity={analysis.sensitivity}
          />
        </div>
      </div>
    </div>
  );
};
