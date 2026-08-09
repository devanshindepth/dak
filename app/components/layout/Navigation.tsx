'use client';

import { PageConfig, BrandingConfig } from '@/app/types/dashboard';
import { ThemePicker } from '../theme/ThemePicker';

interface NavigationProps {
  pages: PageConfig[];
  activePage: number;
  onPageChange: (index: number) => void;
  branding?: BrandingConfig;
  onOpenKeybindings: () => void;
  onOpenTypingMode?: () => void;
  onOpenAiSearch?: () => void;
  onOpenAiDashboardModal?: () => void;
  onDeleteCustomPage?: (index: number) => void;
}

export function Navigation({
  pages,
  activePage,
  onPageChange,
  branding,
  onOpenKeybindings,
  onOpenTypingMode,
  onOpenAiSearch,
  onOpenAiDashboardModal,
  onDeleteCustomPage,
}: NavigationProps) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          <a
            href="#"
            className="nav-logo shrink-0"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(0);
            }}
          >
            {branding?.appName || 'Dak'}
          </a>

          <ul className="nav-tabs">
            {pages.map((page, index) => (
              <li key={index} className="flex items-center group">
                <button
                  className="nav-tab"
                  data-active={index === activePage}
                  onClick={() => onPageChange(index)}
                >
                  {page.name}
                </button>
                {(page as PageConfig & { isCustom?: boolean }).isCustom && onDeleteCustomPage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomPage(index);
                    }}
                    className="ml-0.5 px-1 py-0.5 text-[10px] text-tertiary hover:text-negative opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove custom section"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-right flex items-center gap-2 shrink-0">
          {onOpenAiSearch && (
            <button
              onClick={onOpenAiSearch}
              className="px-2.5 py-1 rounded text-xs text-secondary hover:text-primary transition-colors border border-subtle flex items-center gap-1.5 cursor-pointer bg-[var(--color-bg-subtle)]"
              title="AI Search (/)"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span className="font-semibold">AI Search</span>
            </button>
          )}

          {onOpenAiDashboardModal && (
            <button
              onClick={onOpenAiDashboardModal}
              className="px-2.5 py-1 rounded text-xs font-semibold text-[var(--color-bg-page)] bg-[var(--color-text-primary)] hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
              title="Build Custom Dashboard Section with AI"
            >
              <span className="font-bold">+</span>
              <span>AI Section</span>
            </button>
          )}

          {onOpenTypingMode && (
            <button
              onClick={onOpenTypingMode}
              className="px-2 py-1 rounded text-xs text-tertiary hover:text-primary transition-colors border border-subtle flex items-center gap-1.5 cursor-pointer"
              title="Screen Typing Mode (Shift + T)"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M18 12h.01M8 16h8" />
              </svg>
              <span className="hidden lg:inline font-medium">Typing</span>
            </button>
          )}

          <button
            onClick={onOpenKeybindings}
            className="px-2 py-1 rounded text-xs text-tertiary hover:text-primary transition-colors border border-subtle flex items-center gap-1 cursor-pointer"
            title="Keyboard shortcuts (?)"
          >
            <span className="font-mono text-[10px] font-bold">?</span>
          </button>

          <ThemePicker />
        </div>
      </div>
    </nav>
  );
}
