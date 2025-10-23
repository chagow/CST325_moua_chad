'use client';

import React, { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

function ThemeToggleInner({ className, label }) {
  const ctx = useContext(ThemeContext);
  if (!ctx) return null;
  const { theme, toggleTheme } = ctx;
  return (
    <button onClick={toggleTheme} aria-pressed={theme === 'dark'} className={className} title="Toggle theme">
      {label ?? `Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`}
    </button>
  );
}

export default React.memo(ThemeToggleInner);