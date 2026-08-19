import React, { useState } from 'react';
import { useDetection } from '../../hooks/useDetection';
import { useDocuments } from '../../hooks/useDocuments';
import { DetectionBreakdown } from './DetectionBreakdown';
import { ErrorMessage } from '../common/ErrorMessage';
import { Scan, Sparkles, Trash2, ArrowRight } from 'lucide-react';

export const DetectionPlayground: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const { detect, result, isLoading, error, reset } = useDetection();
  const { documents } = useDocuments();

  const handleTestSample = (sampleText: string) => {
    setText(sampleText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    await detect({
      generated_response: text,
      document_ids: selectedDocIds,
    });
  };

  const toggleDocSelection = (id: number) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const sampleSnippets = [
    {
      title: 'Direct Exfiltration (Product)',
      text: 'Project Orion targets enterprise customers, launches in October 2026, and is projected to generate $84.5M revenue.',
    },
    {
      title: 'Paraphrased Financial Exfiltration',
      text: 'NovaTech forecasts that Atlas Cloud will hit around $128.4M in FY27 following the Helios merger, expanding operating margins to 31 percent.',
    },
    {
      title: 'Clean Generic Text (Safe)',
      text: 'The quarterly leadership sync discussed general operational improvements and standard software engineering practices across departments.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="cyber-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-cyber-800/80 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-shield-cyan/10 border border-shield-cyan/30 text-shield-cyan">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Standalone Semantic Detection Playground</h3>
              <p className="text-xs text-cyber-400">
                Directly evaluate any arbitrary LLM response against the protected vector vault via POST /api/detect
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {text && (
              <button
                type="button"
                onClick={() => {
                  setText('');
                  reset();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-cyber-400 hover:text-rose-400 bg-cyber-850 hover:bg-cyber-800 border border-cyber-750 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Sample text quick buttons */}
        <div className="mb-4">
          <span className="text-[11px] font-mono uppercase text-cyber-400 block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-shield-cyan" />
            Load Sample Test Cases:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {sampleSnippets.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTestSample(sample.text)}
                className="p-3 rounded-lg text-left bg-cyber-850 hover:bg-cyber-800 border border-cyber-750 hover:border-shield-cyan/40 transition text-xs group"
              >
                <div className="font-semibold text-cyber-200 group-hover:text-shield-cyan mb-1 flex items-center justify-between">
                  <span>{sample.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyber-500 group-hover:text-shield-cyan transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-cyber-400 line-clamp-2">{sample.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-cyber-300 mb-1.5">
              Response Text to Inspect for Exfiltration:
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste generated response text here..."
              disabled={isLoading}
              className="w-full bg-cyber-950 border border-cyber-750 focus:border-shield-cyan/80 focus:ring-1 focus:ring-shield-cyan/50 rounded-xl p-4 text-sm text-cyber-100 placeholder-cyber-500 font-mono resize-none transition"
            />
          </div>

          {/* Optional Document Vault Target Filtering */}
          {documents.length > 0 && (
            <div className="p-3.5 rounded-xl bg-cyber-850/60 border border-cyber-800">
              <span className="text-[11px] font-mono uppercase text-cyber-400 block mb-2">
                Target Protected Documents (Leave empty to scan entire vault):
              </span>
              <div className="flex flex-wrap gap-2">
                {documents.map((doc) => {
                  const isChecked = selectedDocIds.includes(doc.id);
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => toggleDocSelection(doc.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-shield-cyan/20 border-shield-cyan text-white font-semibold'
                          : 'bg-cyber-900 border-cyber-750 text-cyber-400 hover:text-cyber-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-shield-cyan' : 'bg-cyber-600'}`} />
                      {doc.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-shield-cyan hover:bg-shield-cyanDark text-cyber-950 shadow-glow-cyan transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-cyber-950 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning Embeddings & Overlap...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  <span>Analyze Semantic Exfiltration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Result Display */}
      {result && (
        <div className="animate-fadeIn">
          <DetectionBreakdown
            analysis={result.security_analysis}
            title="Standalone Detection Analysis (POST /api/detect)"
          />
        </div>
      )}
    </div>
  );
};
