import React from 'react';
import { Decision } from '../../types/detection';
import { RefreshCw, Search, Shield, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface AuditFiltersProps {
  selectedDecision?: Decision;
  onSelectDecision: (decision?: Decision) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const AuditFilters: React.FC<AuditFiltersProps> = ({
  selectedDecision,
  onSelectDecision,
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading,
}) => {
  const filterPills: { label: string; value?: Decision; icon: React.ReactNode; countLabel?: string }[] = [
    { label: 'All Records', value: undefined, icon: <Shield className="w-3.5 h-3.5" /> },
    { label: 'Allowed', value: 'ALLOW', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> },
    { label: 'Warnings', value: 'WARN', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> },
    { label: 'Blocked', value: 'BLOCK', icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> },
  ];

  return (
    <div className="cyber-card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      {/* Decision filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
        {filterPills.map((pill) => {
          const isSelected = selectedDecision === pill.value;
          return (
            <button
              key={pill.label}
              type="button"
              onClick={() => onSelectDecision(pill.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 flex-shrink-0 ${
                isSelected
                  ? 'bg-shield-cyan/20 border border-shield-cyan/50 text-white font-bold shadow-glow-cyan/30'
                  : 'bg-cyber-850 border border-cyber-750 text-cyber-300 hover:text-white hover:bg-cyber-800'
              }`}
            >
              {pill.icon}
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input & Refresh */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 text-cyber-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search prompt / response..."
            className="w-full pl-9 pr-3 py-1.5 bg-cyber-950 border border-cyber-750 focus:border-shield-cyan/70 focus:ring-0 rounded-lg text-xs font-mono text-cyber-100 placeholder-cyber-500 transition"
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg bg-cyber-850 hover:bg-cyber-800 border border-cyber-750 text-cyber-300 hover:text-white transition disabled:opacity-50"
          title="Refresh Logs"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-shield-cyan' : ''}`} />
        </button>
      </div>
    </div>
  );
};
