import React from 'react';
import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  floating?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ floating = true }) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      className={`inline-flex items-center gap-2 rounded-full border border-cyber-750 bg-cyber-900/90 px-3 py-2 text-xs font-mono text-cyber-200 shadow-card backdrop-blur-md transition hover:border-shield-cyan/50 hover:text-shield-cyan ${
        floating ? 'fixed right-4 top-4 z-[60]' : 'relative z-0 shrink-0'
      }`}
    >
      {isLight ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      <span className="hidden sm:inline">{isLight ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  );
};
