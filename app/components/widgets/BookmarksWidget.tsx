'use client';

import React, { useState, useEffect } from 'react';
import { BookmarksWidgetConfig, BookmarkGroup, BookmarkLink } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

export default function BookmarksWidget({ config }: { config: BookmarksWidgetConfig }) {
  const [groups, setGroups] = useState<BookmarkGroup[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-bookmarks-${config.id || 'default'}`);
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return config.groups || [
      {
        title: 'Quick Access',
        links: [
          { title: 'Gmail', url: 'https://mail.google.com', icon: 'si:gmail' },
          { title: 'GitHub', url: 'https://github.com', icon: 'si:github' },
          { title: 'YouTube', url: 'https://youtube.com', icon: 'si:youtube' },
          { title: 'Reddit', url: 'https://reddit.com', icon: 'si:reddit' },
        ],
      },
    ];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dak-bookmarks-${config.id || 'default'}`, JSON.stringify(groups));
    }
  }, [groups, config.id]);

  const getIconUrl = (url: string, icon?: string) => {
    if (icon) {
      if (icon.startsWith('si:')) {
        const name = icon.slice(3);
        return `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${name}.svg`;
      }
      return icon;
    }
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      return '';
    }
  };

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    let targetUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    const newLink: BookmarkLink = {
      title: newTitle.trim() || new URL(targetUrl).hostname,
      url: targetUrl,
    };

    const updated = [...groups];
    if (updated.length === 0) {
      updated.push({ title: 'General', links: [newLink] });
    } else {
      updated[0].links.push(newLink);
    }

    setGroups(updated);
    setNewTitle('');
    setNewUrl('');
    setShowAddForm(false);
  };

  const handleRemoveBookmark = (groupIndex: number, linkIndex: number) => {
    const updated = groups.map((g, i) => {
      if (i === groupIndex) {
        return { ...g, links: g.links.filter((_, j) => j !== linkIndex) };
      }
      return g;
    });
    setGroups(updated);
  };

  return (
    <WidgetShell title={config.title || 'Bookmarks'} titleUrl={config.titleUrl} hideHeader={config.hideHeader}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-tertiary">
          <span>Bookmarks</span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            {showAddForm ? '✕ Close' : '＋ Add Bookmark'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddBookmark} className="flex gap-2 p-2 rounded border border-subtle bg-subtle">
            <input
              type="text"
              placeholder="Title"
              className="w-1/3 px-2 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="URL (e.g. github.com)"
              className="flex-1 px-2 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <button type="submit" className="px-2.5 py-1 text-xs font-semibold bg-primary text-background rounded">
              Add
            </button>
          </form>
        )}

        <div className={config.cssClass}>
          {groups.map((group, i) => (
            <div key={i} className="bookmarks-group">
              {group.title && <div className="bookmarks-group-title">{group.title}</div>}
              <div className="bookmarks-list">
                {group.links.map((link, j) => (
                  <div key={j} className="group flex items-center justify-between py-1 px-1 rounded hover:bg-subtle/50 transition-colors">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bookmark-link flex-1"
                    >
                      <img src={getIconUrl(link.url, link.icon)} alt="" className="bookmark-icon" />
                      <span>{link.title}</span>
                    </a>
                    <button
                      onClick={() => handleRemoveBookmark(i, j)}
                      className="opacity-0 group-hover:opacity-100 text-tertiary hover:text-negative text-xs px-1 transition-opacity"
                      title="Remove bookmark"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}
