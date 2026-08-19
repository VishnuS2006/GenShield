import React, { useState } from 'react';
import { HistoryRecord } from '../../types/history';
import { DecisionBadge } from '../common/DecisionBadge';
import { formatDate } from '../../utils/formatters';
import { X, Copy, Check, Hash, Calendar, Terminal, Bot } from 'lucide-react';

interface AuditDetailsModalProps {
  record: HistoryRecord | null;
  onClose: () => void;
}

export const AuditDetailsModal: React.FC<AuditDetailsModalProps> = ({ record, onClose }) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  if (!record) return null;

  const copyText = (text: string, isPrompt: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPrompt) {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="cyber-card w-full max-w-2xl max-h-[90vh] flex flex-col bg-cyber-900 border-cyber-700 shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-cyber-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DecisionBadge decision={record.decision} size="md" />
            <div>
              <h3 className="text-base font-bold text-white">Audit Log Inspection</h3>
              <p className="text-xs text-cyber-400 font-mono flex items-center gap-1.5 mt-0.5">
                <Hash className="w-3 h-3 text-cyber-500" />
                {record.request_id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cyber-400 hover:text-white hover:bg-cyber-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-cyber-850 border border-cyber-800">
              <span className="text-[10px] font-mono uppercase text-cyber-400 block mb-1">
                Risk Score
              </span>
              <span
                className={`text-lg font-bold font-mono ${
                  record.risk_score >= 90
                    ? 'text-rose-400'
                    : record.risk_score >= 60
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {record.risk_score} / 100
              </span>
            </div>

            <div className="p-3 rounded-lg bg-cyber-850 border border-cyber-800">
              <span className="text-[10px] font-mono uppercase text-cyber-400 block mb-1">
                Decision Action
              </span>
              <span className="text-sm font-bold font-mono text-white">{record.decision}</span>
            </div>

            <div className="p-3 rounded-lg bg-cyber-850 border border-cyber-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-cyber-400 block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyber-500" />
                Logged At
              </span>
              <span className="text-xs font-mono text-cyber-200">{formatDate(record.created_at)}</span>
            </div>
          </div>

          {/* Prompt Section */}
          <div className="rounded-xl bg-cyber-850/80 border border-cyber-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-cyber-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-shield-cyan" />
                Submitted User Prompt
              </span>
              <button
                onClick={() => copyText(record.prompt, true)}
                className="text-cyber-400 hover:text-white flex items-center gap-1 text-[11px] font-mono"
              >
                {copiedPrompt ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copiedPrompt ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="font-mono text-cyber-100 bg-cyber-950 p-3 rounded-lg border border-cyber-800 leading-relaxed break-words whitespace-pre-wrap">
              {record.prompt}
            </p>
          </div>

          {/* Generated Response Section */}
          <div className="rounded-xl bg-cyber-850/80 border border-cyber-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-cyber-300 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-shield-cyan" />
                LLM Generated Output Inspected
              </span>
              <button
                onClick={() => copyText(record.generated_response, false)}
                className="text-cyber-400 hover:text-white flex items-center gap-1 text-[11px] font-mono"
              >
                {copiedResponse ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copiedResponse ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="font-mono text-cyber-100 bg-cyber-950 p-3 rounded-lg border border-cyber-800 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
              {record.generated_response}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyber-800 bg-cyber-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-cyber-800 hover:bg-cyber-750 text-white border border-cyber-700 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
