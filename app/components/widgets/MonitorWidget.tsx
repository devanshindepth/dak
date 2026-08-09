'use client';

import React, { useEffect, useState } from 'react';
import { MonitorWidgetConfig, MonitorSite } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

interface SiteStatus extends MonitorSite {
  status: 'online' | 'offline' | 'checking';
  responseTime?: number;
}

export default function MonitorWidget({ config }: { config: MonitorWidgetConfig }) {
  const [monitoredSites, setMonitoredSites] = useState<MonitorSite[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-monitor-sites-${config.id || 'default'}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return config.sites || [
      { title: 'dport', url: 'https://dport-one.vercel.app/' },
    ];
  });

  const [sites, setSites] = useState<SiteStatus[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dak-monitor-sites-${config.id || 'default'}`, JSON.stringify(monitoredSites));
    }
  }, [monitoredSites, config.id]);

  useEffect(() => {
    let isMounted = true;

    async function checkSites() {
      const updated = await Promise.all(
        monitoredSites.map(async (site) => {
          const startTime = Date.now();
          try {
            // Using HEAD request / no-cors mode to ping
            await fetch(site.url, { method: 'HEAD', mode: 'no-cors' });
            return {
              ...site,
              status: 'online' as const,
              responseTime: Date.now() - startTime,
            };
          } catch {
            return {
              ...site,
              status: 'offline' as const,
            };
          }
        })
      );

      if (isMounted) {
        setSites(updated);
      }
    }

    checkSites();
    const interval = setInterval(checkSites, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [monitoredSites]);

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    let url = newUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    const title = newTitle.trim() || new URL(url).hostname;
    setMonitoredSites([...monitoredSites, { title, url }]);
    setNewTitle('');
    setNewUrl('');
    setShowAddForm(false);
  };

  const handleRemoveSite = (urlToRemove: string) => {
    setMonitoredSites(monitoredSites.filter((s) => s.url !== urlToRemove));
  };

  return (
    <WidgetShell
      title={config.title || 'Project Status Monitor'}
      titleUrl={config.titleUrl}
      hideHeader={config.hideHeader}
      headerAction={
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-[11px] font-semibold text-tertiary hover:text-primary transition-colors cursor-pointer"
        >
          {showAddForm ? '✕ Close' : '+ Add URL'}
        </button>
      }
    >
      <div className="flex flex-col gap-2">
        {showAddForm && (
          <form onSubmit={handleAddSite} className="flex flex-col gap-2 p-2.5 rounded border border-subtle bg-subtle mb-1">
            <input
              type="text"
              placeholder="Status URL (e.g. https://myproject.com)"
              className="px-2.5 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Title (Optional)"
                className="flex-1 px-2.5 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <button type="submit" className="px-3 py-1 text-xs font-semibold bg-primary text-background rounded cursor-pointer">
                Add
              </button>
            </div>
          </form>
        )}

        {sites.length === 0 ? (
          <div className="text-xs text-tertiary text-center py-3">No endpoints configured.</div>
        ) : (
          sites.map((site, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-subtle last:border-b-0 group">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => handleRemoveSite(site.url)}
                  className="text-[10px] text-tertiary hover:text-negative opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove endpoint"
                >
                  ✕
                </button>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-primary hover:underline truncate max-w-[200px]"
                >
                  {site.title}
                </a>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {site.responseTime && site.status === 'online' && (
                  <span className="text-[10px] font-mono text-tertiary">{site.responseTime}ms</span>
                )}
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    site.status === 'online'
                      ? 'bg-emerald-500'
                      : site.status === 'offline'
                      ? 'bg-rose-500'
                      : 'bg-zinc-500 animate-pulse'
                  }`}
                  title={site.status}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </WidgetShell>
  );
}

