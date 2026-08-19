import React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'error' | 'warning';
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  onRetry,
  variant = 'error',
  className = '',
}) => {
  const isError = variant === 'error';

  return (
    <div
      className={`rounded-xl p-4 border flex items-start gap-3.5 transition-all ${
        isError
          ? 'bg-rose-950/40 border-rose-800/50 text-rose-200'
          : 'bg-amber-950/40 border-amber-800/50 text-amber-200'
      } ${className}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {isError ? (
          <XCircle className="w-5 h-5 text-rose-400" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {title && <h4 className="text-sm font-semibold mb-1 text-cyber-100">{title}</h4>}
        <p className="text-xs sm:text-sm text-cyber-300 break-words">{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyber-800 hover:bg-cyber-700 text-cyber-100 border border-cyber-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
