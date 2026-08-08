'use client';

import { PageConfig, BrandingConfig } from '@/app/types/dashboard';
import { ThemePicker } from '../theme/ThemePicker';

interface NavigationProps {
  pages: PageConfig[];
  activePage: number;
  onPageChange: (index: number) => void;
  branding?: BrandingConfig;
  onOpenKeybindings: () => void;
}

export function Navigation({ pages, activePage, onPageChange, branding, onOpenKeybindings }: NavigationProps) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="flex items-center gap-6">
          <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); onPageChange(0); }}>
            {branding?.appName || 'Dak'}
          </a>
          
          <ul className="nav-tabs">
            {pages.map((page, index) => (
              <li key={index}>
                <button
                  className="nav-tab"
                  data-active={index === activePage}
                  onClick={() => onPageChange(index)}
                >
                  {page.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="nav-right">
          <button
            onClick={onOpenKeybindings}
            className="px-2 py-1 rounded text-xs text-tertiary hover:text-primary transition-colors border border-subtle flex items-center gap-1"
            title="Keyboard shortcuts (?)"
          >
            <span className="font-mono text-[10px] font-bold">?</span>
            <span className="hidden sm:inline">Shortcuts</span>
          </button>
          <ThemePicker />
        </div>
      </div>
    </nav>
  );
}
