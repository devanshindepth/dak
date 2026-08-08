'use client';

import React, { useEffect, useState } from 'react';
import { RSSWidgetConfig, RSSFeedSource, RSSItem } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';
import { TimeAgo } from '@/app/components/ui/TimeAgo';

export default function RSSWidget({ config }: { config: RSSWidgetConfig }) {
  const [feeds, setFeeds] = useState<RSSFeedSource[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-rss-feeds-${config.id || 'default'}`);
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return config.feeds || [
      { url: 'https://feeds.arstechnica.com/arstechnica/index', title: 'Ars Technica', limit: 4 },
      { url: 'https://www.theverge.com/rss/index.xml', title: 'The Verge', limit: 4 },
      { url: 'https://techcrunch.com/feed/', title: 'TechCrunch', limit: 4 },
    ];
  });

  const [items, setItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dak-rss-feeds-${config.id || 'default'}`, JSON.stringify(feeds));
    }
  }, [feeds, config.id]);

  useEffect(() => {
    async function fetchRSS() {
      if (feeds.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/rss', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feeds, limit: config.limit || 15 }),
        });
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setItems(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchRSS();
  }, [feeds, config.limit]);

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    if (!feeds.some((f) => f.url === newUrl.trim())) {
      setFeeds([...feeds, { url: newUrl.trim(), title: newTitle.trim() || undefined }]);
    }
    setNewUrl('');
    setNewTitle('');
    setShowAddForm(false);
  };

  const handleRemoveFeed = (url: string) => {
    setFeeds(feeds.filter((f) => f.url !== url));
  };

  const visibleItems = expanded && config.collapseAfter ? items : items.slice(0, config.collapseAfter || items.length);

  return (
    <WidgetShell
      title={config.title || 'RSS Feeds'}
      titleUrl={config.titleUrl}
      hideHeader={config.hideHeader}
      error={error}
      loading={loading}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-tertiary">
          <span>Active Feeds: {feeds.length}</span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            {showAddForm ? '✕ Close' : '＋ Add RSS Feed'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddFeed} className="flex gap-2 p-2 rounded border border-subtle bg-subtle">
            <input
              type="text"
              placeholder="RSS/Atom Feed URL"
              className="flex-1 px-2 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <input
              type="text"
              placeholder="Title (Optional)"
              className="w-1/3 px-2 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button type="submit" className="px-2.5 py-1 text-xs font-semibold bg-primary text-background rounded">
              Add
            </button>
          </form>
        )}

        {feeds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-subtle">
            {feeds.map((f) => (
              <span
                key={f.url}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] bg-subtle text-secondary border border-subtle"
              >
                <span>{f.title || new URL(f.url).hostname}</span>
                <button
                  onClick={() => handleRemoveFeed(f.url)}
                  className="hover:text-negative font-bold"
                  title="Remove feed"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <ul className="feed-list">
          {visibleItems.map((item, idx) => (
            <li key={idx} className="feed-item">
              <div className="flex gap-3 items-start">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-12 h-12 object-cover rounded flex-shrink-0 mt-0.5 border border-subtle"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="feed-item-title font-medium"
                  >
                    {item.title}
                  </a>
                  <div className="feed-item-meta mt-1">
                    {item.source && <span className="feed-item-source">{item.source}</span>}
                    {item.source && <span className="feed-item-meta-separator" />}
                    {item.pubDate && <TimeAgo date={item.pubDate} />}
                  </div>
                </div>
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        )}
      </div>
    </WidgetShell>
  );
}
