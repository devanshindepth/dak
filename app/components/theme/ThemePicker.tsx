'use client';

import { useTheme } from './ThemeProvider';

export function ThemePicker() {
  const { currentPreset, setPreset } = useTheme();

  const toggleTheme = () => {
    setPreset(currentPreset === 'slate' ? 'snow' : 'slate');
  };

  return (
    <button
      className="theme-picker-btn flex items-center gap-2 px-3 py-1.5 rounded-md border border-subtle hover:border-text-secondary transition-all text-xs font-medium"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${currentPreset === 'slate' ? 'Snow' : 'Slate'} theme (Shortcut: T)`}
    >
      {currentPreset === 'slate' ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <span>Snow</span>
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <span>Slate</span>
        </>
      )}
    </button>
  );
}
