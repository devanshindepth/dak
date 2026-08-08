'use client';

import React from 'react';

interface KeybindingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeybindingsModal({ isOpen, onClose }: KeybindingsModalProps) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: 'General & Search',
      items: [
        { key: '/', description: 'Focus AI Search bar' },
        { key: 't', description: 'Toggle Theme (Slate Dark / Snow Light)' },
        { key: '?', description: 'Open Keyboard Shortcuts cheat sheet' },
        { key: 'Esc', description: 'Dismiss modal or clear input focus' },
      ],
    },
    {
      category: 'Page Navigation',
      items: [
        { key: '1 - 9', description: 'Switch between Dashboard tabs' },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="max-w-md w-full p-6 relative rounded-xl shadow-2xl"
        style={{
          backgroundColor: 'var(--color-bg-widget)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between pb-3 mb-4"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-tertiary hover:text-primary transition-colors text-base font-bold px-2 py-0.5 rounded cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-tertiary">
                {group.category}
              </span>
              <div className="flex flex-col gap-2">
                {group.items.map((sc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded"
                    style={{ backgroundColor: 'var(--color-bg-subtle)' }}
                  >
                    <span className="font-medium text-secondary">{sc.description}</span>
                    <kbd
                      className="px-2 py-0.5 font-mono text-[11px] font-bold rounded"
                      style={{
                        backgroundColor: 'var(--color-bg-page)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-5 pt-3 text-center text-[11px] text-tertiary"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          Press <kbd className="font-mono font-bold text-primary">Esc</kbd> anytime to close
        </div>
      </div>
    </div>
  );
}

