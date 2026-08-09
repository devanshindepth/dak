'use client';

import React, { useState, useEffect } from 'react';
import { TypingProgressWidgetConfig, TypingResult } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';
import { TypingProgressBarChart } from '@/app/components/ui/TypingProgressBarChart';

export default function TypingProgressWidget({ config }: { config: TypingProgressWidgetConfig }) {
  const [history, setHistory] = useState<TypingResult[]>([]);

  useEffect(() => {
    function loadHistory() {
      try {
        const saved = localStorage.getItem('dak_typing_results');
        if (saved) {
          setHistory(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load typing results in widget', e);
      }
    }

    loadHistory();

    // Listen for storage updates
    window.addEventListener('storage', loadHistory);
    return () => window.removeEventListener('storage', loadHistory);
  }, []);

  const totalTests = history.length;
  const peakWpm = totalTests > 0 ? Math.max(...history.map((h) => h.wpm)) : 0;
  const avgWpm =
    totalTests > 0 ? Math.round(history.reduce((a, b) => a + b.wpm, 0) / totalTests) : 0;
  const avgAccuracy =
    totalTests > 0 ? Math.round(history.reduce((a, b) => a + b.accuracy, 0) / totalTests) : 0;

  return (
    <WidgetShell
      title={config.title || 'Typing Progress & Analytics'}
      hideHeader={config.hideHeader}
    >
      <div className="widget-content flex flex-col gap-4">
        {/* Quick Stats Banner */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div
            className="p-2 rounded border flex flex-col"
            style={{
              backgroundColor: 'var(--color-bg-page)',
              borderColor: 'var(--color-border)',
            }}
          >
            <span className="text-[9px] uppercase text-tertiary">Peak WPM</span>
            <span className="text-lg font-bold text-primary">{peakWpm}</span>
          </div>

          <div
            className="p-2 rounded border flex flex-col"
            style={{
              backgroundColor: 'var(--color-bg-page)',
              borderColor: 'var(--color-border)',
            }}
          >
            <span className="text-[9px] uppercase text-tertiary">Avg Speed</span>
            <span className="text-lg font-bold text-primary">{avgWpm}</span>
          </div>

          <div
            className="p-2 rounded border flex flex-col"
            style={{
              backgroundColor: 'var(--color-bg-page)',
              borderColor: 'var(--color-border)',
            }}
          >
            <span className="text-[9px] uppercase text-tertiary">Accuracy</span>
            <span className="text-lg font-bold text-primary">{avgAccuracy}%</span>
          </div>
        </div>

        {/* Progress Bar Chart */}
        <div className="w-full">
          <TypingProgressBarChart results={history} height={180} />
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            // Trigger keyboard shortcut event or custom event for opening typing mode
            window.dispatchEvent(new CustomEvent('open-typing-mode'));
          }}
          className="w-full py-2 px-3 rounded text-xs font-bold transition-colors border cursor-pointer flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8" />
          </svg>
          <span>Start Screen Typing Test</span>
          <span className="text-[10px] text-tertiary font-mono">(Shift + T)</span>
        </button>
      </div>
    </WidgetShell>
  );
}
