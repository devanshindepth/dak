'use client';

import React, { useState } from 'react';
import { GitHubCalendar } from 'react-github-calendar';
import 'react-github-calendar/tooltips.css';
import WidgetShell from '@/app/components/ui/WidgetShell';
import { useTheme } from '@/app/components/theme/ThemeProvider';

interface GitHubHeatmapWidgetProps {
  config: {
    title?: string;
    id?: string;
    username?: string;
  };
}

export default function GitHubHeatmapWidget({ config }: GitHubHeatmapWidgetProps) {
  const { isLight } = useTheme();

  const [username, setUsername] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-github-username-${config.id || 'default'}`);
      if (saved) return saved;
    }
    return config.username || 'devanshindepth';
  });

  const [inputUser, setInputUser] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  const handleUserChange = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputUser.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    if (!clean) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dak-github-username-${config.id || 'default'}`, clean);
    }
    setUsername(clean);
    setInputUser('');
    setShowEdit(false);
  };

  return (
    <WidgetShell
      title={config.title || `GitHub Activity: ${username}`}
      titleUrl={`https://github.com/${username}`}
      headerAction={
        <button
          onClick={() => setShowEdit(!showEdit)}
          className="text-[11px] font-semibold text-tertiary hover:text-primary transition-colors cursor-pointer"
        >
          {showEdit ? 'Close' : 'Change User'}
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {showEdit && (
          <form onSubmit={handleUserChange} className="flex gap-2 p-2 rounded border border-subtle bg-subtle">
            <input
              type="text"
              placeholder="GitHub username (e.g. torvalds)"
              className="flex-1 px-2.5 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
              value={inputUser}
              onChange={(e) => setInputUser(e.target.value)}
              required
            />
            <button
              type="submit"
              className="px-3 py-1 text-xs font-semibold bg-primary text-background rounded cursor-pointer"
            >
              Set
            </button>
          </form>
        )}

        <div className="overflow-x-auto pb-1 no-scrollbar border border-subtle p-3.5 rounded bg-subtle/30 flex justify-center">
          <GitHubCalendar
            username={username}
            year="last"
            colorScheme={isLight ? 'light' : 'dark'}
            theme={{
              light: ['#f4f4f5', '#e4e4e7', '#a1a1aa', '#52525b', '#18181b'],
              dark: ['#18181b', '#27272a', '#52525b', '#a1a1aa', '#f4f4f5'],
            }}
            showWeekdayLabels={false}
            showMonthLabels={false}
            weekStart={1}
            blockSize={11}
            blockMargin={3}
            blockRadius={2}
            fontSize={11}
            labels={{
              totalCount: '{{count}} contributions in last year',
            }}
            tooltips={{
              activity: {
                text: (act) =>
                  `${act.count === 0 ? 'No' : act.count} contribution${act.count === 1 ? '' : 's'} on ${act.date}`,
              },
            }}
            errorMessage="Could not load contribution data."
          />
        </div>
      </div>
    </WidgetShell>
  );
}
