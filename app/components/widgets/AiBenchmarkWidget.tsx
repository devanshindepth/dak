'use client';

import React, { useEffect, useState, useCallback } from 'react';
import WidgetShell from '@/app/components/ui/WidgetShell';
import type { BenchmarkResult } from '@/app/api/ai-benchmark/route';

function getRankStyle(rank: number): React.CSSProperties {
  if (rank === 1) {
    return {
      backgroundColor: 'var(--color-text-primary)',
      color: 'var(--color-bg-page)',
    };
  }
  if (rank === 2) {
    return {
      backgroundColor: 'rgba(255,255,255,0.18)',
      color: 'var(--color-text-primary)',
    };
  }
  if (rank === 3) {
    return {
      backgroundColor: 'rgba(255,255,255,0.09)',
      color: 'var(--color-text-secondary)',
    };
  }
  return {
    backgroundColor: 'var(--color-bg-page)',
    color: 'var(--color-text-tertiary)',
    border: '1px solid var(--color-border-subtle)',
  };
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={spinning ? { animation: 'spin 1s linear infinite' } : undefined}
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M5.5 1H9M9 1V4.5M9 1L4 6M2 3H1V9H7V8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BenchmarkCard({ bench }: { bench: BenchmarkResult }) {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg p-4"
      style={{
        backgroundColor: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className="text-sm font-bold leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {bench.name}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
            {bench.description}
          </span>
        </div>
        <a
          href={bench.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 mt-0.5 transition-colors"
          style={{ color: 'var(--color-text-tertiary)' }}
          aria-label={`Open ${bench.name} leaderboard`}
        >
          <LinkIcon />
        </a>
      </div>

      {/* Column header */}
      <div
        className="flex items-center gap-2 pb-1"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <span className="w-5 shrink-0" aria-hidden="true" />
        <span
          className="flex-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Model
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-wider shrink-0"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Score
        </span>
      </div>

      {/* Model rows */}
      <div className="flex flex-col gap-1.5">
        {bench.models.map((m) => (
          <div key={m.rank} className="flex items-center gap-2">
            <span
              className="w-5 h-5 shrink-0 rounded-sm flex items-center justify-center text-[10px] font-bold font-mono"
              style={getRankStyle(m.rank)}
            >
              {m.rank}
            </span>
            <span
              className="flex-1 text-xs font-medium truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {m.model}
            </span>
            <span
              className="shrink-0 text-xs font-mono tabular-nums"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {m.score}{bench.unit}
            </span>
          </div>
        ))}
      </div>

      {/* Footer: source + date */}
      <div
        className="flex items-center justify-between pt-1"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <span className="text-[10px] truncate" style={{ color: 'var(--color-text-tertiary)' }}>
          {bench.sourceNote}
        </span>
        <span className="text-[10px] shrink-0 ml-2" style={{ color: 'var(--color-text-tertiary)' }}>
          {bench.updatedAt}
        </span>
      </div>
    </div>
  );
}

interface AiBenchmarkWidgetProps {
  config: {
    title?: string;
    id?: string;
  };
}

export default function AiBenchmarkWidget({ config }: AiBenchmarkWidgetProps) {
  const [benchmarks, setBenchmarks] = useState<BenchmarkResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-benchmark');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data: BenchmarkResult[] = await res.json();
      setBenchmarks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load benchmarks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <WidgetShell
      title={config.title || 'AI Benchmarks'}
      loading={loading}
      error={!!error}
      headerAction={
        <button
          onClick={fetchData}
          disabled={loading}
          className="transition-colors disabled:opacity-40 cursor-pointer"
          style={{ color: 'var(--color-text-tertiary)' }}
          title="Refresh"
          aria-label="Refresh benchmarks"
        >
          <RefreshIcon spinning={loading} />
        </button>
      }
    >
      {error ? (
        <div className="px-1 py-2 text-xs" style={{ color: 'var(--color-negative)' }}>
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 2xl:grid-cols-4">
          {benchmarks.map((bench) => (
            <BenchmarkCard key={bench.id} bench={bench} />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
