import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/dashboard/StatCard';
import { DetectionChart } from '../components/dashboard/DetectionChart';
import { RecentDetections } from '../components/dashboard/RecentDetections';
import { RiskOverview } from '../components/dashboard/RiskOverview';
import { SkeletonCard, SkeletonTable } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import {
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Layers,
  RefreshCw,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboard(true, 15000);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Security Operations Center"
        subtitle="Real-time semantic exfiltration surveillance & LLM guardrails telemetry"
        icon={LayoutDashboard}
        badge="Live Telemetry"
        actions={
          <button
            type="button"
            onClick={refetch}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium bg-cyber-850 hover:bg-cyber-800 text-cyber-300 hover:text-white border border-cyber-750 transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-shield-cyan' : ''}`} />
            <span>Refresh</span>
          </button>
        }
      />

      {error && <ErrorMessage message={error} onRetry={refetch} className="mb-4" />}

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
            subtitle="All model requests inspected"
            icon={Layers}
            variant="cyan"
          />
          <StatCard
            title="Allowed"
            value={data.allowed_responses}
            subtitle="Safe, compliant output"
            icon={ShieldCheck}
            variant="emerald"
          />
          <StatCard
            title="Warnings"
            value={data.warnings}
            subtitle="Moderate risk detected"
            icon={AlertTriangle}
            variant="amber"
          />
          <StatCard
            title="Blocked"
            value={data.blocked_responses}
            subtitle="Exfiltration prevented"
            icon={ShieldAlert}
            variant="crimson"
          />
          <StatCard
            title="Avg Risk Score"
            value={`${data.average_risk_score}`}
            subtitle="Out of 100 max risk"
            icon={Activity}
            variant={data.average_risk_score >= 60 ? 'amber' : 'indigo'}
          />
        </div>
      ) : null}

      {/* Visualizations & Recent Feed */}
      {data && (
        <div className="space-y-6 animate-fadeIn">
          {/* Charts Row */}
          <DetectionChart data={data} />

          {/* Recent Detections Feed */}
          <RecentDetections detections={data.recent_detections} />

          {/* Architecture Overview */}
          <RiskOverview />
        </div>
      )}

      {isLoading && !data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard height="h-72" />
            <SkeletonCard height="h-72" />
          </div>
          <SkeletonTable rows={5} cols={4} />
        </div>
      )}
    </div>
  );
};
