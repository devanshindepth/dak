'use client';

import React, { useEffect, useState } from 'react';
import { LeetCodeWidgetConfig, LeetCodeDaily, LeetCodeUserStats } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

export default function LeetCodeWidget({ config }: { config: LeetCodeWidgetConfig }) {
  const [daily, setDaily] = useState<LeetCodeDaily | null>(null);
  const [user, setUser] = useState<LeetCodeUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const username = config.username || 'leetcode';
        const res = await fetch(`/api/leetcode?username=${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setDaily(data.dailyChallenge || null);
        setUser(data.userStats || null);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [config]);

  const getDiffBadgeClass = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/50';
      case 'Hard':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/50';
      default:
        return 'text-zinc-400 bg-zinc-900 border-zinc-800';
    }
  };

  return (
    <WidgetShell
      title={config.title || 'LeetCode'}
      titleUrl={config.titleUrl || 'https://leetcode.com'}
      hideHeader={config.hideHeader}
      error={error}
      loading={loading}
    >
      <div className="flex flex-col gap-3">
        {daily && (
          <div className="p-2.5 rounded border border-subtle bg-subtle">
            <div className="text-[10px] uppercase font-semibold text-tertiary tracking-wider mb-1">
              Daily Challenge • {daily.date}
            </div>
            <a
              href={daily.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary hover:underline block truncate mb-1.5"
            >
              {daily.title}
            </a>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getDiffBadgeClass(daily.difficulty)}`}>
                {daily.difficulty}
              </span>
              {daily.topicTags.slice(0, 2).map((t, idx) => (
                <span key={idx} className="text-[10px] text-tertiary">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {user && (
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-primary mb-2">
              <span>{user.username}</span>
              <span className="font-mono text-tertiary text-[11px]">Rank #{user.ranking.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-1.5 rounded bg-subtle">
                <div className="text-xs font-mono font-bold text-primary">{user.totalSolved}</div>
                <div className="text-[9px] text-tertiary uppercase">Solved</div>
              </div>
              <div className="p-1.5 rounded bg-subtle">
                <div className="text-xs font-mono font-bold text-emerald-400">{user.easySolved}</div>
                <div className="text-[9px] text-tertiary uppercase">Easy</div>
              </div>
              <div className="p-1.5 rounded bg-subtle">
                <div className="text-xs font-mono font-bold text-amber-400">{user.mediumSolved}</div>
                <div className="text-[9px] text-tertiary uppercase">Med</div>
              </div>
              <div className="p-1.5 rounded bg-subtle">
                <div className="text-xs font-mono font-bold text-rose-400">{user.hardSolved}</div>
                <div className="text-[9px] text-tertiary uppercase">Hard</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
