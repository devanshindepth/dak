'use client';

import React, { useState, useEffect, useCallback } from 'react';
import WidgetShell from '@/app/components/ui/WidgetShell';
import { TimeAgo } from '@/app/components/ui/TimeAgo';

interface Article {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  symbol: string;
  snippet?: string;
}

interface StockNewsWidgetProps {
  config: {
    title?: string;
    id?: string;
  };
}

export default function StockNewsWidget({ config }: StockNewsWidgetProps) {
  const [symbols, setSymbols] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-stock-news-symbols-${config.id || 'default'}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return ['ALL', 'BTC-USD', 'ETH-USD', 'NVDA', 'AAPL', 'SPY'];
  });

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSymbol, setActiveSymbol] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dak-stock-news-symbols-${config.id || 'default'}`, JSON.stringify(symbols));
    }
  }, [symbols, config.id]);

  const fetchNews = useCallback(async (sym: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stock-news?symbol=${encodeURIComponent(sym)}`);
      if (res.ok) {
        const data: Article[] = await res.json();
        setArticles(data);
      }
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stock-news?symbol=${encodeURIComponent(activeSymbol)}`);
        if (res.ok && isMounted) {
          const data: Article[] = await res.json();
          setArticles(data);
        }
      } catch {
        // Ignore
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeSymbol]);

  const [visitedLinks, setVisitedLinks] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dak-visited-news');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dak-visited-news', JSON.stringify(visitedLinks));
    }
  }, [visitedLinks]);

  const markVisited = (url: string) => {
    if (!visitedLinks.includes(url)) {
      setVisitedLinks((prev) => [...prev, url]);
    }
  };

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim().toUpperCase();
    if (!tag) return;
    if (!symbols.includes(tag)) {
      const updated = [...symbols, tag];
      setSymbols(updated);
      setActiveSymbol(tag);
    }
    setNewTagInput('');
    setShowAddForm(false);
  };

  const handleRemoveSymbol = (e: React.MouseEvent, symToRemove: string) => {
    e.stopPropagation();
    if (symToRemove === 'ALL') return;
    const updated = symbols.filter((s) => s !== symToRemove);
    setSymbols(updated);
    if (activeSymbol === symToRemove) {
      setActiveSymbol('ALL');
    }
  };

  return (
    <WidgetShell
      title={config.title || 'Tracked Stocks News'}
      headerAction={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[11px] text-tertiary hover:text-primary transition-colors cursor-pointer font-semibold"
          >
            {showAddForm ? '✕ Close' : '+ Tag'}
          </button>
          <button
            onClick={() => fetchNews(activeSymbol)}
            className="text-[11px] text-tertiary hover:text-primary transition-colors cursor-pointer"
            title="Refresh market news"
          >
            ↻ Refresh
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {showAddForm && (
          <form onSubmit={handleAddSymbol} className="flex gap-2 p-2 rounded border border-subtle bg-subtle">
            <input
              type="text"
              placeholder="Enter ticker / symbol (e.g. TSLA, MSFT, SOL-USD)"
              className="flex-1 px-2.5 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none uppercase"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              required
            />
            <button type="submit" className="px-3 py-1 text-xs font-semibold bg-primary text-background rounded cursor-pointer">
              Add Tag
            </button>
          </form>
        )}

        {/* Symbol Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {symbols.map((sym) => (
            <div key={sym} className="flex items-center group relative shrink-0">
              <button
                onClick={() => setActiveSymbol(sym)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1"
                style={{
                  backgroundColor:
                    activeSymbol === sym ? 'var(--color-text-primary)' : 'var(--color-bg-subtle)',
                  color:
                    activeSymbol === sym ? 'var(--color-bg-page)' : 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span>{sym}</span>
                {sym !== 'ALL' && (
                  <span
                    onClick={(e) => handleRemoveSymbol(e, sym)}
                    className="hover:opacity-75 font-bold ml-1"
                    title="Remove tag"
                  >
                    ✕
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton skeleton-line h-12 w-full" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-xs text-tertiary text-center py-4">No news found for {activeSymbol}.</div>
        ) : (
          <div className="flex flex-col border-t border-subtle">
            {articles.map((art, idx) => {
              const isVisited = visitedLinks.includes(art.link);
              return (
                <a
                  key={idx}
                  href={art.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markVisited(art.link)}
                  className={`flex flex-col gap-1 py-2.5 px-1 border-b border-subtle hover:bg-[var(--color-bg-widget-hover)] transition-colors group text-decoration-none ${
                    isVisited ? 'opacity-40 grayscale' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{
                        backgroundColor: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)',
                        color: isVisited ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                      }}
                    >
                      {art.symbol}
                    </span>
                    <span className="text-[11px] text-tertiary">
                      <TimeAgo date={art.pubDate} />
                    </span>
                  </div>
                  <div
                    className={`text-xs font-semibold group-hover:underline leading-snug ${
                      isVisited ? 'text-tertiary line-through' : 'text-primary'
                    }`}
                  >
                    {art.title}
                  </div>
                  {art.snippet && (
                    <div className={`text-[11px] line-clamp-2 leading-tight ${isVisited ? 'text-tertiary' : 'text-secondary'}`}>
                      {art.snippet}
                    </div>
                  )}
                  <div className="text-[10px] text-tertiary font-medium">{art.source}</div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </WidgetShell>
  );
}


