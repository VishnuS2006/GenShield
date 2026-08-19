import React, { useState, useEffect } from 'react';
import {
  ProtectedDocumentCreate,
  ProtectedDocumentRead,
  ProtectedDocumentUpdate,
  ProtectedFactCreate,
} from '../../types/documents';
import { SensitivityLevel } from '../../types/detection';
import { FactList } from './FactList';
import { X, Plus, FileKey2 } from 'lucide-react';

interface DocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProtectedDocumentCreate | ProtectedDocumentUpdate) => Promise<void>;
  documentToEdit?: ProtectedDocumentRead | null;
  isLoading?: boolean;
}

export const DocumentFormModal: React.FC<DocumentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  documentToEdit,
  isLoading = false,
}) => {
  const isEditing = !!documentToEdit;

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('HIGH');
  const [lineageTag, setLineageTag] = useState('');
  const [content, setContent] = useState('');
  const [facts, setFacts] = useState<ProtectedFactCreate[]>([]);

  // New fact input state
  const [newFactType, setNewFactType] = useState('');
  const [newFactValue, setNewFactValue] = useState('');
  const [newFactImportance, setNewFactImportance] = useState<number>(3);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (documentToEdit) {
      setTitle(documentToEdit.title);
      setDepartment(documentToEdit.department);
      setSensitivity(documentToEdit.sensitivity);
      setLineageTag(documentToEdit.lineage_tag);
      setContent(documentToEdit.content);
      setFacts(
        documentToEdit.facts?.map((f) => ({
          fact_type: f.fact_type,
          fact_value: f.fact_value,
          importance: f.importance,
        })) || []
      );
    } else {
      setTitle('');
      setDepartment('');
      setSensitivity('HIGH');
      setLineageTag('CONF-');
      setContent('');
      setFacts([]);
    }
    setFormError(null);
  }, [documentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddFact = () => {
    if (!newFactType.trim() || !newFactValue.trim()) return;
    setFacts((prev) => [
      ...prev,
      {
        fact_type: newFactType.trim(),
        fact_value: newFactValue.trim(),
        importance: Number(newFactImportance),
      },
    ]);
    setNewFactType('');
    setNewFactValue('');
    setNewFactImportance(3);
  };

  const handleRemoveFact = (index: number) => {
    setFacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !department.trim() || !lineageTag.trim() || !content.trim()) {
      setFormError('Please fill out all required document fields.');
      return;
    }

    try {
      if (isEditing) {
        await onSubmit({
          title: title.trim(),
          department: department.trim(),
          sensitivity,
          lineage_tag: lineageTag.trim(),
          content: content.trim(),
          facts,
        });
      } else {
        await onSubmit({
          title: title.trim(),
          department: department.trim(),
          sensitivity,
          lineage_tag: lineageTag.trim(),
          content: content.trim(),
          facts,
        });
      }
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="cyber-card w-full max-w-2xl max-h-[90vh] flex flex-col bg-cyber-900 border-cyber-700 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-cyber-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-shield-cyan/10 border border-shield-cyan/30 text-shield-cyan">
              <FileKey2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? 'Edit Protected Document' : 'Register New Confidential Document'}
              </h3>
              <p className="text-xs text-cyber-400">
                Add to GenShield vector embeddings vault for real-time exfiltration inspection
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            {/* Title & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-cyber-300 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Orion Product Roadmap"
                  className="w-full bg-cyber-950 border border-cyber-750 focus:border-shield-cyan/80 rounded-lg p-2.5 text-cyber-100 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-cyber-300 mb-1">Department *</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Product, Finance, Security"
                  className="w-full bg-cyber-950 border border-cyber-750 focus:border-shield-cyan/80 rounded-lg p-2.5 text-cyber-100 text-xs font-mono"
                />
              </div>
            </div>

            {/* Sensitivity & Lineage Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-cyber-300 mb-1">Sensitivity Classification *</label>
                <select
                  value={sensitivity}
                  onChange={(e) => setSensitivity(e.target.value as SensitivityLevel)}
                  className="w-full bg-cyber-950 border border-cyber-750 focus:border-shield-cyan/80 rounded-lg p-2.5 text-cyber-100 text-xs font-mono"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-cyber-300 mb-1">Lineage Tag *</label>
                <input
                  type="text"
                  required
                  value={lineageTag}
                  onChange={(e) => setLineageTag(e.target.value)}
                  placeholder="e.g. CONF-PRODUCT-001"
                  className="w-full bg-cyber-950 border border-cyber-750 focus:border-shield-cyan/80 rounded-lg p-2.5 text-cyber-100 text-xs font-mono"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block font-mono text-cyber-300 mb-1">Confidential Document Content *</label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter confidential synthetic document content..."
                className="w-full bg-cyber-950 border border-cyber-750 focus:border-shield-cyan/80 rounded-lg p-3 text-cyber-100 text-xs font-mono resize-none"
              />
            </div>

            {/* Facts Section */}
            <div className="p-4 rounded-xl bg-cyber-850/80 border border-cyber-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-cyber-200">
                  Granular Protected Facts ({facts.length})
                </span>
                <span className="text-[10px] font-mono text-cyber-400">
                  Key entities, dates, revenue numbers
                </span>
              </div>

              {/* Add Fact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-cyber-950 p-2.5 rounded-lg border border-cyber-800">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={newFactType}
                    onChange={(e) => setNewFactType(e.target.value)}
                    placeholder="Type (e.g. revenue)"
                    className="w-full bg-cyber-900 border border-cyber-750 rounded p-1.5 text-xs text-cyber-100 font-mono"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={newFactValue}
                    onChange={(e) => setNewFactValue(e.target.value)}
                    placeholder="Value (e.g. $84.5M)"
                    className="w-full bg-cyber-900 border border-cyber-750 rounded p-1.5 text-xs text-cyber-100 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <select
                    value={newFactImportance}
                    onChange={(e) => setNewFactImportance(Number(e.target.value))}
                    className="w-full bg-cyber-900 border border-cyber-750 rounded p-1.5 text-xs text-cyber-100 font-mono"
                  >
                    <option value={1}>1 - Low</option>
                    <option value={2}>2 - Med-Low</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - High</option>
                    <option value={5}>5 - Critical</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddFact}
                    className="w-full h-full py-1.5 px-2 bg-shield-cyan/20 hover:bg-shield-cyan/30 text-shield-cyan border border-shield-cyan/40 rounded text-xs font-mono font-semibold transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>

              {/* Facts List */}
              <FactList facts={facts} onDeleteFact={handleRemoveFact} editable={true} />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-cyber-800 bg-cyber-950/40 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-cyber-800 hover:bg-cyber-750 text-cyber-300 border border-cyber-700 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg text-xs font-mono font-semibold bg-shield-cyan hover:bg-shield-cyanDark text-cyber-950 shadow-glow-cyan transition flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading && <span className="w-3.5 h-3.5 border-2 border-cyber-950 border-t-transparent rounded-full animate-spin" />}
              <span>{isEditing ? 'Save Changes' : 'Register Document'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
