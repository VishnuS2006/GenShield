import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowUpRight, Clock, FileKey2 } from 'lucide-react';
import { RecentDetection } from '../../types/dashboard';
import { DecisionBadge } from '../common/DecisionBadge';
import { formatDate, formatRequestId } from '../../utils/formatters';

interface RecentDetectionsProps {
  detections: RecentDetection[];
}

export const RecentDetections: React.FC<RecentDetectionsProps> = ({ detections }) => {
  return (
    <div className="cyber-card p-6">
      <div className="flex items-center justify-between pb-4 border-b border-cyber-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-shield-cyan/10 border border-shield-cyan/30 text-shield-cyan">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Recent Security Detections</h3>
            <p className="text-xs text-cyber-400">Live semantic exfiltration surveillance feed</p>
          </div>
        </div>

        <Link
          to="/audit-logs"
          className="inline-flex items-center gap-1 text-xs font-mono font-medium text-shield-cyan hover:text-shield-cyanDark transition"
        >
          View Full Audit Log
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {detections.length === 0 ? (
        <div className="py-8 text-center text-cyber-500 font-mono text-xs">
          No detections recorded yet. Security-screened chatbot interactions will appear here automatically.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cyber-800 text-cyber-400 font-mono uppercase tracking-wider">
                <th className="pb-3 px-3 font-medium">Request ID</th>
                <th className="pb-3 px-3 font-medium">Decision</th>
                <th className="pb-3 px-3 font-medium">Risk Score</th>
                <th className="pb-3 px-3 font-medium">Similarity / Overlap</th>
                <th className="pb-3 px-3 font-medium">Lineage Tag</th>
                <th className="pb-3 px-3 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-800/50">
              {detections.map((detection) => (
                <tr
                  key={detection.request_id}
                  className="hover:bg-cyber-850/50 transition-colors group"
                >
                  <td className="py-3 px-3 font-mono font-medium text-cyber-200">
                    <span title={detection.request_id}>
                      {formatRequestId(detection.request_id)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <DecisionBadge decision={detection.decision} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span
                      className={`font-semibold ${
                        detection.risk_score >= 90
                          ? 'text-rose-400'
                          : detection.risk_score >= 60
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {detection.risk_score} / 100
                    </span>
                  </td>
                  <td className="py-3 px-3 text-cyber-300 font-mono">
                    {typeof detection.similarity_score === 'number' ? (
                      <span>
                        Sim {(detection.similarity_score * 100).toFixed(0)}%
                        {typeof detection.facts_matched === 'number' && detection.facts_matched > 0
                          ? ` • ${detection.facts_matched} facts`
                          : ''}
                      </span>
                    ) : (
                      <span className="text-cyber-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-xs">
                    {detection.lineage_tag ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyber-800 border border-cyber-700 text-shield-indigo">
                        <FileKey2 className="w-3 h-3" />
                        {detection.lineage_tag}
                      </span>
                    ) : (
                      <span className="text-cyber-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-cyber-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-cyber-500" />
                      <span>{formatDate(detection.created_at)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
