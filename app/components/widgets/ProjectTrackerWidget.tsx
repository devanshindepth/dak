'use client';

import React, { useState, useEffect } from 'react';
import WidgetShell from '@/app/components/ui/WidgetShell';
import { TimeAgo } from '@/app/components/ui/TimeAgo';

interface ProjectItem {
  id: string;
  name: string;
  repo: string;
  description: string;
  category: 'Framework' | 'Tool' | 'Library';
  version?: string;
  updatedAt?: string;
}

interface ReleaseData {
  tag: string;
  name: string;
  publishedAt: string;
  url: string;
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'nextjs',
    name: 'Next.js',
    repo: 'vercel/next.js',
    description: 'The React Framework for the Web',
    category: 'Framework',
  },
  {
    id: 'react',
    name: 'React',
    repo: 'facebook/react',
    description: 'The library for web and native user interfaces',
    category: 'Library',
  },
  {
    id: 'tailwindcss',
    name: 'Tailwind CSS',
    repo: 'tailwindlabs/tailwindcss',
    description: 'A utility-first CSS framework for rapid UI development',
    category: 'Tool',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    repo: 'microsoft/TypeScript',
    description: 'JavaScript with syntax for types',
    category: 'Tool',
  },
];

interface ProjectTrackerWidgetProps {
  config: {
    title?: string;
    id?: string;
  };
}

export default function ProjectTrackerWidget({ config }: ProjectTrackerWidgetProps) {
  const [releases, setReleases] = useState<Record<string, ReleaseData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchReleases() {
      setLoading(true);
      const updated: Record<string, ReleaseData> = {};
      await Promise.all(
        DEFAULT_PROJECTS.map(async (proj) => {
          try {
            const res = await fetch(`https://api.github.com/repos/${proj.repo}/releases/latest`, {
              headers: { Accept: 'application/vnd.github.v3+json' },
            });
            if (res.ok) {
              const data = await res.json();
              updated[proj.id] = {
                tag: data.tag_name,
                name: data.name || data.tag_name,
                publishedAt: data.published_at,
                url: data.html_url,
              };
            }
          } catch {
            // Ignore
          }
        })
      );
      if (isMounted) {
        setReleases(updated);
        setLoading(false);
      }
    }

    fetchReleases();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <WidgetShell title={config.title || 'Tracked Projects & Releases'}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col border-t border-subtle">
          {DEFAULT_PROJECTS.map((proj) => {
            const rel = releases[proj.id];
            return (
              <div
                key={proj.id}
                className="flex items-center justify-between py-3 border-b border-subtle gap-3 hover:bg-[var(--color-bg-widget-hover)] px-1 rounded transition-colors"
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://github.com/${proj.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-xs text-primary hover:underline truncate"
                    >
                      {proj.name}
                    </a>
                    <span
                      className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded flex-shrink-0 uppercase"
                      style={{
                        backgroundColor: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-tertiary)',
                      }}
                    >
                      {proj.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-tertiary truncate">{proj.description}</span>
                </div>

                <div className="flex flex-col items-end flex-shrink-0 text-right">
                  {loading ? (
                    <div className="skeleton skeleton-line h-4 w-12" />
                  ) : rel ? (
                    <>
                      <a
                        href={rel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs font-bold text-primary hover:underline"
                      >
                        {rel.tag} ↗
                      </a>
                      <span className="text-[10px] text-tertiary">
                        <TimeAgo date={rel.publishedAt} />
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] text-tertiary">Latest</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WidgetShell>
  );
}
