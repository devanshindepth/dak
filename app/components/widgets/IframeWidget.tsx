'use client';

import React from 'react';
import { IframeWidgetConfig } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

export default function IframeWidget({ config }: { config: IframeWidgetConfig }) {
  return (
    <WidgetShell
      title={config.title || 'Embed'}
      titleUrl={config.titleUrl || config.url}
      hideHeader={config.hideHeader}
    >
      <iframe
        src={config.url}
        style={{ height: config.height || 300, width: '100%', border: 'none', borderRadius: 6 }}
        title={config.title || 'Embed'}
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </WidgetShell>
  );
}
