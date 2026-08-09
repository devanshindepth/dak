import React from 'react';
import { WidgetConfig } from '@/app/types/dashboard';
import BookmarksWidget from './BookmarksWidget';
import CalendarWidget from './CalendarWidget';
import ClockWidget from './ClockWidget';
import HackerNewsWidget from './HackerNewsWidget';
import RSSWidget from './RSSWidget';
import SearchWidget from './SearchWidget';
import TodoWidget from './TodoWidget';
import WeatherWidget from './WeatherWidget';
import RedditWidget from './RedditWidget';
import MarketsWidget from './MarketsWidget';
import ReleasesWidget from './ReleasesWidget';
import RepositoryWidget from './RepositoryWidget';
import VideosWidget from './VideosWidget';
import MonitorWidget from './MonitorWidget';
import IframeWidget from './IframeWidget';
import HTMLWidget from './HTMLWidget';
import CustomAPIWidget from './CustomAPIWidget';
import GroupWidget from './GroupWidget';
import SplitColumnWidget from './SplitColumnWidget';
import CodeforcesWidget from './CodeforcesWidget';
import LeetCodeWidget from './LeetCodeWidget';
import ToolsWidget from './ToolsWidget';
import StockNewsWidget from './StockNewsWidget';
import ProjectTrackerWidget from './ProjectTrackerWidget';
import TypingProgressWidget from './TypingProgressWidget';
import ScrapedListWidget from './ScrapedListWidget';
import AiBenchmarkWidget from './AiBenchmarkWidget';
import GitHubHeatmapWidget from './GitHubHeatmapWidget';

export const widgetRegistry: Record<string, React.ComponentType<{ config: any; renderWidget?: any }>> = {
  'bookmarks': BookmarksWidget,
  'calendar': CalendarWidget,
  'clock': ClockWidget,
  'hacker-news': HackerNewsWidget,
  'rss': RSSWidget,
  'search': SearchWidget,
  'todo': TodoWidget,
  'weather': WeatherWidget,
  'reddit': RedditWidget,
  'markets': MarketsWidget,
  'releases': ReleasesWidget,
  'repository': RepositoryWidget,
  'videos': VideosWidget,
  'monitor': MonitorWidget,
  'iframe': IframeWidget,
  'html': HTMLWidget,
  'custom-api': CustomAPIWidget,
  'group': GroupWidget,
  'split-column': SplitColumnWidget,
  'codeforces': CodeforcesWidget,
  'leetcode': LeetCodeWidget,
  'tools': ToolsWidget,
  'stock-news': StockNewsWidget,
  'project-tracker': ProjectTrackerWidget,
  'typing-progress': TypingProgressWidget,
  'scraped-list': ScrapedListWidget,
  'ai-benchmark': AiBenchmarkWidget,
  'github-heatmap': GitHubHeatmapWidget,
};

export function renderWidget(config: WidgetConfig, key: string) {
  const Component = widgetRegistry[config.type];
  if (!Component) {
    return (
      <div key={key} className="widget p-4 text-xs text-secondary">
        Widget type &quot;{config.type}&quot; not implemented yet
      </div>
    );
  }
  return <Component key={key} config={config} renderWidget={renderWidget} />;
}
