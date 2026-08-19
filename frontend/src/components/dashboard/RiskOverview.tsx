import React from 'react';
import { ShieldAlert, Cpu, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const RiskOverview: React.FC = () => {
  const policies = [
    {
      title: 'Semantic Similarity Engine',
      icon: Cpu,
      desc: 'Embeddings cosine distance against confidential vector vault (thresholds: 0.60 Warn / 0.85 Block).',
      status: 'Active',
      color: 'text-shield-cyan',
    },
    {
      title: 'Factual Overlap Extractor',
      icon: Eye,
      desc: 'Named entity, revenue numbers, project dates, and lineage keyword cross-referencing.',
      status: 'Active',
      color: 'text-shield-emerald',
    },
    {
      title: 'Data Lineage Tracer',
      icon: FileText,
      desc: 'Cryptographic mapping of matched confidential source records to model runtime context.',
      status: 'Active',
      color: 'text-shield-indigo',
    },
    {
      title: 'Real-time Policy Enforcement',
      icon: ShieldAlert,
      desc: 'Instant ALLOW, WARN, or BLOCK verdict preventing sensitive data leakage outside enterprise boundary.',
      status: 'Enforcing',
      color: 'text-rose-400',
    },
  ];

  return (
    <div className="cyber-card p-6">
      <div className="flex items-center justify-between pb-4 border-b border-cyber-800/80 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Security Architecture Overview</h3>
          <p className="text-xs text-cyber-400">Four-signal semantic data exfiltration defense pipeline</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          PROTECTED
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {policies.map((p, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-cyber-850/60 border border-cyber-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-cyber-800 border border-cyber-700">
                  <p.icon className={`w-4 h-4 ${p.color}`} />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyber-900 text-cyber-300 border border-cyber-750">
                  {p.status}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-white mb-1">{p.title}</h4>
              <p className="text-[11px] text-cyber-400 leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
