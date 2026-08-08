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
  const [releases, setReleases] = useState<ReleaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchReleases() {
      try {
        const repos = config.repositories || ['glanceapp/glance'];
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
  }, [config]);

  return (
    <WidgetShell
      title={config.title || 'Releases'}
      titleUrl={config.titleUrl || 'https://github.com'}
      hideHeader={config.hideHeader}
      error={error}
      loading={loading}
    >
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
    </WidgetShell>
  );
}
