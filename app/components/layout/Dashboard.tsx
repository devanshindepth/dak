'use client';

import { useState, useEffect } from 'react';
import { DashboardConfig, PageConfig } from '@/app/types/dashboard';
import { Navigation } from './Navigation';
import { Column } from './Column';
import { renderWidget } from '../widgets';
import { KeybindingsModal } from '../ui/KeybindingsModal';
import { TypingModeModal } from '../ui/TypingModeModal';
import { AISearchModal } from '../ui/AISearchModal';
import { AIDashboardModal } from '../ui/AIDashboardModal';
import { useTheme } from '../theme/ThemeProvider';

interface DashboardProps {
  config: DashboardConfig;
}

export function Dashboard({ config }: DashboardProps) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isKeybindingsOpen, setIsKeybindingsOpen] = useState(false);
  const [isTypingModeOpen, setIsTypingModeOpen] = useState(false);
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
  const [isAiDashboardOpen, setIsAiDashboardOpen] = useState(false);
  const [customPages, setCustomPages] = useState<PageConfig[]>([]);

  const { currentPreset, setPreset } = useTheme();

  // Load custom pages from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dak_custom_pages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCustomPages(parsed.map((p) => ({ ...p, isCustom: true })));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save custom pages to localStorage
  const saveCustomPages = (newPages: PageConfig[]) => {
    setCustomPages(newPages);
    try {
      localStorage.setItem('dak_custom_pages', JSON.stringify(newPages));
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleAddCustomPage = (newPage: PageConfig) => {
    const pageWithCustomFlag = { ...newPage, isCustom: true };
    const updated = [...customPages, pageWithCustomFlag];
    saveCustomPages(updated);
    // Switch to the newly created page
    const totalPages = config.pages.length + updated.length;
    setActivePageIndex(totalPages - 1);
  };

  const handleDeleteCustomPage = (pageIndexToDelete: number) => {
    const defaultCount = config.pages.length;
    const customIndexToDelete = pageIndexToDelete - defaultCount;
    if (customIndexToDelete >= 0 && customIndexToDelete < customPages.length) {
      const updated = customPages.filter((_, idx) => idx !== customIndexToDelete);
      saveCustomPages(updated);
      if (activePageIndex >= defaultCount + updated.length) {
        setActivePageIndex(Math.max(0, defaultCount + updated.length - 1));
      }
    }
  };

  useEffect(() => {
    function handleOpenTypingMode() {
      setIsTypingModeOpen(true);
    }

    window.addEventListener('open-typing-mode', handleOpenTypingMode);
    return () => window.removeEventListener('open-typing-mode', handleOpenTypingMode);
  }, []);

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

      if (e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsTypingModeOpen((prev) => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        setIsAiSearchOpen(true);
      } else if (e.key.toLowerCase() === 't' && !e.shiftKey) {
        e.preventDefault();
        setPreset(currentPreset === 'slate' ? 'snow' : 'slate');
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        const bookmarkInput = document.getElementById('bookmark-search-input');
        if (bookmarkInput) bookmarkInput.focus();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsKeybindingsOpen(true);
      } else if (e.key === 'Escape') {
        setIsKeybindingsOpen(false);
        setIsTypingModeOpen(false);
        setIsAiSearchOpen(false);
        setIsAiDashboardOpen(false);
      } else if (/^[1-9]$/.test(e.key)) {
        const totalPages = config.pages.length + customPages.length;
        const pageIdx = parseInt(e.key, 10) - 1;
        if (pageIdx < totalPages) {
          e.preventDefault();
          setActivePageIndex(pageIdx);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPreset, setPreset, config.pages.length, customPages.length]);

  const allPages = [...config.pages, ...customPages];
  const activePage = allPages[activePageIndex] || allPages[0];

  if (!activePage) {
    return <div className="p-8 text-center">No pages configured.</div>;
  }

  const gridTemplate = activePage.columns
    .map((col) => (col.size === 'small' ? 'var(--column-small-width)' : '1fr'))
    .join(' ');

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation
        pages={allPages}
        activePage={activePageIndex}
        onPageChange={setActivePageIndex}
        branding={config.branding}
        onOpenKeybindings={() => setIsKeybindingsOpen(true)}
        onOpenTypingMode={() => setIsTypingModeOpen(true)}
        onOpenAiSearch={() => setIsAiSearchOpen(true)}
        onOpenAiDashboardModal={() => setIsAiDashboardOpen(true)}
        onDeleteCustomPage={handleDeleteCustomPage}
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

      <TypingModeModal
        isOpen={isTypingModeOpen}
        onClose={() => setIsTypingModeOpen(false)}
      />

      <AISearchModal
        isOpen={isAiSearchOpen}
        onClose={() => setIsAiSearchOpen(false)}
      />

      <AIDashboardModal
        isOpen={isAiDashboardOpen}
        onClose={() => setIsAiDashboardOpen(false)}
        onAddPage={handleAddCustomPage}
      />
    </div>
  );
}
