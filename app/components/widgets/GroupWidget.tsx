'use client';

import React, { useState, useEffect } from 'react';
import { GroupWidgetConfig, WidgetConfig } from '@/app/types/dashboard';

interface GroupWidgetProps {
  config: GroupWidgetConfig;
  renderWidget?: (config: any, key: string) => React.ReactNode;
}

export default function GroupWidget({ config, renderWidget }: GroupWidgetProps) {
  const [widgetsList, setWidgetsList] = useState<WidgetConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-group-widgets-${config.id || 'default'}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return config.widgets || [];
  });

  const [activeTab, setActiveTab] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'subreddit' | 'blog'>('subreddit');
  const [inputValue, setInputValue] = useState('');
  const [titleValue, setTitleValue] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dak-group-widgets-${config.id || 'default'}`, JSON.stringify(widgetsList));
    }
  }, [widgetsList, config.id]);

  const handleAddTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    let newWidget: WidgetConfig;
    if (addType === 'subreddit') {
      const subName = inputValue.trim().replace(/^r\//, '');
      newWidget = {
        type: 'reddit',
        id: `custom-reddit-${Date.now()}`,
        title: `r/${subName}`,
        subreddit: subName,
        showThumbnails: true,
        limit: 10,
        collapseAfter: 5,
      };
    } else {
      newWidget = {
        type: 'rss',
        id: `custom-rss-${Date.now()}`,
        title: titleValue.trim() || 'Blog Feed',
        style: 'vertical-list',
        limit: 12,
        collapseAfter: 5,
        feeds: [
          {
            url: inputValue.trim(),
            title: titleValue.trim() || undefined,
          },
        ],
      };
    }

    const updated = [...widgetsList, newWidget];
    setWidgetsList(updated);
    setActiveTab(updated.length - 1);
    setInputValue('');
    setTitleValue('');
    setShowAddModal(false);
  };

  const handleRemoveTab = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (widgetsList.length <= 1) return;
    const updated = widgetsList.filter((_, idx) => idx !== index);
    setWidgetsList(updated);
    if (activeTab >= updated.length) {
      setActiveTab(Math.max(0, updated.length - 1));
    }
  };

  const activeWidget = widgetsList[activeTab] || widgetsList[0];

  return (
    <div className="widget">
      <div className="flex items-center justify-between border-b border-subtle px-3 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {widgetsList.map((w, idx) => (
            <div key={idx} className="flex items-center group relative">
              <button
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-t cursor-pointer ${
                  idx === activeTab
                    ? 'text-primary bg-subtle border-b-2 border-primary'
                    : 'text-tertiary hover:text-secondary'
                }`}
                onClick={() => setActiveTab(idx)}
              >
                {w.title || w.type}
              </button>
              {widgetsList.length > 1 && (
                <button
                  onClick={(e) => handleRemoveTab(e, idx)}
                  className="px-1 text-[10px] text-tertiary hover:text-negative opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove tab"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="text-[11px] font-semibold text-tertiary hover:text-primary transition-colors px-2 py-1 border border-subtle rounded shrink-0 mb-1 cursor-pointer"
          title="Add Subreddit or Blog"
        >
          {showAddModal ? '✕ Close' : '+ Add Tab'}
        </button>
      </div>

      {showAddModal && (
        <form onSubmit={handleAddTab} className="p-3 border-b border-subtle bg-subtle/50 flex flex-col gap-2">
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-secondary">Tab Type:</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="tabType"
                value="subreddit"
                checked={addType === 'subreddit'}
                onChange={() => setAddType('subreddit')}
              />
              <span>Subreddit</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="tabType"
                value="blog"
                checked={addType === 'blog'}
                onChange={() => setAddType('blog')}
              />
              <span>Blog / RSS Feed</span>
            </label>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={addType === 'subreddit' ? 'Subreddit name (e.g. selfhosted, homelab)' : 'RSS / Atom Feed URL'}
              className="flex-1 px-2.5 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              required
            />
            {addType === 'blog' && (
              <input
                type="text"
                placeholder="Title (Optional)"
                className="w-1/3 px-2.5 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
              />
            )}
            <button
              type="submit"
              className="px-3 py-1 text-xs font-semibold bg-primary text-background rounded cursor-pointer hover:opacity-90"
            >
              Add
            </button>
          </div>
        </form>
      )}

      <div className="p-0">
        {activeWidget && renderWidget && renderWidget({ ...activeWidget, hideHeader: true }, `group-tab-${activeTab}`)}
      </div>
    </div>
  );
}

