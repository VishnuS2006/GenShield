import React, { useState } from 'react';
import { HistoryRecord } from '../../types/history';
import { DecisionBadge } from '../common/DecisionBadge';
import { formatDate, formatRequestId, truncateText } from '../../utils/formatters';
import { AuditDetailsModal } from './AuditDetailsModal';
import { Eye, Clock } from 'lucide-react';

interface AuditTableProps {
  records: HistoryRecord[];
  searchQuery?: string;
}

export const AuditTable: React.FC<AuditTableProps> = ({ records, searchQuery = '' }) => {
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  // Client-side search filtering on loaded batch
  const filteredRecords = records.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.prompt.toLowerCase().includes(q) ||
      r.generated_response.toLowerCase().includes(q) ||
      r.request_id.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="cyber-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cyber-850/80 border-b border-cyber-800 text-cyber-400 font-mono uppercase tracking-wider">
                <th className="py-3.5 px-4 font-medium">Request ID</th>
                <th className="py-3.5 px-4 font-medium">Decision</th>
                <th className="py-3.5 px-4 font-medium">Risk Score</th>
                <th className="py-3.5 px-4 font-medium">Prompt Preview</th>
                <th className="py-3.5 px-4 font-medium">Logged At</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-800/50">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-cyber-500 font-mono">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.request_id}
                    onClick={() => setSelectedRecord(record)}
                    className="hover:bg-cyber-850/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-cyber-200">
                      <span className="group-hover:text-shield-cyan transition-colors" title={record.request_id}>
                        {formatRequestId(record.request_id)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <DecisionBadge decision={record.decision} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`font-bold ${
                          record.risk_score >= 90
                            ? 'text-rose-400'
                            : record.risk_score >= 60
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {record.risk_score} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-cyber-300 max-w-xs truncate" title={record.prompt}>
                      {truncateText(record.prompt, 60)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyber-400 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-cyber-500" />
                        {formatDate(record.created_at)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(record);
                        }}
                        className="p-1.5 rounded-lg bg-cyber-800 hover:bg-cyber-700 text-cyber-300 hover:text-white border border-cyber-700 transition"
                        title="Inspect Log"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AuditDetailsModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </>
  );
};
