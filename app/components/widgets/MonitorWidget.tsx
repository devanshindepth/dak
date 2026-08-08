'use client';

import React, { useEffect, useState } from 'react';
import { MonitorWidgetConfig, MonitorSite } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

interface SiteStatus extends MonitorSite {
  status: 'online' | 'offline' | 'checking';
  responseTime?: number;
}

export default function MonitorWidget({ config }: { config: MonitorWidgetConfig }) {
  const [sites, setSites] = useState<SiteStatus[]>(() =>
    (config.sites || []).map((s) => ({ ...s, status: 'checking' }))
  );

  useEffect(() => {
    let isMounted = true;

    async function checkSites() {
      const updated = await Promise.all(
        (config.sites || []).map(async (site) => {
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
  }, [config]);

  return (
    <WidgetShell
      title={config.title || 'Monitor'}
      titleUrl={config.titleUrl}
      hideHeader={config.hideHeader}
    >
      <div className="flex flex-col gap-1.5">
        {sites.map((site, i) => (
          <div key={i} className="flex items-center justify-between py-1 border-b border-subtle last:border-b-0">
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary hover:underline truncate max-w-[200px]"
            >
              {site.title}
            </a>
            <div className="flex items-center gap-2">
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
        ))}
      </div>
    </WidgetShell>
  );
}
