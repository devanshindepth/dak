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
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSymbol, setActiveSymbol] = useState<string>('ALL');

  const symbols = ['ALL', 'BTC-USD', 'ETH-USD', 'NVDA', 'AAPL', 'SPY'];

  const fetchNews = useCallback(async (sym: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stock-news?symbol=${sym}`);
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
        const res = await fetch(`/api/stock-news?symbol=${activeSymbol}`);
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

  return (
    <WidgetShell
      title={config.title || 'Tracked Stocks News'}
      headerAction={
        <button
          onClick={() => fetchNews(activeSymbol)}
          className="text-[11px] text-tertiary hover:text-primary transition-colors cursor-pointer"
          title="Refresh market news"
        >
          ↻ Refresh
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Symbol Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {symbols.map((sym) => (
            <button
              key={sym}
              onClick={() => setActiveSymbol(sym)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer"
              style={{
                backgroundColor:
                  activeSymbol === sym ? 'var(--color-text-primary)' : 'var(--color-bg-subtle)',
                color:
                  activeSymbol === sym ? 'var(--color-bg-page)' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              {sym}
            </button>
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
            {articles.map((art, idx) => (
              <a
                key={idx}
                href={art.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1 py-2.5 px-1 border-b border-subtle hover:bg-[var(--color-bg-widget-hover)] transition-colors group text-decoration-none"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--color-bg-subtle)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {art.symbol}
                  </span>
                  <span className="text-[11px] text-tertiary">
                    <TimeAgo date={art.pubDate} />
                  </span>
                </div>
                <div className="text-xs font-semibold text-primary group-hover:underline leading-snug">
                  {art.title}
                </div>
                {art.snippet && (
                  <div className="text-[11px] text-secondary line-clamp-2 leading-tight">
                    {art.snippet}
                  </div>
                )}
                <div className="text-[10px] text-tertiary font-medium">{art.source}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
