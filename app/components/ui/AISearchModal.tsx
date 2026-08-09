'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISearchModal({ isOpen, onClose }: AISearchModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    query: string;
    summary: string;
    keyTakeaways?: string[];
    sources?: { title: string; url: string }[];
    searchLinks?: { name: string; url: string }[];
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResult(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();

      if (res.ok && !data.error) {
        setResult(data);
      } else {
        setError(data.error || 'AI Search failed.');
      }
    } catch {
      setError('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-16 p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full p-6 relative rounded-xl shadow-2xl flex flex-col gap-4"
        style={{
          backgroundColor: 'var(--color-bg-widget)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between pb-3"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              AI Search
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-tertiary hover:text-primary transition-colors text-base font-bold px-2 py-0.5 rounded cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              className="w-full px-4 py-2.5 font-mono text-xs rounded-md bg-[var(--color-bg-input)] border border-[var(--color-border)] text-primary outline-none focus:border-[var(--color-text-secondary)]"
              placeholder="Ask AI Search anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2.5 font-semibold text-xs rounded-md bg-[var(--color-text-primary)] text-[var(--color-bg-page)] cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {loading && (
          <div className="p-4 rounded-md text-xs text-secondary animate-pulse border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]">
            Consulting AI Search...
          </div>
        )}

        {error && (
          <div className="p-4 rounded-md text-xs text-negative border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            {error}
          </div>
        )}

        {result && (
          <div className="p-4 rounded-md text-xs flex flex-col gap-3 bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
            <div className="font-bold text-[11px] uppercase tracking-wider text-tertiary pb-2 border-b border-[var(--color-border-subtle)]">
              Answer for &quot;{result.query}&quot;
            </div>

            <div className="leading-relaxed text-secondary whitespace-pre-line">
              {result.summary}
            </div>

            {result.keyTakeaways && result.keyTakeaways.length > 0 && (
              <ul className="flex flex-col gap-1 list-disc pl-4 text-secondary">
                {result.keyTakeaways.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            )}

            {result.sources && result.sources.length > 0 && (
              <div className="pt-2 flex flex-col gap-1 text-[11px] border-t border-[var(--color-border-subtle)]">
                <span className="font-bold text-tertiary">Sources:</span>
                {result.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-primary"
                  >
                    ↗ {src.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
