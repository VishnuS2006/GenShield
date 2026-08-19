import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { DetectionPlayground } from '../components/security/DetectionPlayground';
import { ShieldCheck, Cpu, Eye, FileKey2, ShieldAlert } from 'lucide-react';

export const SecurityAnalysisPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Analysis & Detection Engine"
        subtitle="Evaluate LLM responses independently using GenShield's 4-signal semantic exfiltration architecture"
        icon={ShieldCheck}
        badge="Independent Detection"
      />

      {/* Signal Pipeline Explanation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-cyber-900 border border-cyber-800">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-shield-cyan" />
            <span className="text-xs font-mono font-bold text-white">1. Semantic Similarity</span>
          </div>
          <p className="text-[11px] text-cyber-400">
            Transforms text into dense vector embeddings (all-MiniLM-L6-v2) and calculates cosine similarity.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-cyber-900 border border-cyber-800">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-shield-emerald" />
            <span className="text-xs font-mono font-bold text-white">2. Factual Overlap</span>
          </div>
          <p className="text-[11px] text-cyber-400">
            Identifies protected facts, numbers, dates, and named entities disclosed within the response.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-cyber-900 border border-cyber-800">
          <div className="flex items-center gap-2 mb-2">
            <FileKey2 className="w-4 h-4 text-shield-indigo" />
            <span className="text-xs font-mono font-bold text-white">3. Data Lineage</span>
          </div>
          <p className="text-[11px] text-cyber-400">
            Traces leaked text directly back to source documents and classification tags (e.g. CONF-PRODUCT-001).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-cyber-900 border border-cyber-800">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-mono font-bold text-white">4. Risk & Policy</span>
          </div>
          <p className="text-[11px] text-cyber-400">
            Synthesizes all signals into an explainable 0-100 risk score and enforces ALLOW, WARN, or BLOCK.
          </p>
        </div>
      </div>

      {/* Standalone Detection Playground */}
      <DetectionPlayground />
    </div>
  );
};
