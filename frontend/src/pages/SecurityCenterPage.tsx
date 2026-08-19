import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/dashboard/StatCard';
import { DetectionChart } from '../components/dashboard/DetectionChart';
import { RecentDetections } from '../components/dashboard/RecentDetections';
import { RiskOverview } from '../components/dashboard/RiskOverview';
import { SkeletonCard, SkeletonTable } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Layers,
  RefreshCw,
  Cpu,
  Eye,
  FileKey2,
  Lock,
} from 'lucide-react';

export const SecurityCenterPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboard(true, 15000);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'pipeline' | 'sources'>('telemetry');

  return (
    <div className="space-y-6">
      <PageHeader
        title="GenShield Security Center"
        subtitle="Autonomous semantic guardrails telemetry, 4-signal leakage detection & policy enforcement"
        icon={ShieldCheck}
        badge="Active Protection"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refetch}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium bg-cyber-850 hover:bg-cyber-800 text-cyber-300 hover:text-white border border-cyber-750 transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-shield-cyan' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {error && <ErrorMessage message={error} onRetry={refetch} className="mb-4" />}

      {/* Tab Navigation */}
      <div className="flex border-b border-cyber-800 space-x-6 text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('telemetry')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'telemetry'
              ? 'border-b-2 border-shield-cyan text-shield-cyan font-semibold'
              : 'text-cyber-400 hover:text-cyber-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Live Telemetry & Detections
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pipeline')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'pipeline'
              ? 'border-b-2 border-shield-cyan text-shield-cyan font-semibold'
              : 'text-cyber-400 hover:text-cyber-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          4-Signal Architecture
        </button>
      </div>

      {/* Metrics Row */}
      {isLoading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Scans"
            value={data.total_requests}
            subtitle="Chatbot outputs analyzed"
            icon={Layers}
            variant="cyan"
          />
          <StatCard
            title="Allowed"
            value={data.allowed_responses}
            subtitle="Safe enterprise responses"
            icon={ShieldCheck}
            variant="emerald"
          />
          <StatCard
            title="Warnings"
            value={data.warnings}
            subtitle="Borderline leakage flagged"
            icon={AlertTriangle}
            variant="amber"
          />
          <StatCard
            title="Blocked"
            value={data.blocked_responses}
            subtitle="Confidential disclosures prevented"
            icon={ShieldAlert}
            variant="crimson"
          />
          <StatCard
            title="Avg Risk Score"
            value={`${data.average_risk_score}`}
            subtitle="Scale of 0 - 100"
            icon={Activity}
            variant={data.average_risk_score >= 60 ? 'amber' : 'indigo'}
          />
        </div>
      ) : null}

      {/* Main Tab Content */}
      {activeTab === 'telemetry' && data && (
        <div className="space-y-6 animate-fadeIn">
          {/* Charts Row */}
          <DetectionChart data={data} />

          {/* Recent Detections Feed */}
          <RecentDetections detections={data.recent_detections} />

          {/* Architecture Overview */}
          <RiskOverview />
        </div>
      )}

      {activeTab === 'pipeline' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 4-Signal Explanatory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-cyber-900 border border-cyber-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-shield-cyan/15 border border-shield-cyan/30 text-shield-cyan">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">1. Semantic Similarity</h4>
              </div>
              <p className="text-xs text-cyber-300 leading-relaxed">
                Transforms generated responses into dense 384-dimensional vector embeddings using <code className="text-shield-cyan font-mono text-[11px]">all-MiniLM-L6-v2</code> and calculates exact cosine similarity against protected vault embeddings.
              </p>
              <div className="pt-2 border-t border-cyber-800/80 text-[11px] font-mono text-cyber-400">
                Threshold: &gt;0.60 Warn / &gt;0.85 Block
              </div>
            </div>

            <div className="p-5 rounded-xl bg-cyber-900 border border-cyber-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-shield-emerald/15 border border-shield-emerald/30 text-shield-emerald">
                  <Eye className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">2. Factual Overlap</h4>
              </div>
              <p className="text-xs text-cyber-300 leading-relaxed">
                Scans generated text for named entities, dates, revenue figures, project codenames, and specific internal facts weighted by entity importance.
              </p>
              <div className="pt-2 border-t border-cyber-800/80 text-[11px] font-mono text-cyber-400">
                Weighted entity matching
              </div>
            </div>

            <div className="p-5 rounded-xl bg-cyber-900 border border-cyber-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-shield-indigo/15 border border-shield-indigo/30 text-shield-indigo">
                  <FileKey2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">3. Data Lineage</h4>
              </div>
              <p className="text-xs text-cyber-300 leading-relaxed">
                Maps detected text directly to originating sources, tracking classification tags (e.g. <code className="text-shield-indigo font-mono text-[11px]">CONF-FINANCE-001</code>) and sensitivity levels (Critical, High, Medium, Low).
              </p>
              <div className="pt-2 border-t border-cyber-800/80 text-[11px] font-mono text-cyber-400">
                Document-level provenance
              </div>
            </div>

            <div className="p-5 rounded-xl bg-cyber-900 border border-cyber-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">4. Policy Enforcement</h4>
              </div>
              <p className="text-xs text-cyber-300 leading-relaxed">
                Fuses similarity, factual overlap, and sensitivity into a unified 0-100 risk score and autonomously enforces ALLOW (0-59), WARN (60-89), or BLOCK (90-100).
              </p>
              <div className="pt-2 border-t border-cyber-800/80 text-[11px] font-mono text-cyber-400">
                Real-time redacting & logging
              </div>
            </div>
          </div>

          <RiskOverview />
        </div>
      )}

      {isLoading && !data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard height="h-72" />
            <SkeletonCard height="h-72" />
          </div>
          <SkeletonTable rows={5} cols={5} />
        </div>
      )}
    </div>
  );
};
