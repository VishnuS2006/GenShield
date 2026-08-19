import React from 'react';
import { ProtectedDocumentRead } from '../../types/documents';
import { SensitivityBadge } from '../common/SensitivityBadge';
import { FactList } from './FactList';
import { formatDate } from '../../utils/formatters';
import { X, FileKey2, Building2, Tag, Calendar, FileText, ShieldAlert } from 'lucide-react';

interface DocumentDetailsModalProps {
  document: ProtectedDocumentRead | null;
  onClose: () => void;
  onEdit?: (doc: ProtectedDocumentRead) => void;
}

export const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({
  document,
  onClose,
  onEdit,
}) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="cyber-card w-full max-w-2xl max-h-[90vh] flex flex-col bg-cyber-900 border-cyber-700 shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-cyber-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-shield-cyan/10 border border-shield-cyan/30 text-shield-cyan flex-shrink-0">
              <FileKey2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate">{document.title}</h3>
                <SensitivityBadge sensitivity={document.sensitivity} />
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-cyber-400 mt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-cyber-500" />
                  {document.department}
                </span>
                <span className="flex items-center gap-1 text-shield-cyan">
                  <Tag className="w-3 h-3" />
                  {document.lineage_tag}
                </span>
              </div>
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
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Metadata Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-cyber-850 border border-cyber-800">
              <span className="text-[10px] font-mono uppercase text-cyber-400 block mb-1">
                Lineage Identifier
              </span>
              <span className="text-xs font-bold font-mono text-shield-cyan">
                {document.lineage_tag}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-cyber-850 border border-cyber-800">
              <span className="text-[10px] font-mono uppercase text-cyber-400 block mb-1">
                Department
              </span>
              <span className="text-xs font-semibold font-mono text-white">
                {document.department}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-cyber-850 border border-cyber-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-cyber-400 block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyber-500" />
                Created Date
              </span>
              <span className="text-xs font-mono text-cyber-200">
                {formatDate(document.created_at)}
              </span>
            </div>
          </div>

          {/* Document Content */}
          <div className="rounded-xl bg-cyber-850/80 border border-cyber-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-shield-cyan" />
              <span className="font-mono text-xs font-semibold text-cyber-200">
                Protected Document Content
              </span>
            </div>
            <div className="p-4 rounded-lg bg-cyber-950 border border-cyber-800 font-mono text-xs text-cyber-100 leading-relaxed whitespace-pre-wrap">
              {document.content}
            </div>
          </div>

          {/* Granular Facts Vault */}
          <div className="rounded-xl bg-cyber-850/80 border border-cyber-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs font-semibold text-cyber-200">
                  Extracted Protected Facts ({document.facts?.length || 0})
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyber-400">
                Used for semantic & entity overlap detection
              </span>
            </div>

            <FactList facts={document.facts || []} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyber-800 bg-cyber-950/40 flex items-center justify-between">
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(document);
              }}
              className="px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-cyber-800 hover:bg-cyber-750 text-shield-cyan border border-cyber-700 transition"
            >
              Edit Document
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-cyber-800 hover:bg-cyber-750 text-white border border-cyber-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
