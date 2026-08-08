'use client';

import React, { useEffect, useState } from 'react';
import { CustomAPIWidgetConfig } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

export default function CustomAPIWidget({ config }: { config: CustomAPIWidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchApi() {
      try {
        const res = await fetch(config.url, {
          method: config.method || 'GET',
          headers: config.headers,
        });
        if (!res.ok) throw new Error('Fetch failed');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchApi();
  }, [config]);

  return (
    <WidgetShell
      title={config.title || 'API Endpoint'}
      titleUrl={config.titleUrl || config.url}
      hideHeader={config.hideHeader}
      error={error}
      loading={loading}
    >
      <pre className="text-[11px] font-mono p-2 rounded bg-subtle overflow-x-auto text-secondary max-h-[250px]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </WidgetShell>
  );
}
