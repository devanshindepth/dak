'use client';

import React, { useEffect, useState } from 'react';
import { RepositoryWidgetConfig } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

interface RepoData {
  name: string;
  description: string;
  stars: number;
  forks: number;
  issues: number;
  language: string;
  updatedAt: string;
  htmlUrl: string;
}

export default function RepositoryWidget({ config }: { config: RepositoryWidgetConfig }) {
  const [repo, setRepo] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchRepo() {
      try {
        const repoName = config.repository || 'facebook/react';
        const res = await fetch(`/api/github?repo=${encodeURIComponent(repoName)}&type=repo`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setRepo(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchRepo();
  }, [config]);

  return (
    <WidgetShell
      title={config.title || repo?.name || 'Repository'}
      titleUrl={config.titleUrl || repo?.htmlUrl}
      hideHeader={config.hideHeader}
      error={error}
      loading={loading}
    >
      {repo && (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-secondary leading-relaxed">{repo.description}</div>
          <div className="flex items-center gap-4 text-xs text-tertiary mt-1">
            {repo.language && (
              <span className="flex items-center gap-1.5 font-medium text-secondary">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {repo.language}
              </span>
            )}
            <span>⭐ {repo.stars.toLocaleString()}</span>
            <span>🍴 {repo.forks.toLocaleString()}</span>
            <span>❗ {repo.issues}</span>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
