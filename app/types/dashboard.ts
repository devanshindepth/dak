// ─── Widget Type Union ───────────────────────────────────────────────
export type WidgetType =
  | "rss"
  | "hacker-news"
  | "lobsters"
  | "reddit"
  | "weather"
  | "markets"
  | "videos"
  | "twitch-channels"
  | "twitch-top-games"
  | "calendar"
  | "clock"
  | "bookmarks"
  | "search"
  | "monitor"
  | "releases"
  | "todo"
  | "docker-containers"
  | "server-stats"
  | "dns-stats"
  | "repository"
  | "iframe"
  | "html"
  | "custom-api"
  | "extension"
  | "group"
  | "split-column"
  | "codeforces"
  | "leetcode"
  | "tools"
  | "stock-news"
  | "project-tracker"
  | "typing-progress"
  | "scraped-list"
  | "ai-benchmark"
  | "github-heatmap";

// ─── Base Widget Config ──────────────────────────────────────────────
export interface BaseWidgetConfig {
  type: WidgetType;
  title?: string;
  titleUrl?: string;
  hideHeader?: boolean;
  cache?: string;
  cssClass?: string;
  id?: string;
}

// ─── Codeforces ──────────────────────────────────────────────────────
export interface CodeforcesWidgetConfig extends BaseWidgetConfig {
  type: "codeforces";
  handle?: string;
  showUpcomingContests?: boolean;
  limitContests?: number;
}

// ─── LeetCode ────────────────────────────────────────────────────────
export interface LeetCodeWidgetConfig extends BaseWidgetConfig {
  type: "leetcode";
  username?: string;
  showDailyChallenge?: boolean;
}

// ─── RSS ─────────────────────────────────────────────────────────────
export interface RSSFeedSource {
  url: string;
  title?: string;
  limit?: number;
}

export interface RSSWidgetConfig extends BaseWidgetConfig {
  type: "rss";
  feeds: RSSFeedSource[];
  limit?: number;
  collapseAfter?: number;
  style?: "vertical-list" | "horizontal-cards" | "detailed-list";
}

// ─── Hacker News ─────────────────────────────────────────────────────
export interface HackerNewsWidgetConfig extends BaseWidgetConfig {
  type: "hacker-news";
  limit?: number;
  collapseAfter?: number;
  sortBy?: "top" | "new" | "best";
}

// ─── Lobsters ────────────────────────────────────────────────────────
export interface LobstersWidgetConfig extends BaseWidgetConfig {
  type: "lobsters";
  limit?: number;
  sortBy?: "hottest" | "newest";
}

// ─── Reddit ──────────────────────────────────────────────────────────
export interface RedditWidgetConfig extends BaseWidgetConfig {
  type: "reddit";
  subreddit: string;
  showThumbnails?: boolean;
  limit?: number;
  sortBy?: "hot" | "new" | "top" | "rising";
  topPeriod?: "hour" | "day" | "week" | "month" | "year" | "all";
  collapseAfter?: number;
}

// ─── Weather ─────────────────────────────────────────────────────────
export interface WeatherWidgetConfig extends BaseWidgetConfig {
  type: "weather";
  location: string;
  latitude?: number;
  longitude?: number;
  units?: "metric" | "imperial";
  hourFormat?: "12h" | "24h";
}

// ─── Markets ─────────────────────────────────────────────────────────
export interface MarketItem {
  symbol: string;
  name: string;
}

export interface MarketsWidgetConfig extends BaseWidgetConfig {
  type: "markets";
  markets: MarketItem[];
  sortBy?: "name" | "value" | "change";
}

// ─── Videos ──────────────────────────────────────────────────────────
export interface VideosWidgetConfig extends BaseWidgetConfig {
  type: "videos";
  channels: string[];
  limit?: number;
  style?: "grid" | "list";
}

// ─── Twitch Channels ─────────────────────────────────────────────────
export interface TwitchChannelsWidgetConfig extends BaseWidgetConfig {
  type: "twitch-channels";
  channels: string[];
}

// ─── Twitch Top Games ────────────────────────────────────────────────
export interface TwitchTopGamesWidgetConfig extends BaseWidgetConfig {
  type: "twitch-top-games";
  limit?: number;
}

// ─── Calendar ────────────────────────────────────────────────────────
export interface CalendarWidgetConfig extends BaseWidgetConfig {
  type: "calendar";
  firstDayOfWeek?: "monday" | "sunday";
}

// ─── Clock ───────────────────────────────────────────────────────────
export interface ClockTimezone {
  timezone: string;
  label: string;
}

export interface ClockWidgetConfig extends BaseWidgetConfig {
  type: "clock";
  hourFormat?: "12h" | "24h";
  timezones?: ClockTimezone[];
}

// ─── Bookmarks ───────────────────────────────────────────────────────
export interface BookmarkLink {
  title: string;
  url: string;
  icon?: string;
}

export interface BookmarkGroup {
  title?: string;
  color?: string;
  links: BookmarkLink[];
}

export interface BookmarksWidgetConfig extends BaseWidgetConfig {
  type: "bookmarks";
  groups: BookmarkGroup[];
}

// ─── Search ──────────────────────────────────────────────────────────
export interface SearchEngine {
  name: string;
  url: string;
  prefix?: string;
}

export interface SearchWidgetConfig extends BaseWidgetConfig {
  type: "search";
  autofocus?: boolean;
  engines?: SearchEngine[];
  enableAiSearch?: boolean;
}

// ─── Monitor ─────────────────────────────────────────────────────────
export interface MonitorSite {
  title: string;
  url: string;
  icon?: string;
  allowInsecure?: boolean;
}

export interface MonitorWidgetConfig extends BaseWidgetConfig {
  type: "monitor";
  sites: MonitorSite[];
}

// ─── Releases ────────────────────────────────────────────────────────
export interface ReleasesWidgetConfig extends BaseWidgetConfig {
  type: "releases";
  repositories: string[];
  limit?: number;
  token?: string;
}

// ─── Todo ────────────────────────────────────────────────────────────
export interface TodoWidgetConfig extends BaseWidgetConfig {
  type: "todo";
}

// ─── Docker Containers ──────────────────────────────────────────────
export interface DockerContainersWidgetConfig extends BaseWidgetConfig {
  type: "docker-containers";
  socketPath?: string;
}

// ─── Server Stats ───────────────────────────────────────────────────
export interface ServerStatsWidgetConfig extends BaseWidgetConfig {
  type: "server-stats";
}

// ─── DNS Stats ──────────────────────────────────────────────────────
export interface DNSStatsWidgetConfig extends BaseWidgetConfig {
  type: "dns-stats";
  url?: string;
  token?: string;
}

// ─── Repository ─────────────────────────────────────────────────────
export interface RepositoryWidgetConfig extends BaseWidgetConfig {
  type: "repository";
  repository: string;
  token?: string;
}

// ─── iframe ─────────────────────────────────────────────────────────
export interface IframeWidgetConfig extends BaseWidgetConfig {
  type: "iframe";
  url: string;
  height?: number;
}

// ─── HTML ───────────────────────────────────────────────────────────
export interface HTMLWidgetConfig extends BaseWidgetConfig {
  type: "html";
  source: string;
}

// ─── Custom API ─────────────────────────────────────────────────────
export interface CustomAPIWidgetConfig extends BaseWidgetConfig {
  type: "custom-api";
  url: string;
  method?: string;
  headers?: Record<string, string>;
  template?: string;
  frameless?: boolean;
}

// ─── Extension ──────────────────────────────────────────────────────
export interface ExtensionWidgetConfig extends BaseWidgetConfig {
  type: "extension";
  url: string;
  allowHtml?: boolean;
}

// ─── Group ──────────────────────────────────────────────────────────
export interface GroupWidgetConfig extends BaseWidgetConfig {
  type: "group";
  widgets: WidgetConfig[];
}

// ─── Split Column ───────────────────────────────────────────────────
export interface SplitColumnWidgetConfig extends BaseWidgetConfig {
  type: "split-column";
  widgets: [WidgetConfig[], WidgetConfig[]];
}

// ─── Scraped List ────────────────────────────────────────────────────
export interface ScrapedListWidgetConfig extends BaseWidgetConfig {
  type: "scraped-list";
  /** The page URL to scrape */
  url: string;
  /** Natural language instruction for what to extract, e.g. "top 5 models by score" */
  prompt: string;
  /** How many items to show (default 5) */
  limit?: number;
  /** Label for the value column header, e.g. "Score" */
  valueLabel?: string;
}

// ─── Typing Progress ────────────────────────────────────────────────
export interface TypingResult {
  id: string;
  timestamp: number;
  wpm: number;
  accuracy: number;
  cpm: number;
  durationSeconds: number;
  sourceCategory: string;
  sourceTitle: string;
}

export interface TypingProgressWidgetConfig extends BaseWidgetConfig {
  type: "typing-progress";
  limitHistory?: number;
}

// ─── AI Benchmark ───────────────────────────────────────────────────
export interface AiBenchmarkWidgetConfig extends BaseWidgetConfig {
  type: "ai-benchmark";
  initialCategory?: string;
}

// ─── GitHub Heatmap ──────────────────────────────────────────────────
export interface GitHubHeatmapWidgetConfig extends BaseWidgetConfig {
  type: "github-heatmap";
  username?: string;
}

// ─── Discriminated Widget Union ──────────────────────────────────────
export type WidgetConfig =
  | RSSWidgetConfig
  | HackerNewsWidgetConfig
  | LobstersWidgetConfig
  | RedditWidgetConfig
  | WeatherWidgetConfig
  | MarketsWidgetConfig
  | VideosWidgetConfig
  | TwitchChannelsWidgetConfig
  | TwitchTopGamesWidgetConfig
  | CalendarWidgetConfig
  | ClockWidgetConfig
  | BookmarksWidgetConfig
  | SearchWidgetConfig
  | MonitorWidgetConfig
  | ReleasesWidgetConfig
  | TodoWidgetConfig
  | DockerContainersWidgetConfig
  | ServerStatsWidgetConfig
  | DNSStatsWidgetConfig
  | RepositoryWidgetConfig
  | IframeWidgetConfig
  | HTMLWidgetConfig
  | CustomAPIWidgetConfig
  | ExtensionWidgetConfig
  | GroupWidgetConfig
  | SplitColumnWidgetConfig
  | CodeforcesWidgetConfig
  | LeetCodeWidgetConfig
  | TypingProgressWidgetConfig
  | ScrapedListWidgetConfig
  | AiBenchmarkWidgetConfig
  | GitHubHeatmapWidgetConfig;

// ─── Layout Config ──────────────────────────────────────────────────
export interface ColumnConfig {
  size: "small" | "full";
  widgets: WidgetConfig[];
}

export interface PageConfig {
  name: string;
  slug?: string;
  width?: "default" | "slim" | "wide";
  centerVertically?: boolean;
  hideDesktopNavigation?: boolean;
  showMobileHeader?: boolean;
  headWidgets?: WidgetConfig[];
  columns: ColumnConfig[];
}

// ─── Theme Config ───────────────────────────────────────────────────
export interface ThemePreset {
  light?: boolean;
  backgroundColor?: string;
  primaryColor?: string;
  positiveColor?: string;
  negativeColor?: string;
  contrastMultiplier?: number;
  textSaturationMultiplier?: number;
}

export interface ThemeConfig extends ThemePreset {
  customCssFile?: string;
  disablePicker?: boolean;
  presets?: Record<string, ThemePreset>;
}

// ─── Branding Config ────────────────────────────────────────────────
export interface BrandingConfig {
  hideFooter?: boolean;
  customFooter?: string;
  logoText?: string;
  logoUrl?: string;
  faviconUrl?: string;
  appName?: string;
  appIconUrl?: string;
  appBackgroundColor?: string;
}

// ─── Root Dashboard Config ──────────────────────────────────────────
export interface DashboardConfig {
  pages: PageConfig[];
  theme?: ThemeConfig;
  branding?: BrandingConfig;
}

// ─── API Response Types ─────────────────────────────────────────────
export interface RSSItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  source?: string;
  imageUrl?: string;
}

export interface HackerNewsItem {
  id: number;
  title: string;
  url?: string;
  domain?: string;
  points: number;
  commentCount: number;
  timeAgo: string;
  by: string;
}

export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    apparentTemperature: number;
    weatherCode: number;
    humidity: number;
    windSpeed: number;
    isDay: boolean;
  };
  hourly: {
    time: string;
    temperature: number;
    weatherCode: number;
  }[];
  daily: {
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
  }[];
  units: "metric" | "imperial";
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface CodeforcesContest {
  id: number;
  name: string;
  type: string;
  phase: string;
  durationSeconds: number;
  startTimeSeconds: number;
  relativeTimeSeconds: number;
}

export interface CodeforcesUser {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
  avatar?: string;
}

export interface LeetCodeDaily {
  date: string;
  title: string;
  titleSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  link: string;
  topicTags: string[];
}

export interface LeetCodeUserStats {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  author: string;
  thumbnail: string;
  views?: string;
}
