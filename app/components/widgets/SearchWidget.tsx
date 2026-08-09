'use client';

import React, { useState, useRef } from 'react';
import { SearchWidgetConfig } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

export default function SearchWidget({ config }: { config: SearchWidgetConfig }) {
  const [query, setQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<{
    query: string;
    summary: string;
    keyTakeaways?: string[];
    sources?: { title: string; url: string }[];
    searchLinks?: { name: string; url: string }[];
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoadingAi(true);
    setAiAnswer(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();

      if (res.ok && !data.error) {
        setAiAnswer(data);
      } else {
        setErrorMsg(data.error || 'AI Search encountered an error. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Failed to reach AI search server.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCopy = () => {
    if (!aiAnswer) return;
    navigator.clipboard.writeText(aiAnswer.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <WidgetShell
      title={config.title || 'AI Search'}
      titleUrl={config.titleUrl}
      hideHeader={config.hideHeader}
    >
      <div className="flex flex-col gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 relative">
          <div className="search-input-wrapper flex-1 relative">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              ref={inputRef}
              type="text"
              id="ai-search-input"
              className="search-input pr-8 font-mono text-xs"
              placeholder="Ask AI Search... (Press '/' to focus)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus={config.autofocus}
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tertiary hover:text-primary cursor-pointer"
                title="Clear input"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loadingAi || !query.trim()}
            className="px-3 py-2 text-xs font-semibold rounded-md border border-subtle transition-colors cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-bg-subtle)',
              color: 'var(--color-text-primary)',
            }}
          >
            {loadingAi ? 'Searching...' : 'AI Search'}
          </button>
        </form>

        {loadingAi && (
          <div
            className="p-3 rounded-md text-xs flex items-center gap-2 animate-pulse"
            style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span>Consulting AI Search...</span>
          </div>
        )}

        {errorMsg && (
          <div
            className="p-3 rounded-md text-xs flex items-center justify-between"
            style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-negative)',
            }}
          >
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="hover:opacity-80 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {aiAnswer && (
          <div
            className="p-4 rounded-md text-xs flex flex-col gap-3 animate-fade-in"
            style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <div
              className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider pb-2"
              style={{
                borderBottom: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-tertiary)',
              }}
            >
              <div className="flex items-center gap-1.5">
                <span>AI Search Answer</span>
                <span className="normal-case font-mono text-[10px] text-tertiary">
                  (&quot;{aiAnswer.query}&quot;)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="hover:text-primary font-mono text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg-widget)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => setAiAnswer(null)}
                  className="hover:text-primary font-bold text-sm px-1 cursor-pointer"
                  title="Close result"
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              className="leading-relaxed text-xs whitespace-pre-line"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {aiAnswer.summary}
            </div>

            {aiAnswer.keyTakeaways && aiAnswer.keyTakeaways.length > 0 && (
              <ul className="flex flex-col gap-1 list-disc pl-4 text-xs text-secondary">
                {aiAnswer.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx}>{takeaway}</li>
                ))}
              </ul>
            )}

            {aiAnswer.sources && aiAnswer.sources.length > 0 && (
              <div
                className="pt-2 flex flex-col gap-1 text-[11px]"
                style={{ borderTop: '1px solid var(--color-border-subtle)' }}
              >
                <span className="font-bold text-tertiary">Reference Sources:</span>
                {aiAnswer.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline font-medium flex items-center gap-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <span>↗</span> {src.title}
                  </a>
                ))}
              </div>
            )}

            {aiAnswer.searchLinks && aiAnswer.searchLinks.length > 0 && (
              <div
                className="flex items-center gap-2 pt-2 flex-wrap"
                style={{ borderTop: '1px solid var(--color-border-subtle)' }}
              >
                <span className="text-[10px] font-bold text-tertiary">Quick Links:</span>
                {aiAnswer.searchLinks.map((sl, idx) => (
                  <a
                    key={idx}
                    href={sl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold px-2 py-0.5 rounded hover:underline"
                    style={{
                      backgroundColor: 'var(--color-bg-widget)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {sl.name} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
