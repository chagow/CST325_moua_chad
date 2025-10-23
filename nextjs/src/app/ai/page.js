'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { wrapFetch } from '../../lib/perf';
import ThemeToggle from '../theme/ThemeToggle';

const STORAGE_KEY = 'cst325:m6:settings:v1';
const AUTOSAVE_MS = 500;

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

export default function AIPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const saveTimer = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const settings = loadSettings();
    setText(settings.draft ?? '');
    setStatusMsg('Settings loaded.');
  }, []);

  useEffect(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    saveTimer.current = setTimeout(() => {
      const doSave = () => {
        const settings = loadSettings();
        settings.draft = text;
        const ok = saveSettings(settings);
        setStatusMsg(ok ? 'Draft saved' : 'Failed to save draft');
        saveTimer.current = null;
      };
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => doSave(), { timeout: 1000 });
      } else {
        doSave();
      }
    }, AUTOSAVE_MS);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [text]);

  const clearDraft = useCallback(() => {
    setText('');
    const settings = loadSettings();
    settings.draft = '';
    const ok = saveSettings(settings);
    setStatusMsg(ok ? 'Draft cleared' : 'Failed to clear draft');
  }, []);

  const sendToAI = useCallback(async (e) => {
    e?.preventDefault();
    setLoading(true);
    setStatusMsg('Sending request...');
    setResult(null);
    setError(null);

    try {
      const data = await wrapFetch('ai-fetch', async () => {
        const res = await fetch('http://localhost:8000/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || `Server ${res.status}`);
        }
        return res.json();
      });

      unstable_batchedUpdates(() => {
        setResult(data);
        setStatusMsg(data.stub ? 'Returned stub response (AI key not set).' : 'AI returned a live response.');
        setError(null);
      });
    } catch (err) {
      unstable_batchedUpdates(() => {
        setError(err.message || 'Unknown error');
        setStatusMsg('Request failed.');
      });
    } finally {
      setLoading(false);
    }
  }, [text]);

  const ResultSkeleton = () => (
    <div aria-hidden style={{ padding: 12 }}>
      <div style={{ height: 16, width: '40%', background: '#e6e6e6', marginBottom: 8, borderRadius: 4 }} />
      <div style={{ height: 10, width: '100%', background: '#eee', marginBottom: 6, borderRadius: 4 }} />
      <div style={{ height: 10, width: '90%', background: '#eee', marginBottom: 6, borderRadius: 4 }} />
    </div>
  );

  return (
    <main style={{ padding: 20, maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>AI Inference</h1>
        <div><ThemeToggle /></div>
      </div>

      <form onSubmit={sendToAI} style={{ marginBottom: 16 }}>
        <label htmlFor="ai-text">Draft / Input text</label>
        <br />
        <textarea
          id="ai-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          style={{ width: '100%', marginTop: 8 }}
          placeholder="Enter text to send to the AI endpoint..."
        />
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading || !text.trim()}>
            {loading ? 'Sending…' : 'Send'}
          </button>
          <button type="button" onClick={clearDraft} style={{ marginLeft: 8 }}>
            Clear draft
          </button>
        </div>
      </form>

      <div aria-live="polite" style={{ minHeight: 24 }}>
        {statusMsg && <strong>Status:</strong>} {statusMsg}
      </div>

      {error && <div style={{ color: 'red', marginTop: 8 }}><strong>Error:</strong> {error}</div>}

      {loading && !result && <section><ResultSkeleton /></section>}

      {result && (
        <section style={{ marginTop: 12, padding: 12, border: '1px solid #ddd' }}>
          <div><strong>Input:</strong> {result.input}</div>
          <div style={{ marginTop: 8 }}>
            <strong>Output:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{String(result.output)}</pre>
          </div>
          <div style={{ marginTop: 8 }}>
            <strong>Stub:</strong> {result.stub ? 'yes' : 'no'}
          </div>
          {result.message && <div style={{ marginTop: 6 }}><em>{result.message}</em></div>}
        </section>
      )}
    </main>
  );
}