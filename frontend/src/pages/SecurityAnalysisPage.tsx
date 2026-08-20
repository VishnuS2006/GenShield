import React from 'react';
import { Cpu, Eye, FileKey2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DetectionPlayground } from '../components/security/DetectionPlayground';
import { AuditLogsPage } from './AuditLogsPage';

export const SecurityAnalysisPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Analysis"
        subtitle="Independent detection results, signal breakdowns, and audit history"
        icon={ShieldCheck}
        badge="Independent Detection"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-cyber-900 border border-cyber-800">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-shield-cyan" />
            <span className="text-xs font-mono font-bold text-white">1. Semantic Similarity</span>
          </div>
          <p className="text-[11px] text-cyber-400">
            Dense embeddings via all-MiniLM-L6-v2 with cosine similarity against protected documents.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-cyber-900 border border-cyber-800">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-shield-emerald" />
            <span className="text-xs font-mono font-bold text-white">2. Factual Overlap</span>
          </div>
          <p className="text-[11px] text-cyber-400">
            Deterministic matching for protected facts, dates, named entities, and business identifiers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-cyber-900 border border-cyber-800">
          <div className="flex items-center gap-2 mb-2">
            <FileKey2 className="w-4 h-4 text-shield-indigo" />
            <span className="text-xs font-mono font-bold text-white">3. Data Lineage</span>
          </div>
          <p className="text-[11px] text-cyber-400">
            Traceability from generated output to matched protected documents and lineage tags.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-cyber-900 border border-cyber-800">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-mono font-bold text-white">4. Risk Policy</span>
          </div>
          <p className="text-[11px] text-cyber-400">
            Deterministic ALLOW, WARN, and BLOCK decisions using backend risk thresholds.
          </p>
        </div>
      </div>

      <DetectionPlayground />
      <AuditLogsPage />
    </div>
  );
};
