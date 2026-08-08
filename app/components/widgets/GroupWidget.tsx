'use client';

import React, { useState } from 'react';
import { GroupWidgetConfig } from '@/app/types/dashboard';

interface GroupWidgetProps {
  config: GroupWidgetConfig;
  renderWidget?: (config: any, key: string) => React.ReactNode;
}

export default function GroupWidget({ config, renderWidget }: GroupWidgetProps) {
  const [activeTab, setActiveTab] = useState(0);

  const widgets = config.widgets || [];
  const activeWidget = widgets[activeTab];

  return (
    <div className="widget">
      <div className="flex items-center gap-1 border-b border-subtle px-3 pt-2">
        {widgets.map((w, idx) => (
          <button
            key={idx}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-t ${
              idx === activeTab
                ? 'text-primary bg-subtle border-b-2 border-primary'
                : 'text-tertiary hover:text-secondary'
            }`}
            onClick={() => setActiveTab(idx)}
          >
            {w.title || w.type}
          </button>
        ))}
      </div>

      <div className="p-0">
        {activeWidget && renderWidget && renderWidget({ ...activeWidget, hideHeader: true }, `group-tab-${activeTab}`)}
      </div>
    </div>
  );
}
