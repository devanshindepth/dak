'use client';

import React, { useEffect, useState } from 'react';
import type { HackerNewsWidgetConfig, HackerNewsItem } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

export default function HackerNewsWidget({ config }: { config: HackerNewsWidgetConfig }) {
  const [items, setItems] = useState<HackerNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchHN() {
      try {
        const res = await fetch(`/api/hackernews?sortBy=${config.sortBy || 'top'}&limit=${config.limit || 15}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setItems(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchHN();
    
    // Auto-refresh based on cache parameter (or default 5m)
    const cacheMinutes = config.cache ? parseInt(config.cache) : 5;
    const intervalId = setInterval(fetchHN, cacheMinutes * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [config]);

  const visibleItems = expanded && config.collapseAfter ? items : items.slice(0, config.collapseAfter || items.length);

  return (
    <WidgetShell 
      title={config.title || "Hacker News"} 
      titleUrl={config.titleUrl || "https://news.ycombinator.com"} 
      hideHeader={config.hideHeader}
      error={error}
      loading={loading}
    >
      <ul className="feed-list">
        {visibleItems.map(item => (
          <li key={item.id} className="feed-item">
            <div>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="feed-item-title">
                {item.title}
              </a>
              {item.domain && <span className="feed-item-meta" style={{marginLeft: 6}}>({item.domain})</span>}
            </div>
            <div className="feed-item-meta">
              <span>{item.points} pts</span>
              <span className="feed-item-meta-separator" />
              <span>{item.commentCount} comments</span>
              <span className="feed-item-meta-separator" />
              <span>{item.timeAgo}</span>
              <span className="feed-item-meta-separator" />
              <span className="feed-item-source">{item.by}</span>
            </div>
          </li>
        ))}
      </ul>
      {config.collapseAfter && items.length > config.collapseAfter && (
        <button 
          className="feed-collapse-btn" 
          data-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : 'Show more'}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      )}
    </WidgetShell>
  );
}
