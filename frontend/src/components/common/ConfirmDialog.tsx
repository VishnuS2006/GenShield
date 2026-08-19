import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="cyber-card w-full max-w-md p-6 bg-cyber-900 border-cyber-700 shadow-2xl relative"
        role="dialog"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cyber-400 hover:text-cyber-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDangerous
                ? 'bg-rose-950/80 border border-rose-800 text-rose-400'
                : 'bg-amber-950/80 border border-amber-800 text-amber-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-semibold text-cyber-100">{title}</h3>
            <p className="text-xs sm:text-sm text-cyber-300 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-cyber-300 hover:text-cyber-100 bg-cyber-800 hover:bg-cyber-750 border border-cyber-700 rounded-lg transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition text-white disabled:opacity-50 flex items-center gap-2 ${
              isDangerous
                ? 'bg-rose-600 hover:bg-rose-700 shadow-glow-crimson'
                : 'bg-shield-cyan hover:bg-shield-cyanDark text-cyber-950 font-semibold shadow-glow-cyan'
            }`}
          >
            {isLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
