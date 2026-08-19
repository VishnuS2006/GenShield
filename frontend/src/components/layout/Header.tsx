import React, { useState, useEffect } from 'react';
import { Menu, Activity, ShieldCheck, Server } from 'lucide-react';
import { checkHealth } from '../../services/api';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const verifyBackend = async () => {
      try {
        const res = await checkHealth();
        if (isMounted) setIsHealthy(res.status === 'healthy');
      } catch {
        if (isMounted) setIsHealthy(false);
      }
    };

    verifyBackend();
    const timer = setInterval(verifyBackend, 30000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <header className="h-16 bg-cyber-900/80 backdrop-blur-md border-b border-cyber-800/80 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-cyber-400 hover:text-white hover:bg-cyber-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-shield-cyan hidden sm:block" />
          <span className="text-xs sm:text-sm font-medium text-cyber-300">
            Semantic Exfiltration Prevention Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Backend Health Status Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyber-850 border border-cyber-800 text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isHealthy === true
                ? 'bg-emerald-400 animate-pulse'
                : isHealthy === false
                ? 'bg-rose-400'
                : 'bg-amber-400'
            }`}
          />
          <span className="text-cyber-300 hidden sm:inline">API Status:</span>
          <span
            className={
              isHealthy === true
                ? 'text-emerald-400 font-semibold'
                : isHealthy === false
                ? 'text-rose-400 font-semibold'
                : 'text-amber-400'
            }
          >
            {isHealthy === true ? 'ONLINE' : isHealthy === false ? 'OFFLINE' : 'CHECKING'}
          </span>
        </div>

        {/* Engine mode pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyber-850 border border-cyber-800 text-xs font-mono text-cyber-300">
          <Server className="w-3.5 h-3.5 text-shield-cyan" />
          <span>LLM Guardian v1.0</span>
        </div>

        {/* Real-time Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-cyber-400 font-mono">
          <Activity className="w-3.5 h-3.5 text-shield-emerald" />
          <span className="hidden lg:inline">Active Policy: STRICT</span>
        </div>
      </div>
    </header>
  );
};
