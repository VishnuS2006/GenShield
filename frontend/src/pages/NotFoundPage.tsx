import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cyber-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyber-900 border border-cyber-750 flex items-center justify-center text-amber-400 mb-6 shadow-glow-amber">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-sm font-mono text-shield-cyan uppercase tracking-widest mb-2 font-bold">
        Error 404
      </span>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
        Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-cyber-400 max-w-md mb-8 leading-relaxed">
        The requested endpoint or security resource does not exist or has been relocated within the GenShield architecture.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/chat"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-shield-cyan hover:bg-shield-cyanDark text-cyber-950 shadow-glow-cyan transition"
        >
          <Home className="w-4 h-4" />
          <span>Return to Chatbot</span>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-cyber-850 hover:bg-cyber-800 text-cyber-300 border border-cyber-750 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
};
