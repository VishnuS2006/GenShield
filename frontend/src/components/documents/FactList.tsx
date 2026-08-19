import React from 'react';
import { ProtectedFactRead, ProtectedFactCreate } from '../../types/documents';
import { Star, Trash2 } from 'lucide-react';

interface FactListProps {
  facts: (ProtectedFactRead | ProtectedFactCreate)[];
  onDeleteFact?: (index: number) => void;
  editable?: boolean;
}

export const FactList: React.FC<FactListProps> = ({
  facts,
  onDeleteFact,
  editable = false,
}) => {
  if (!facts || facts.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-cyber-900 border border-cyber-800 text-center text-xs font-mono text-cyber-500">
        No confidential facts configured for this document.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {facts.map((fact, index) => (
        <div
          key={index}
          className="p-3 rounded-lg bg-cyber-900/90 border border-cyber-800 flex items-center justify-between gap-3 text-xs font-mono group hover:border-cyber-700 transition"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="px-2 py-0.5 rounded bg-cyber-800 border border-cyber-700 text-[11px] text-shield-cyan flex-shrink-0">
              {fact.fact_type}
            </span>
            <span className="text-cyber-100 font-semibold truncate" title={fact.fact_value}>
              {fact.fact_value}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Importance Rating Stars */}
            <div className="flex items-center gap-0.5 text-amber-400" title={`Importance: ${fact.importance}/5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < fact.importance
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-cyber-700'
                  }`}
                />
              ))}
            </div>

            {editable && onDeleteFact && (
              <button
                type="button"
                onClick={() => onDeleteFact(index)}
                className="p-1 rounded text-cyber-400 hover:text-rose-400 transition"
                title="Remove Fact"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
