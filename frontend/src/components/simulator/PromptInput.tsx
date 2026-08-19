import React from 'react';
import { Terminal, Trash2, Send } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isLoading: boolean;
  phaseLabel?: string;
  disabled?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  onChange,
  onSubmit,
  onClear,
  isLoading,
  phaseLabel,
  disabled = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (prompt.trim() && !isLoading && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className="cyber-card p-5">
      <div className="flex items-center justify-between pb-3 border-b border-cyber-800/80 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-shield-cyan" />
          <h3 className="text-sm font-semibold text-white">AI Agent Prompt Sandbox</h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-cyber-400">
            {prompt.length} characters
          </span>
          {prompt && (
            <button
              type="button"
              onClick={onClear}
              disabled={isLoading}
              className="text-xs font-mono text-cyber-400 hover:text-rose-400 flex items-center gap-1 transition disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          rows={4}
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="Enter a prompt for the AI agent (e.g., 'Prepare a summary of the upcoming product roadmap.')..."
          className="w-full bg-cyber-950/90 border border-cyber-750 focus:border-shield-cyan/80 focus:ring-1 focus:ring-shield-cyan/50 rounded-xl p-4 text-sm text-cyber-100 placeholder-cyber-500 font-mono resize-none transition-all"
        />

        {/* Shortcut hint */}
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-[11px] font-mono text-cyber-500">
            Press <kbd className="px-1.5 py-0.5 rounded bg-cyber-800 text-cyber-300 border border-cyber-700">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-cyber-800 text-cyber-300 border border-cyber-700">Enter</kbd> to execute
          </span>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!prompt.trim() || isLoading || disabled}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-shield-cyan hover:bg-shield-cyanDark text-cyber-950 shadow-glow-cyan transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-cyber-950 border-t-transparent rounded-full animate-spin" />
                <span>{phaseLabel || 'Processing...'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Generate & Inspect</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
