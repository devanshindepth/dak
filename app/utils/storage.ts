/**
 * Utility to back up and restore local storage settings for the Dak dashboard.
 */

export interface DakStorageBackup {
  version: string;
  timestamp: string;
  themePreset?: string;
  todos?: string;
  bookmarks?: Record<string, string>;
  markets?: Record<string, string>;
  rssFeeds?: Record<string, string>;
  ytChannels?: Record<string, string>;
  redditSubs?: Record<string, string>;
}

export function exportLocalStorageBackup(): string {
  if (typeof window === 'undefined') return '{}';

  const backup: DakStorageBackup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    themePreset: localStorage.getItem('dak-theme-preset') || undefined,
    todos: localStorage.getItem('dak-todos') || undefined,
    bookmarks: {},
    markets: {},
    rssFeeds: {},
    ytChannels: {},
    redditSubs: {},
  };

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const value = localStorage.getItem(key) || '';

    if (key.startsWith('dak-bookmarks-')) {
      backup.bookmarks![key] = value;
    } else if (key.startsWith('dak-markets-')) {
      backup.markets![key] = value;
    } else if (key.startsWith('dak-rss-feeds-')) {
      backup.rssFeeds![key] = value;
    } else if (key.startsWith('dak-yt-channels-')) {
      backup.ytChannels![key] = value;
    } else if (key.startsWith('dak-reddit-sub-')) {
      backup.redditSubs![key] = value;
    }
  }

  return JSON.stringify(backup, null, 2);
}

export function importLocalStorageBackup(jsonString: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const data: DakStorageBackup = JSON.parse(jsonString);

    if (data.themePreset) {
      localStorage.setItem('dak-theme-preset', data.themePreset);
    }
    if (data.todos) {
      localStorage.setItem('dak-todos', data.todos);
    }
    if (data.bookmarks) {
      Object.entries(data.bookmarks).forEach(([k, v]) => localStorage.setItem(k, v));
    }
    if (data.markets) {
      Object.entries(data.markets).forEach(([k, v]) => localStorage.setItem(k, v));
    }
    if (data.rssFeeds) {
      Object.entries(data.rssFeeds).forEach(([k, v]) => localStorage.setItem(k, v));
    }
    if (data.ytChannels) {
      Object.entries(data.ytChannels).forEach(([k, v]) => localStorage.setItem(k, v));
    }
    if (data.redditSubs) {
      Object.entries(data.redditSubs).forEach(([k, v]) => localStorage.setItem(k, v));
    }

    return true;
  } catch (err) {
    console.error('Failed to import Dak dashboard backup', err);
    return false;
  }
}
