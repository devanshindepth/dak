'use client';

import React from 'react';
import { HTMLWidgetConfig } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

export default function HTMLWidget({ config }: { config: HTMLWidgetConfig }) {
  return (
    <WidgetShell
      title={config.title}
      titleUrl={config.titleUrl}
      hideHeader={config.hideHeader}
    >
      <div
        className="text-xs text-primary leading-relaxed"
        dangerouslySetInnerHTML={{ __html: config.source }}
      />
    </WidgetShell>
  );
}
