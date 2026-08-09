'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PageConfig, WidgetConfig } from '@/app/types/dashboard';

interface AIDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPage: (page: PageConfig) => void;
}

const SAMPLE_PROMPTS = [
  'Developer hub with Hacker News, LeetCode, Codeforces, and dev framework releases',
  'Market & Financial center with Bitcoin, Nvidia stock, financial news, and clock',
  'Daily productivity workstation with Tasks, Calendar, Weather, and quick Bookmarks',
  'Tech media digest with Ars Technica RSS, tech YouTube videos, and r/selfhosted',
  'Top 5 models from Terminal Bench leaderboard at llm-stats.com/benchmarks/terminal-bench',
];

/** Walk all widgets in the page and return a flat list with their path */
function collectScrapedWidgets(page: PageConfig): Array<{ colIdx: number; wIdx: number; widget: WidgetConfig & { type: 'scraped-list'; url: string; prompt: string } }> {
  const result: Array<{ colIdx: number; wIdx: number; widget: any }> = [];
  page.columns.forEach((col, colIdx) => {
    col.widgets.forEach((w, wIdx) => {
      if (w.type === 'scraped-list') {
        result.push({ colIdx, wIdx, widget: w });
      }
    });
  });
  return result;
}

/** Return a deep clone of the page with scraped-list URL overrides applied */
function applyUrlOverrides(page: PageConfig, overrides: Record<string, string>): PageConfig {
  const clone: PageConfig = JSON.parse(JSON.stringify(page));
  clone.columns.forEach((col, colIdx) => {
    col.widgets.forEach((w, wIdx) => {
      if (w.type === 'scraped-list') {
        const key = `${colIdx}-${wIdx}`;
        if (overrides[key]?.trim()) {
          (w as any).url = overrides[key].trim();
        }
      }
    });
  });
  return clone;
}

export function AIDashboardModal({ isOpen, onClose, onAddPage }: AIDashboardModalProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPage, setGeneratedPage] = useState<PageConfig | null>(null);
  // keyed by "colIdx-wIdx" → corrected URL string
  const [urlOverrides, setUrlOverrides] = useState<Record<string, string>>({});

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    } else {
      setPrompt('');
      setGeneratedPage(null);
      setError(null);
      setUrlOverrides({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setGeneratedPage(null);
    setUrlOverrides({});

    try {
      const res = await fetch('/api/grok/create-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement: prompt.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.page) {
        setGeneratedPage(data.page);
        // Pre-fill overrides with whatever URL the AI suggested
        const scraped = collectScrapedWidgets(data.page);
        const initial: Record<string, string> = {};
        scraped.forEach(({ colIdx, wIdx, widget }) => {
          initial[`${colIdx}-${wIdx}`] = widget.url || '';
        });
        setUrlOverrides(initial);
      } else {
        setError(data.error || 'Failed to generate custom dashboard with AI.');
      }
    } catch {
      setError('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (generatedPage) {
      const final = applyUrlOverrides(generatedPage, urlOverrides);
      onAddPage(final);
      onClose();
    }
  };

  const scrapedWidgets = generatedPage ? collectScrapedWidgets(generatedPage) : [];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full p-6 relative rounded-xl shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-bg-widget)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between pb-3"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              AI Custom Dashboard Section Builder
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

        {/* Prompt form */}
        <form onSubmit={handleGenerate} className="flex flex-col gap-3">
          <label className="text-xs font-medium text-secondary">
            Describe what you want in your custom dashboard section:
          </label>
          <textarea
            ref={textareaRef}
            rows={3}
            className="w-full px-3 py-2 font-mono text-xs rounded-md bg-[var(--color-bg-input)] border border-[var(--color-border)] text-primary outline-none focus:border-[var(--color-text-secondary)] resize-none"
            placeholder="e.g. Top 5 models from Terminal Bench at llm-stats.com/benchmarks/terminal-bench — include the URL when asking for leaderboards or rankings"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] text-tertiary self-center">Presets:</span>
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(sample)}
                className="text-[10px] px-2 py-1 rounded bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-widget-hover)] text-secondary border border-[var(--color-border-subtle)] text-left cursor-pointer"
              >
                {sample.slice(0, 36)}...
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-4 py-2 font-semibold text-xs rounded-md bg-[var(--color-text-primary)] text-[var(--color-bg-page)] cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Generating Section with AI...' : 'Build Section with AI'}
            </button>
          </div>
        </form>

        {loading && (
          <div className="p-4 rounded-md text-xs text-secondary animate-pulse border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]">
            AI is constructing your custom dashboard section layout...
          </div>
        )}

        {error && (
          <div className="p-4 rounded-md text-xs text-negative border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            {error}
          </div>
        )}

        {generatedPage && (
          <div className="flex flex-col gap-3">
            {/* Layout preview */}
            <div className="p-4 rounded-md text-xs flex flex-col gap-3 bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <div className="flex items-center justify-between font-bold text-xs uppercase text-primary border-b border-[var(--color-border-subtle)] pb-2">
                <span>Preview: {generatedPage.name}</span>
                <span className="text-[10px] text-tertiary font-mono">
                  {generatedPage.columns?.length || 0} Columns
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {generatedPage.columns.map((col, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-2.5 rounded bg-[var(--color-bg-widget)] border border-[var(--color-border-subtle)] flex flex-col gap-1.5"
                  >
                    <span className="text-[10px] font-mono text-tertiary uppercase">
                      Column {cIdx + 1} ({col.size})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {col.widgets.map((w, wIdx) => (
                        <span
                          key={wIdx}
                          className="px-2 py-0.5 text-[11px] rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-primary font-medium"
                        >
                          {w.title || w.type} ({w.type})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* URL correction panel — only shown when scraped-list widgets exist */}
            {scrapedWidgets.length > 0 && (
              <div className="p-4 rounded-md flex flex-col gap-3 border bg-[var(--color-bg-subtle)]" style={{ borderColor: 'var(--color-primary, var(--color-border))' }}>
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  <p className="text-[11px] font-semibold text-primary">
                    Web scrape widgets need a verified URL
                  </p>
                </div>
                <p className="text-[10px] text-secondary leading-relaxed">
                  The AI may have guessed the URL. Paste the correct page URL for each widget below before adding to your dashboard.
                </p>

                {scrapedWidgets.map(({ colIdx, wIdx, widget }) => {
                  const key = `${colIdx}-${wIdx}`;
                  return (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-medium text-secondary">
                        {widget.title || widget.prompt}
                        <span className="ml-1 text-tertiary font-normal">(col {colIdx + 1}, widget {wIdx + 1})</span>
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="url"
                          value={urlOverrides[key] ?? ''}
                          onChange={(e) =>
                            setUrlOverrides((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          placeholder="https://example.com/leaderboard"
                          className="flex-1 px-3 py-1.5 font-mono text-[11px] rounded-md bg-[var(--color-bg-input)] border border-[var(--color-border)] text-primary outline-none focus:border-[var(--color-text-secondary)]"
                        />
                        {urlOverrides[key]?.trim() && (
                          <a
                            href={urlOverrides[key].trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-secondary hover:text-primary flex-shrink-0"
                            title="Open URL to verify"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        )}
                      </div>
                      <p className="text-[10px] text-tertiary">
                        Extracts: {widget.prompt}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setGeneratedPage(null); setUrlOverrides({}); }}
                className="px-3 py-1.5 text-xs font-medium rounded border border-[var(--color-border)] text-secondary cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                disabled={scrapedWidgets.some(({ colIdx, wIdx }) => !urlOverrides[`${colIdx}-${wIdx}`]?.trim())}
                className="px-4 py-1.5 text-xs font-semibold rounded bg-[var(--color-text-primary)] text-[var(--color-bg-page)] cursor-pointer disabled:opacity-40"
                title={scrapedWidgets.some(({ colIdx, wIdx }) => !urlOverrides[`${colIdx}-${wIdx}`]?.trim()) ? 'Fill in all URLs above first' : ''}
              >
                Add Section to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
