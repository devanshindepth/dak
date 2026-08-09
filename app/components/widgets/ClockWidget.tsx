'use client';

import React, { useState, useEffect } from 'react';
import { ClockWidgetConfig, ClockTimezone } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

export default function ClockWidget({ config }: { config: ClockWidgetConfig }) {
  const [time, setTime] = useState(new Date());

  const [hourFormat, setHourFormat] = useState<'12h' | '24h'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-clock-format-${config.id || 'default'}`);
      if (saved === '12h' || saved === '24h') return saved;
    }
    return config.hourFormat || '12h';
  });

  const [timezones, setTimezones] = useState<ClockTimezone[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-clock-tz-${config.id || 'default'}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
    }
    return config.timezones || [
      { timezone: 'America/New_York', label: 'New York' },
      { timezone: 'Europe/London', label: 'London' },
      { timezone: 'Asia/Kolkata', label: 'India' },
      { timezone: 'Asia/Tokyo', label: 'Tokyo' },
    ];
  });

  const [showSettings, setShowSettings] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTimezone, setNewTimezone] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dak-clock-format-${config.id || 'default'}`, hourFormat);
      localStorage.setItem(`dak-clock-tz-${config.id || 'default'}`, JSON.stringify(timezones));
    }
  }, [hourFormat, timezones, config.id]);

  const is12h = hourFormat === '12h';

  const timeString = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: is12h,
  });

  const [timePart, ampmPart] = timeString.split(' ');

  const dateString = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleAddTimezone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimezone.trim()) return;
    const label = newLabel.trim() || newTimezone.trim();
    setTimezones([...timezones, { label, timezone: newTimezone.trim() }]);
    setNewLabel('');
    setNewTimezone('');
  };

  const handleRemoveTimezone = (idxToRemove: number) => {
    setTimezones(timezones.filter((_, idx) => idx !== idxToRemove));
  };

  return (
    <WidgetShell
      title={config.title || 'World Clock'}
      titleUrl={config.titleUrl}
      hideHeader={config.hideHeader}
      headerAction={
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-[11px] font-semibold text-tertiary hover:text-primary transition-colors cursor-pointer"
        >
          {showSettings ? '✕ Close' : '⚙ Edit Clock'}
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {showSettings && (
          <div className="flex flex-col gap-2.5 p-3 rounded border border-subtle bg-subtle/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-secondary">Time Format:</span>
              <div className="flex items-center gap-1.5 bg-input border border-subtle rounded p-0.5">
                <button
                  onClick={() => setHourFormat('12h')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    is12h ? 'bg-primary text-background' : 'text-tertiary hover:text-primary'
                  }`}
                >
                  12-Hour
                </button>
                <button
                  onClick={() => setHourFormat('24h')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    !is12h ? 'bg-primary text-background' : 'text-tertiary hover:text-primary'
                  }`}
                >
                  24-Hour
                </button>
              </div>
            </div>

            <form onSubmit={handleAddTimezone} className="flex flex-col gap-2 pt-2 border-t border-subtle">
              <span className="font-semibold text-secondary">Add World Timezone:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. Paris)"
                  className="w-1/3 px-2 py-1 bg-input border border-subtle rounded text-primary focus:outline-none"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Timezone ID (e.g. Europe/Paris, UTC)"
                  className="flex-1 px-2 py-1 bg-input border border-subtle rounded text-primary focus:outline-none"
                  value={newTimezone}
                  onChange={(e) => setNewTimezone(e.target.value)}
                  required
                />
                <button type="submit" className="px-3 py-1 font-semibold bg-primary text-background rounded cursor-pointer">
                  Add
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={config.cssClass}>
          <div className="clock-main">
            <div className="clock-time">
              {timePart}
              {is12h && ampmPart && <span className="clock-ampm">{ampmPart}</span>}
            </div>
            <div className="clock-date">{dateString}</div>
          </div>

          {timezones.length > 0 && (
            <div className="clock-zones">
              {timezones.map((tz, i) => {
                let tzTime = '--:--';
                try {
                  tzTime = new Intl.DateTimeFormat('en-US', {
                    timeZone: tz.timezone,
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: is12h,
                  }).format(time);
                } catch {
                  tzTime = 'Invalid TZ';
                }

                return (
                  <div key={i} className="clock-zone group relative flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {showSettings && (
                        <button
                          onClick={() => handleRemoveTimezone(i)}
                          className="text-[10px] text-tertiary hover:text-negative cursor-pointer"
                          title="Remove timezone"
                        >
                          ✕
                        </button>
                      )}
                      <div className="clock-zone-label">{tz.label}</div>
                    </div>
                    <div className="clock-zone-time">{tzTime}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}

