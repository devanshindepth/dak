'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SearchWidgetConfig, SearchEngine } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

const DEFAULT_ENGINES: SearchEngine[] = [
  { name: 'AI Search', url: 'ai', prefix: 'ai' },
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={QUERY}', prefix: 'd' },
  { name: 'GitHub', url: 'https://github.com/search?q={QUERY}', prefix: 'gh' },
  { name: 'YouTube', url: 'https://www.youtube.com/results?search_query={QUERY}', prefix: 'yt' },
  { name: 'Reddit', url: 'https://www.reddit.com/search/?q={QUERY}', prefix: 'r' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com/search?q={QUERY}', prefix: 'so' },
];

export default function SearchWidget({ config }: { config: SearchWidgetConfig }) {
  const engines = config.engines && config.engines.length > 0 ? config.engines : DEFAULT_ENGINES;
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(engines[0]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let targetEngine = selectedEngine;
    let searchQuery = query;

    // Check for prefix shortcuts (e.g. 'gh:react', 'yt:lofi', 'ai:quantum')
    const parts = query.split(':');
    if (parts.length > 1) {
      const prefix = parts[0].trim().toLowerCase();
      const matched = engines.find((eng) => eng.prefix === prefix);
      if (matched) {
        targetEngine = matched;
        searchQuery = parts.slice(1).join(':').trim();
      }
    }

    if (targetEngine.url === 'ai' || targetEngine.name === 'AI Search') {
      setLoadingAi(true);
      setAiAnswer(null);
      setErrorMsg(null);
      try {
        const res = await fetch('/api/ai-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiAnswer(data);
        } else {
          setErrorMsg('AI search service encountered an error. Please try again.');
        }
      } catch {
        setErrorMsg('Network error. Opening DuckDuckGo search...');
        window.open(`https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`, '_blank');
      } finally {
        setLoadingAi(false);
      }
    } else {
      const searchUrl = targetEngine.url.replace('{QUERY}', encodeURIComponent(searchQuery));
      window.open(searchUrl, '_blank');
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
      title={config.title || 'AI & Web Search'}
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
              className="search-input pr-8"
              placeholder={`Search with ${selectedEngine.name}... (Press '/' to focus)`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus={config.autofocus}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tertiary hover:text-primary"
                title="Clear input"
              >
                ✕
              </button>
            )}
          </div>

          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              type="button"
              className="search-engine-btn font-semibold flex items-center gap-1 text-xs px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              onClick={() => setIsOpen(!isOpen)}
            >
              <span>{selectedEngine.name}</span>
              <span className="text-[10px] text-tertiary">▼</span>
            </button>

            {isOpen && (
              <div
                className="absolute right-0 top-full mt-1 min-w-[170px] rounded-md shadow-lg z-50 py-1"
                style={{
                  backgroundColor: 'var(--color-bg-widget)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {engines.map((eng) => (
                  <button
                    key={eng.name}
                    type="button"
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors hover:bg-[var(--color-bg-widget-hover)]"
                    style={{
                      color:
                        selectedEngine.name === eng.name
                          ? 'var(--color-text-primary)'
                          : 'var(--color-text-secondary)',
                      fontWeight: selectedEngine.name === eng.name ? 600 : 400,
                    }}
                    onClick={() => {
                      setSelectedEngine(eng);
                      setIsOpen(false);
                    }}
                  >
                    <span>{eng.name}</span>
                    {eng.prefix && (
                      <span
                        className="font-mono text-[10px] px-1 py-0.5 rounded"
                        style={{
                          backgroundColor: 'var(--color-bg-subtle)',
                          color: 'var(--color-text-tertiary)',
                        }}
                      >
                        {eng.prefix}:
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
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
            <span>Generating AI Intelligence summary...</span>
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
            <button onClick={() => setErrorMsg(null)} className="hover:opacity-80">
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
                <span>AI Search Result</span>
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
              className="leading-relaxed text-xs"
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
                <span className="font-bold text-tertiary">Source Reference:</span>
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
                <span className="text-[10px] font-bold text-tertiary">Search Across:</span>
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
