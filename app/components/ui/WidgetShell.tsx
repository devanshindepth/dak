'use client';

import React from 'react';

interface WidgetShellProps {
  title?: string;
  subtitle?: string;
  titleUrl?: string;
  hideHeader?: boolean;
  error?: boolean;
  loading?: boolean;
  cssClass?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export function WidgetShell({
  title,
  subtitle,
  titleUrl,
  hideHeader = false,
  error = false,
  loading = false,
  cssClass = '',
  headerAction,
  children,
}: WidgetShellProps) {
  return (
    <div className={`widget ${cssClass}`}>
      {!hideHeader && title && (
        <div className="widget-header">
          {titleUrl ? (
            <a href={titleUrl} target="_blank" rel="noopener noreferrer" className="widget-title">
              {title}
              {subtitle && <span className="text-[10px] opacity-60 ml-1 font-normal">({subtitle})</span>}
            </a>
          ) : (
            <span className="widget-title">
              {title}
              {subtitle && <span className="text-[10px] opacity-60 ml-1 font-normal">({subtitle})</span>}
            </span>
          )}
          <div className="widget-header-actions">
            {headerAction}
            {error && <div className="widget-error-dot" title="Failed to update data" />}
          </div>
        </div>
      )}
      <div className={`widget-content ${hideHeader ? 'widget-content-flush' : ''}`}>
        {loading ? (
          <div className="skeleton-container py-2">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default WidgetShell;
