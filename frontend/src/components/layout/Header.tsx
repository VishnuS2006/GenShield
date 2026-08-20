import React, { useState, useEffect } from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { checkHealth } from '../../services/api';
import { ThemeToggle } from '../common/ThemeToggle';

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
    <header className="sticky top-0 z-20 border-b border-cyber-800 bg-cyber-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="rounded-lg p-2 text-cyber-400 hover:bg-cyber-800 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-shield-cyan" />
            <span className="truncate text-xs font-medium text-cyber-200 sm:text-sm">
              GenShield Enterprise AI Security Platform
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-cyber-750 bg-cyber-850 px-3 py-1 text-xs font-mono sm:flex">
            <span
              className={`h-2 w-2 rounded-full ${
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
          <ThemeToggle floating={false} />
        </div>
      </div>
    </header>
  );
};
