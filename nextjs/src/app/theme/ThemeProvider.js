'use client';

import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext(null);

const STORAGE_KEY = 'cst325:m6:settings:v1';

function loadSettings() {
  try {
    if (typeof window === 'undefined') return { theme: 'light', draft: '' };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { theme: 'light', draft: '' };
    return JSON.parse(raw);
  } catch (err) {
    console.error('loadSettings error', err);
    return { theme: 'light', draft: '' };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (err) {
    console.error('saveSettings error', err);
    return false;
  }
}

function applyTheme(th) {
  try {
    const root = document.documentElement;
    const body = document.body;
    if (th === 'dark') {
      root.classList.add('dark');
      root.dataset.theme = 'dark';
      body.classList.add('dark');
      body.dataset.theme = 'dark';
    } else {
      root.classList.remove('dark');
      root.dataset.theme = 'light';
      body.classList.remove('dark');
      body.dataset.theme = 'light';
    }
  } catch (err) {
    console.error('applyTheme error', err);
  }
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const settings = loadSettings();
    const th = settings.theme ?? 'light';
    setTheme(th);
    applyTheme(th);
    setStatus('Theme loaded.');
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    const settings = loadSettings();
    settings.theme = next;
    const ok = saveSettings(settings);
    setStatus(ok ? `Theme saved (${next})` : 'Failed to save theme');
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, status }}>
      <div aria-live="polite" style={{ position: 'absolute', left: -9999, top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
        {status}
      </div>
      {children}
    </ThemeContext.Provider>
  );
}