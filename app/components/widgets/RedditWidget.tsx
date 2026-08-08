'use client';

import React, { useEffect, useState } from 'react';
import { RedditWidgetConfig } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';
import { TimeAgo } from '@/app/components/ui/TimeAgo';

interface RedditPost {
  id: string;
  title: string;
  url: string;
  permalink: string;
  score: number;
  numComments: number;
  author: string;
  createdUtc: number;
  thumbnail?: string;
  domain: string;
}

export default function RedditWidget({ config }: { config: RedditWidgetConfig }) {
  const [subreddit, setSubreddit] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-reddit-sub-${config.id || 'default'}`);
      if (saved) return saved;
    }
    return config.subreddit || 'selfhosted';
  });

  const [inputSub, setInputSub] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dak-reddit-sub-${config.id || 'default'}`, subreddit);
    }
  }, [subreddit, config.id]);

  useEffect(() => {
    async function fetchReddit() {
      setLoading(true);
      setError(false);
      try {
        const limit = config.limit || 10;
        const sortBy = config.sortBy || 'hot';
        const topPeriod = config.topPeriod || 'day';

        const res = await fetch(
          `/api/reddit?subreddit=${encodeURIComponent(subreddit)}&limit=${limit}&sortBy=${sortBy}&topPeriod=${topPeriod}`
        );
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchReddit();
  }, [subreddit, config.limit, config.sortBy, config.topPeriod]);

  const handleSubChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSub.trim()) return;
    setSubreddit(inputSub.trim().replace(/^r\//, ''));
    setInputSub('');
    setShowEdit(false);
  };

  const visiblePosts = expanded && config.collapseAfter ? posts : posts.slice(0, config.collapseAfter || posts.length);

  return (
    <WidgetShell
      title={config.title || `r/${subreddit}`}
      titleUrl={config.titleUrl || `https://www.reddit.com/r/${subreddit}`}
      hideHeader={config.hideHeader}
      error={error}
      loading={loading}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-tertiary">
          <span>Subreddit: r/{subreddit}</span>
          <button
            onClick={() => setShowEdit(!showEdit)}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            {showEdit ? '✕ Close' : '⚙ Switch Subreddit'}
          </button>
        </div>

        {showEdit && (
          <form onSubmit={handleSubChange} className="flex gap-2 p-2 rounded border border-subtle bg-subtle">
            <input
              type="text"
              placeholder="e.g. technology, programming"
              className="flex-1 px-2 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
              value={inputSub}
              onChange={(e) => setInputSub(e.target.value)}
            />
            <button type="submit" className="px-2.5 py-1 text-xs font-semibold bg-primary text-background rounded">
              Set
            </button>
          </form>
        )}

        <ul className="feed-list">
          {visiblePosts.map((post) => (
            <li key={post.id} className="feed-item">
              <div className="flex gap-3 items-start">
                {config.showThumbnails && post.thumbnail && (
                  <img
                    src={post.thumbnail}
                    alt=""
                    className="w-10 h-10 object-cover rounded flex-shrink-0 mt-0.5 border border-subtle"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="feed-item-title"
                  >
                    {post.title}
                  </a>
                  <div className="feed-item-meta mt-1">
                    <span>▲ {post.score}</span>
                    <span className="feed-item-meta-separator" />
                    <span>💬 {post.numComments}</span>
                    <span className="feed-item-meta-separator" />
                    <TimeAgo date={post.createdUtc * 1000} />
                    <span className="feed-item-meta-separator" />
                    <span className="feed-item-source">u/{post.author}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {config.collapseAfter && posts.length > config.collapseAfter && (
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
