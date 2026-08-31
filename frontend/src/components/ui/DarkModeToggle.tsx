'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DarkModeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-9 h-9 ${className}`} />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
      aria-label={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl text-white/90 hover:text-white bg-white/10 hover:bg-white/20 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-amber-400 border border-white/10 dark:border-slate-700 backdrop-blur-sm transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
    >
      <span className="sr-only">Toggle theme</span>
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 rotate-0 scale-100 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-blue-200 transition-transform duration-300 rotate-0 scale-100 hover:-rotate-12" />
      )}
    </button>
  );
}
