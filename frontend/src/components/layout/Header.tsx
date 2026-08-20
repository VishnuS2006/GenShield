import React, { useState, useEffect } from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
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
    <header className="h-16 bg-cyber-900/80 backdrop-blur-md border-b border-cyber-800 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-cyber-400 hover:text-white hover:bg-cyber-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-shield-cyan" />
          <span className="text-xs sm:text-sm font-medium text-cyber-200">
            GenShield Enterprise AI Security Platform
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Security Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-850 border border-cyber-750 text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isHealthy === true
                ? 'bg-emerald-400 animate-pulse'
                : isHealthy === false
                ? 'bg-rose-400'
                : 'bg-amber-400'
            }`}
          />
          <span className="text-cyber-300">
            {isHealthy === true ? 'System Protected' : isHealthy === false ? 'Service Disconnected' : 'Verifying...'}
          </span>
        </div>
      </div>
    </header>
  );
};
