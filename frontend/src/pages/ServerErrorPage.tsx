import React from 'react';
import { RefreshCw, ServerCrash, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServerErrorPageProps {
  message?: string;
  onRetry?: () => void;
}

export const ServerErrorPage: React.FC<ServerErrorPageProps> = ({
  message = 'GenShield backend service is currently unreachable or undergoing maintenance.',
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-cyber-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400 mb-6 shadow-glow-crimson">
        <ServerCrash className="w-8 h-8" />
      </div>

      <span className="text-sm font-mono text-rose-400 uppercase tracking-widest mb-2 font-bold">
        Service Status 503 / 500
      </span>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
        Backend Service Interruption
      </h1>
      <p className="text-xs sm:text-sm text-cyber-400 max-w-md mb-8 leading-relaxed">
        {message}
      </p>

      <div className="flex items-center gap-3">
        {onRetry ? (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-shield-cyan hover:bg-shield-cyanDark text-cyber-950 shadow-glow-cyan transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        ) : (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-shield-cyan hover:bg-shield-cyanDark text-cyber-950 shadow-glow-cyan transition"
          >
            <Home className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        )}
      </div>
    </div>
  );
};
