'use client';

import React, { useState, useEffect } from 'react';
import { BookmarksWidgetConfig, BookmarkGroup, BookmarkLink } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

export default function BookmarksWidget({ config }: { config: BookmarksWidgetConfig }) {
  const [groups, setGroups] = useState<BookmarkGroup[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-bookmarks-${config.id || 'default'}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
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
      {
        title: 'Dev Platforms',
        links: [
          { title: 'LeetCode', url: 'https://leetcode.com', icon: 'si:leetcode' },
          { title: 'Codeforces', url: 'https://codeforces.com', icon: 'si:codeforces' },
          { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: 'si:mdnwebdocs' },
          { title: 'Vercel', url: 'https://vercel.com', icon: 'si:vercel' },
        ],
      },
    ];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');

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

    const updated = groups.map((g, idx) => {
      if (idx === selectedGroupIdx) {
        return { ...g, links: [...g.links, newLink] };
      }
      return g;
    });

    if (updated.length === 0) {
      updated.push({ title: 'Quick Access', links: [newLink] });
    }

    setGroups(updated);
    setNewTitle('');
    setNewUrl('');
    setShowAddForm(false);
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const gTitle = newGroupTitle.trim();
    if (!gTitle) return;
    const updated = [...groups, { title: gTitle, links: [] }];
    setGroups(updated);
    setSelectedGroupIdx(updated.length - 1);
    setNewGroupTitle('');
    setShowAddGroupForm(false);
  };

  const handleRemoveGroup = (groupIdx: number) => {
    const updated = groups.filter((_, idx) => idx !== groupIdx);
    setGroups(updated);
    setSelectedGroupIdx(0);
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
          <span>{groups.reduce((acc, g) => acc + g.links.length, 0)} Bookmarks</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowAddGroupForm(!showAddGroupForm);
                setShowAddForm(false);
              }}
              className="text-[11px] font-semibold text-tertiary hover:text-primary transition-colors cursor-pointer"
            >
              {showAddGroupForm ? '✕ Close' : '＋ Group'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setShowAddGroupForm(false);
              }}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
            >
              {showAddForm ? '✕ Close' : '＋ Bookmark'}
            </button>
          </div>
        </div>

        {showAddGroupForm && (
          <form onSubmit={handleAddGroup} className="flex gap-2 p-2.5 rounded border border-subtle bg-subtle">
            <input
              type="text"
              placeholder="New Group Title (e.g. Tools, Reading)"
              className="flex-1 px-2.5 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
              value={newGroupTitle}
              onChange={(e) => setNewGroupTitle(e.target.value)}
              required
            />
            <button type="submit" className="px-3 py-1 text-xs font-semibold bg-primary text-background rounded cursor-pointer">
              Add Group
            </button>
          </form>
        )}

        {showAddForm && (
          <form onSubmit={handleAddBookmark} className="flex flex-col gap-2 p-2.5 rounded border border-subtle bg-subtle">
            <div className="flex gap-2">
              {groups.length > 0 && (
                <select
                  className="w-1/3 px-2 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none cursor-pointer"
                  value={selectedGroupIdx}
                  onChange={(e) => setSelectedGroupIdx(parseInt(e.target.value, 10))}
                >
                  {groups.map((g, idx) => (
                    <option key={idx} value={idx}>
                      {g.title || `Group ${idx + 1}`}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                placeholder="Title"
                className="flex-1 px-2 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="URL (e.g. github.com)"
                className="flex-1 px-2 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
              />
              <button type="submit" className="px-3 py-1 text-xs font-semibold bg-primary text-background rounded cursor-pointer">
                Add
              </button>
            </div>
          </form>
        )}

        <div className={config.cssClass}>
          {groups.map((group, i) => (
            <div key={i} className="bookmarks-group mb-3">
              {group.title && (
                <div className="bookmarks-group-title flex items-center justify-between group/title">
                  <span>{group.title}</span>
                  <button
                    onClick={() => handleRemoveGroup(i)}
                    className="opacity-0 group-hover/title:opacity-100 text-tertiary hover:text-negative text-[10px] px-1 transition-opacity cursor-pointer"
                    title="Delete group"
                  >
                    ✕ Delete Group
                  </button>
                </div>
              )}
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
                      className="opacity-0 group-hover:opacity-100 text-tertiary hover:text-negative text-xs px-1 transition-opacity cursor-pointer"
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

