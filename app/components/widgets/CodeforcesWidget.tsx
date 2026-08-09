'use client';

import React, { useEffect, useState } from 'react';
import { CodeforcesWidgetConfig, CodeforcesContest, CodeforcesUser } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

export default function CodeforcesWidget({ config }: { config: CodeforcesWidgetConfig }) {
  const [handle, setHandle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-codeforces-handle-${config.id || 'default'}`);
      if (saved) return saved;
    }
    return config.handle || 'Tourist';
  });

  const [contests, setContests] = useState<CodeforcesContest[]>([]);
  const [user, setUser] = useState<CodeforcesUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [inputHandle, setInputHandle] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dak-codeforces-handle-${config.id || 'default'}`, handle);
    }
  }, [handle, config.id]);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/codeforces?handle=${encodeURIComponent(handle)}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        if (isMounted) {
          setContests(data.upcomingContests || []);
          setUser(data.userStats || null);
        }
      } catch {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [handle]);

  const handleHandleChange = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputHandle.trim();
    if (!clean) return;
    setHandle(clean);
    setInputHandle('');
    setShowEdit(false);
  };

  const formatCountdown = (startSeconds: number) => {
    const diff = Math.floor(startSeconds - Date.now() / 1000);
    if (diff <= 0) return 'Starting soon';
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(hours / 24);
    if (days > 0) return `in ${days}d ${hours % 24}h`;
    const mins = Math.floor((diff % 3600) / 60);
    return `in ${hours}h ${mins}m`;
  };

  return (
    <WidgetShell
      title={config.title || 'Codeforces CP'}
      titleUrl={config.titleUrl || `https://codeforces.com/profile/${handle}`}
      hideHeader={config.hideHeader}
      error={error}
      loading={loading}
      headerAction={
        <button
          onClick={() => setShowEdit(!showEdit)}
          className="text-[11px] font-semibold text-tertiary hover:text-primary transition-colors cursor-pointer"
        >
          {showEdit ? '✕ Close' : '⚙ Change Handle'}
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {showEdit && (
          <form onSubmit={handleHandleChange} className="flex gap-2 p-2 rounded border border-subtle bg-subtle">
            <input
              type="text"
              placeholder="Codeforces handle (e.g. Tourist, Benq)"
              className="flex-1 px-2.5 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
              value={inputHandle}
              onChange={(e) => setInputHandle(e.target.value)}
              required
            />
            <button type="submit" className="px-3 py-1 text-xs font-semibold bg-primary text-background rounded cursor-pointer">
              Set
            </button>
          </form>
        )}

        {user && (
          <div className="flex items-center justify-between p-2 rounded bg-subtle">
            <div className="flex items-center gap-2">
              {user.avatar && (
                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border border-subtle object-cover" />
              )}
              <div>
                <a
                  href={`https://codeforces.com/profile/${user.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {user.handle}
                </a>
                <div className="text-[10px] text-tertiary capitalize">{user.rank}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-primary">{user.rating}</div>
              <div className="text-[10px] text-tertiary">Max: {user.maxRating}</div>
            </div>
          </div>
        )}

        <div>
          <div className="text-[11px] font-semibold text-tertiary uppercase tracking-wider mb-1.5">
            Upcoming Contests
          </div>
          <div className="flex flex-col gap-1.5">
            {contests.slice(0, config.limitContests || 3).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2 rounded border border-subtle hover:border-text-secondary transition-colors"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <a
                    href={`https://codeforces.com/contests/${c.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-primary hover:underline truncate block"
                  >
                    {c.name}
                  </a>
                  <div className="text-[10px] text-tertiary">
                    Duration: {Math.round(c.durationSeconds / 3600)}h
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-subtle text-primary whitespace-nowrap">
                  {formatCountdown(c.startTimeSeconds)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}

