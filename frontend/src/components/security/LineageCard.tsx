import React from 'react';
import { FileKey2, Tag, Shield, FileText } from 'lucide-react';
import { SensitivityBadge } from '../common/SensitivityBadge';
import { SensitivityLevel } from '../../types/detection';

interface LineageCardProps {
  matchedSource?: string | null;
  lineageTag?: string | null;
  sensitivity?: SensitivityLevel | null;
}

export const LineageCard: React.FC<LineageCardProps> = ({
  matchedSource,
  lineageTag,
  sensitivity,
}) => {
  return (
    <div className="p-4 rounded-xl bg-cyber-850/80 border border-cyber-800">
      <div className="flex items-center justify-between pb-2.5 border-b border-cyber-800/80 mb-3">
        <div className="flex items-center gap-2">
          <FileKey2 className="w-4 h-4 text-shield-cyan" />
          <span className="text-xs font-mono font-semibold uppercase text-cyber-300">
            Data Lineage & Provenance
          </span>
        </div>
        <SensitivityBadge sensitivity={sensitivity} />
      </div>

      <div className="space-y-2.5 text-xs font-mono">
        <div className="flex items-center justify-between p-2 rounded-lg bg-cyber-900 border border-cyber-800">
          <span className="text-cyber-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-cyber-500" />
            Matched Document:
          </span>
          <span className="text-white font-bold truncate max-w-[200px]" title={matchedSource || 'None'}>
            {matchedSource || 'None (Unmatched)'}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-cyber-900 border border-cyber-800">
          <span className="text-cyber-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-shield-cyan" />
            Lineage Tag:
          </span>
          <span className="text-shield-cyan font-bold">
            {lineageTag || 'None'}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-cyber-900 border border-cyber-800">
          <span className="text-cyber-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyber-500" />
            Lineage Verification:
          </span>
          <span className={lineageTag ? 'text-emerald-400 font-semibold' : 'text-cyber-500'}>
            {lineageTag ? 'TRACEABLE' : 'UNREFERENCED'}
          </span>
        </div>
      </div>
    </div>
  );
};
