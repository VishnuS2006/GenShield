import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { PageHeader } from '../components/common/PageHeader';
import { AuditFilters } from '../components/audit/AuditFilters';
import { AuditTable } from '../components/audit/AuditTable';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import { ScrollText, ShieldCheck } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { records, isLoading, error, decisionFilter, setFilter, refetch } = useHistory({
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs & Compliance Ledger"
        subtitle="Immutable record of all LLM requests, generated outputs, security risk scores, and policy decisions"
        icon={ScrollText}
        badge="Audit Ledger"
      />

      {/* Filter Controls */}
      <AuditFilters
        selectedDecision={decisionFilter}
        onSelectDecision={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {/* Content */}
      {isLoading && records.length === 0 ? (
        <SkeletonTable rows={8} cols={6} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Audit Records Found"
          description="There are no audit logs recorded matching your filter criteria. Run prompts in the AI Agent Simulator to create history entries."
        />
      ) : (
        <div className="animate-fadeIn">
          <AuditTable records={records} searchQuery={searchQuery} />
        </div>
      )}
    </div>
  );
};
