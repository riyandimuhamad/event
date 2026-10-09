'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('eventops_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('eventops_theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle tema terang/gelap"
      className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted border border-border transition-all duration-200"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-600" />
      )}
    </button>
  );
}
