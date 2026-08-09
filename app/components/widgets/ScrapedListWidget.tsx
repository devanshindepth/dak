'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ScrapedListWidgetConfig } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

interface ScrapedItem {
  rank?: number;
  label: string;
  value?: string;
  sublabel?: string;
  url?: string;
}

interface ScrapeResult {
  items: ScrapedItem[];
  source: string;
  fetchedAt: string;
}

// Simple refresh icon
function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={`w-3 h-3 ${spinning ? 'animate-spin' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

export default function ScrapedListWidget({ config }: { config: ScrapedListWidgetConfig }) {
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: config.url,
          prompt: config.prompt,
          limit: config.limit ?? 5,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch data');
      } else {
        setResult(data);
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [config.url, config.prompt, config.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const domain = (() => {
    try {
      return new URL(config.url).hostname.replace(/^www\./, '');
    } catch {
      return config.url;
    }
  })();

  const valueLabel = config.valueLabel || 'Score';

  return (
    <WidgetShell
      title={config.title || config.prompt}
      titleUrl={config.url}
      hideHeader={config.hideHeader}
      error={!!error}
      loading={loading}
      headerAction={
        <button
          onClick={fetchData}
          disabled={loading}
          className="text-tertiary hover:text-primary transition-colors disabled:opacity-40 cursor-pointer"
          title="Refresh"
          aria-label="Refresh scraped data"
        >
          <RefreshIcon spinning={loading} />
        </button>
      }
    >
      {error ? (
        <div className="px-3 py-4 text-xs text-negative">{error}</div>
      ) : result ? (
        <div className="flex flex-col">
          {result.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-bg-subtle)] transition-colors group"
            >
              {/* Rank badge */}
              <span
                className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                style={{
                  backgroundColor:
                    idx === 0
                      ? 'var(--color-primary)'
                      : 'var(--color-bg-subtle)',
                  color:
                    idx === 0
                      ? 'var(--color-bg-page)'
                      : 'var(--color-text-tertiary)',
                }}
              >
                {item.rank ?? idx + 1}
              </span>

              {/* Label + sublabel */}
              <div className="flex flex-col min-w-0 flex-1">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-primary truncate hover:underline"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-xs font-medium text-primary truncate">
                    {item.label}
                  </span>
                )}
                {item.sublabel && (
                  <span className="text-[10px] text-tertiary truncate">
                    {item.sublabel}
                  </span>
                )}
              </div>

              {/* Value */}
              {item.value && (
                <span className="flex-shrink-0 text-xs font-mono font-semibold text-secondary tabular-nums">
                  {item.value}
                </span>
              )}
            </div>
          ))}

          {/* Footer: source + timestamp */}
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            <a
              href={config.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-tertiary hover:text-secondary truncate"
            >
              {domain}
            </a>
            <span className="text-[10px] text-tertiary flex-shrink-0">
              {new Date(result.fetchedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      ) : null}
    </WidgetShell>
  );
}
