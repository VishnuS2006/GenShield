import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowUpRight, Clock } from 'lucide-react';
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
            <h3 className="text-base font-semibold text-white">Recent Detections</h3>
            <p className="text-xs text-cyber-400">Live security scanning feed</p>
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
          No detections recorded yet. Run a prompt in the AI Simulator to start monitoring.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cyber-800 text-cyber-400 font-mono uppercase tracking-wider">
                <th className="pb-3 px-2 font-medium">Request ID</th>
                <th className="pb-3 px-2 font-medium">Decision</th>
                <th className="pb-3 px-2 font-medium">Risk Score</th>
                <th className="pb-3 px-2 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-800/50">
              {detections.map((detection) => (
                <tr
                  key={detection.request_id}
                  className="hover:bg-cyber-850/50 transition-colors group"
                >
                  <td className="py-3 px-2 font-mono font-medium text-cyber-200">
                    <span title={detection.request_id}>
                      {formatRequestId(detection.request_id)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <DecisionBadge decision={detection.decision} size="sm" />
                  </td>
                  <td className="py-3 px-2 font-mono">
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
                  <td className="py-3 px-2 text-cyber-400 font-mono flex items-center gap-1.5 mt-1">
                    <Clock className="w-3 h-3 text-cyber-500" />
                    <span>{formatDate(detection.created_at)}</span>
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
