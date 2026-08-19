import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardResponse } from '../../types/dashboard';

interface DetectionChartProps {
  data: DashboardResponse;
}

export const DetectionChart: React.FC<DetectionChartProps> = ({ data }) => {
  const pieData = [
    { name: 'Allowed', value: data.allowed_responses, color: '#10b981' },
    { name: 'Warnings', value: data.warnings, color: '#f59e0b' },
    { name: 'Blocked', value: data.blocked_responses, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  const barData = [
    { name: 'Allow', count: data.allowed_responses, fill: '#10b981' },
    { name: 'Warn', count: data.warnings, fill: '#f59e0b' },
    { name: 'Block', count: data.blocked_responses, fill: '#ef4444' },
  ];

  const total = data.total_requests || 1;
  const allowRate = Math.round((data.allowed_responses / total) * 100);
  const blockRate = Math.round((data.blocked_responses / total) * 100);
  const warnRate = Math.round((data.warnings / total) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart: Policy Distribution */}
      <div className="cyber-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-white">Policy Decision Breakdown</h3>
            <span className="text-xs font-mono text-cyber-400">Total: {data.total_requests}</span>
          </div>
          <p className="text-xs text-cyber-400">
            Real-time breakdown of LLM generation security verdicts.
          </p>
        </div>

        <div className="h-64 my-4 relative flex items-center justify-center">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d16" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-cyber-500 text-xs font-mono">
              No detection records to chart
            </div>
          )}

          {pieData.length > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-white">{data.total_requests}</span>
              <span className="text-[10px] font-mono uppercase text-cyber-400">Total Scans</span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-cyber-800/80 text-center">
          <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block">Allow</span>
            <span className="text-sm font-bold font-mono text-emerald-300">{allowRate}%</span>
          </div>
          <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-900/40">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold block">Warn</span>
            <span className="text-sm font-bold font-mono text-amber-300">{warnRate}%</span>
          </div>
          <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-900/40">
            <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold block">Block</span>
            <span className="text-sm font-bold font-mono text-rose-300">{blockRate}%</span>
          </div>
        </div>
      </div>

      {/* Bar Chart: Decision Volumes */}
      <div className="cyber-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-white">Detection Action Counts</h3>
            <span className="text-xs font-mono text-shield-cyan">Enforcement Layer</span>
          </div>
          <p className="text-xs text-cyber-400">
            Aggregate count of responses processed across enforcement decisions.
          </p>
        </div>

        <div className="h-64 my-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#1e293b' }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#1e293b' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                }}
                cursor={{ fill: '#172033' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 rounded-lg bg-cyber-850 border border-cyber-800 flex items-center justify-between text-xs font-mono">
          <span className="text-cyber-400">Average Risk Score:</span>
          <span className="text-shield-cyan font-bold">{data.average_risk_score} / 100</span>
        </div>
      </div>
    </div>
  );
};
