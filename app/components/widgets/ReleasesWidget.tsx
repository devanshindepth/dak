'use client';

import React, { useEffect, useState } from 'react';
import { ReleasesWidgetConfig } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';
import { TimeAgo } from '@/app/components/ui/TimeAgo';

interface ReleaseItem {
  id: number;
  tagName: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  body: string;
  repo: string;
}

export default function ReleasesWidget({ config }: { config: ReleasesWidgetConfig }) {
  const [repos, setRepos] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-releases-repos-${config.id || 'default'}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return config.repositories || ['vercel/next.js', 'facebook/react', 'tailwindlabs/tailwindcss'];
  });

  const [releases, setReleases] = useState<ReleaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRepoInput, setNewRepoInput] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dak-releases-repos-${config.id || 'default'}`, JSON.stringify(repos));
    }
  }, [repos, config.id]);

  useEffect(() => {
    async function fetchReleases() {
      setLoading(true);
      setError(false);
      try {
        const allReleases: ReleaseItem[] = [];

        for (const repo of repos) {
          const res = await fetch(`/api/github?repo=${encodeURIComponent(repo)}&type=releases`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              allReleases.push(data[0]); // Get latest release per repo
            }
          }
        }
        setReleases(allReleases);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchReleases();
  }, [repos]);

  const handleAddRepo = (e: React.FormEvent) => {
    e.preventDefault();
    const repo = newRepoInput.trim().replace(/^https?:\/\/github\.com\//, '');
    if (!repo) return;
    if (!repos.includes(repo)) {
      setRepos([...repos, repo]);
    }
    setNewRepoInput('');
    setShowAddForm(false);
  };

  const handleRemoveRepo = (repoToRemove: string) => {
    setRepos(repos.filter((r) => r !== repoToRemove));
  };

  return (
    <WidgetShell
      title={config.title || 'Framework Releases'}
      titleUrl={config.titleUrl || 'https://github.com'}
      hideHeader={config.hideHeader}
      error={error}
      loading={loading}
      headerAction={
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-[11px] font-semibold text-tertiary hover:text-primary transition-colors cursor-pointer"
        >
          {showAddForm ? '✕ Close' : '+ Add Repo'}
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {showAddForm && (
          <form onSubmit={handleAddRepo} className="flex gap-2 p-2 rounded border border-subtle bg-subtle">
            <input
              type="text"
              placeholder="owner/repo (e.g. facebook/react)"
              className="flex-1 px-2.5 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
              value={newRepoInput}
              onChange={(e) => setNewRepoInput(e.target.value)}
              required
            />
            <button type="submit" className="px-3 py-1 text-xs font-semibold bg-primary text-background rounded cursor-pointer">
              Add
            </button>
          </form>
        )}

        {repos.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-subtle">
            {repos.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-subtle text-secondary border border-subtle"
              >
                <span>{r}</span>
                <button
                  onClick={() => handleRemoveRepo(r)}
                  className="hover:text-negative font-bold cursor-pointer"
                  title="Remove repository"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <ul className="feed-list">
          {releases.map((rel) => (
            <li key={rel.id} className="feed-item">
              <div className="flex items-center justify-between">
                <a
                  href={rel.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="feed-item-title font-medium"
                >
                  {rel.repo}
                </a>
                <span className="text-[11px] font-mono font-semibold text-secondary px-1.5 py-0.5 rounded bg-subtle">
                  {rel.tagName}
                </span>
              </div>
              <div className="feed-item-meta mt-1">
                <span>{rel.name}</span>
                <span className="feed-item-meta-separator" />
                <TimeAgo date={rel.publishedAt} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </WidgetShell>
  );
}

