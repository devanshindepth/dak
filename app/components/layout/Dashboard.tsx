'use client';

import { useState, useEffect } from 'react';
import { DashboardConfig } from '@/app/types/dashboard';
import { Navigation } from './Navigation';
import { Column } from './Column';
import { renderWidget } from '../widgets';
import { KeybindingsModal } from '../ui/KeybindingsModal';
import { useTheme } from '../theme/ThemeProvider';

interface DashboardProps {
  config: DashboardConfig;
}

export function Dashboard({ config }: DashboardProps) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isKeybindingsOpen, setIsKeybindingsOpen] = useState(false);
  const { currentPreset, setPreset } = useTheme();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape') {
          (target as HTMLInputElement).blur();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('ai-search-input');
        if (searchInput) searchInput.focus();
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setPreset(currentPreset === 'slate' ? 'snow' : 'slate');
      } else if (e.key === '?') {
        e.preventDefault();
        setIsKeybindingsOpen(true);
      } else if (e.key === 'Escape') {
        setIsKeybindingsOpen(false);
      } else if (/^[1-9]$/.test(e.key)) {
        const pageIdx = parseInt(e.key, 10) - 1;
        if (pageIdx < config.pages.length) {
          e.preventDefault();
          setActivePageIndex(pageIdx);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPreset, setPreset, config.pages.length]);

  const activePage = config.pages[activePageIndex] || config.pages[0];
  if (!activePage) {
    return <div className="p-8 text-center">No pages configured.</div>;
  }

  const gridTemplate = activePage.columns
    .map((col) => (col.size === 'small' ? 'var(--column-small-width)' : '1fr'))
    .join(' ');

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation
        pages={config.pages}
        activePage={activePageIndex}
        onPageChange={setActivePageIndex}
        branding={config.branding}
        onOpenKeybindings={() => setIsKeybindingsOpen(true)}
      />

      <main
        className="dashboard"
        data-width={activePage.width || 'default'}
        data-center={activePage.centerVertically ? 'true' : 'false'}
      >
        {activePage.showMobileHeader && (
          <h1 className="mobile-page-header">{activePage.name}</h1>
        )}

        {activePage.headWidgets && activePage.headWidgets.length > 0 && (
          <div className="dashboard-head-widgets">
            {activePage.headWidgets.map((widgetConfig, idx) =>
              renderWidget(widgetConfig, `head-${idx}`)
            )}
          </div>
        )}

        <div
          className="dashboard-columns"
          style={{ '--grid-template': gridTemplate } as React.CSSProperties}
        >
          {activePage.columns.map((columnConfig, colIdx) => (
            <Column key={colIdx}>
              {columnConfig.widgets.map((widgetConfig, wIdx) =>
                renderWidget(widgetConfig, `col-${colIdx}-w-${wIdx}`)
              )}
            </Column>
          ))}
        </div>
      </main>

      <KeybindingsModal
        isOpen={isKeybindingsOpen}
        onClose={() => setIsKeybindingsOpen(false)}
      />
    </div>
  );
}
