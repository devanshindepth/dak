'use client';

import React from 'react';
import { SplitColumnWidgetConfig } from '@/app/types/dashboard';

interface SplitColumnWidgetProps {
  config: SplitColumnWidgetConfig;
  renderWidget?: (config: any, key: string) => React.ReactNode;
}

export default function SplitColumnWidget({ config, renderWidget }: SplitColumnWidgetProps) {
  const [leftWidgets, rightWidgets] = config.widgets || [[], []];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        {leftWidgets.map((w, idx) => renderWidget && renderWidget(w, `split-left-${idx}`))}
      </div>
      <div className="flex flex-col gap-4">
        {rightWidgets.map((w, idx) => renderWidget && renderWidget(w, `split-right-${idx}`))}
      </div>
    </div>
  );
}
