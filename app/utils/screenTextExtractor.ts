export interface TextPrompt {
  id: string;
  category: 'Weather' | 'Tech News' | 'Hacker News' | 'Reddit' | 'Code & Tasks' | 'Random';
  title: string;
  text: string;
  source?: string;
}

const FALLBACK_PROMPTS: TextPrompt[] = [
  {
    id: 'f-weather-1',
    category: 'Weather',
    title: 'Current Weather Conditions',
    text: 'Current weather in New York is 18 degrees Celsius with partly cloudy skies. Humidity stands at 65% with light wind speeds of 12 kilometers per hour.',
  },
  {
    id: 'f-weather-2',
    category: 'Weather',
    title: '7-Day Atmospheric Outlook',
    text: 'Barometric pressure remains steady across coastal regions. Expect clear morning skies followed by brief afternoon rain showers and moderate temperatures.',
  },
  {
    id: 'f-news-1',
    category: 'Tech News',
    title: 'Ars Technica Headline',
    text: 'Next generation quantum processors demonstrate unprecedented error mitigation techniques in real world cryptographic simulations.',
  },
  {
    id: 'f-news-2',
    category: 'Tech News',
    title: 'The Verge Tech Digest',
    text: 'Open source developers build lightweight distributed systems to deliver lower latency across edge computing architectures.',
  },
  {
    id: 'f-hn-1',
    category: 'Hacker News',
    title: 'Hacker News Top Story',
    text: 'Show HN: Building a high performance terminal emulator using WebGL and web assembly for ultra low input lag.',
  },
  {
    id: 'f-reddit-1',
    category: 'Reddit',
    title: 'r/selfhosted Insight',
    text: 'A comprehensive guide to configuring reverse proxies, automated container backups, and zero trust tunnel authentication for local home labs.',
  },
  {
    id: 'f-code-1',
    category: 'Code & Tasks',
    title: 'LeetCode Problem Summary',
    text: 'Given an array of integers and a target value, return the indices of two numbers such that they add up to the specified target sum.',
  },
  {
    id: 'f-code-2',
    category: 'Code & Tasks',
    title: 'Codeforces Contest Brief',
    text: 'Construct an optimal dynamic programming algorithm to calculate minimum operations required for prefix string matching.',
  },
];

/**
 * Scans the current DOM elements for text snippets from widgets on screen.
 * Groups prompts by category (Weather, Tech News, Hacker News, Reddit, Code & Tasks).
 */
export function extractScreenPrompts(): TextPrompt[] {
  if (typeof document === 'undefined') return FALLBACK_PROMPTS;

  const prompts: TextPrompt[] = [];
  let promptIdCounter = 1;

  // 1. Weather Widget Text
  try {
    const weatherCurrent = document.querySelector('.weather-current');
    if (weatherCurrent) {
      const temp = weatherCurrent.querySelector('.weather-temp-large')?.textContent?.trim() || '';
      const condition = weatherCurrent.querySelector('.weather-condition')?.textContent?.trim() || '';
      const details = Array.from(weatherCurrent.querySelectorAll('.weather-detail-row'))
        .map(el => el.textContent?.trim())
        .filter(Boolean)
        .join(', ');
      
      const location = document.querySelector('[data-widget="weather"] h2, .weather-widget-title')?.textContent?.trim() || 'Local Area';
      
      if (temp || condition || details) {
        const text = `Current weather report for ${location}: ${temp ? temp + ' degrees' : ''} ${condition ? condition : ''}. Details: ${details || 'Clear skies and favorable conditions'}.`;
        prompts.push({
          id: `dom-weather-${promptIdCounter++}`,
          category: 'Weather',
          title: `Weather Report (${location})`,
          text: sanitizeText(text),
          source: 'Weather Widget',
        });
      }
    }
  } catch (e) {
    // Ignore DOM extraction errors
  }

  // 2. RSS / Tech News
  try {
    const rssTitles = document.querySelectorAll('.rss-item-title, .rss-feed-item a, [data-widget="rss"] a');
    rssTitles.forEach((el, idx) => {
      const txt = el.textContent?.trim();
      if (txt && txt.length > 20 && idx < 6) {
        prompts.push({
          id: `dom-news-${promptIdCounter++}`,
          category: 'Tech News',
          title: `RSS News: ${txt.slice(0, 30)}...`,
          text: sanitizeText(txt),
          source: 'RSS Feed Widget',
        });
      }
    });
  } catch (e) {
    // Ignore DOM extraction errors
  }

  // 3. Hacker News Stories
  try {
    const hnItems = document.querySelectorAll('.hn-story-title, .hacker-news-item a, [data-widget="hacker-news"] a');
    hnItems.forEach((el, idx) => {
      const txt = el.textContent?.trim();
      if (txt && txt.length > 20 && idx < 6) {
        prompts.push({
          id: `dom-hn-${promptIdCounter++}`,
          category: 'Hacker News',
          title: `HN Story: ${txt.slice(0, 30)}...`,
          text: sanitizeText(txt),
          source: 'Hacker News Widget',
        });
      }
    });
  } catch (e) {
    // Ignore DOM extraction errors
  }

  // 4. Reddit Posts
  try {
    const redditItems = document.querySelectorAll('.reddit-post-title, [data-widget="reddit"] a');
    redditItems.forEach((el, idx) => {
      const txt = el.textContent?.trim();
      if (txt && txt.length > 20 && idx < 6) {
        prompts.push({
          id: `dom-reddit-${promptIdCounter++}`,
          category: 'Reddit',
          title: `Reddit Post: ${txt.slice(0, 30)}...`,
          text: sanitizeText(txt),
          source: 'Reddit Widget',
        });
      }
    });
  } catch (e) {
    // Ignore DOM extraction errors
  }

  // 5. Codeforces / LeetCode / Todo Tasks
  try {
    const tasks = document.querySelectorAll('.todo-text, .codeforces-contest-name, .leetcode-title, [data-widget="todo"] span');
    tasks.forEach((el, idx) => {
      const txt = el.textContent?.trim();
      if (txt && txt.length > 15 && idx < 4) {
        prompts.push({
          id: `dom-code-${promptIdCounter++}`,
          category: 'Code & Tasks',
          title: `Task / Challenge: ${txt.slice(0, 30)}...`,
          text: sanitizeText(txt),
          source: 'Task / Code Widget',
        });
      }
    });
  } catch (e) {
    // Ignore DOM extraction errors
  }

  // Combine extracted prompts with fallbacks to ensure full variety
  const allPrompts = [...prompts, ...FALLBACK_PROMPTS];
  
  // Deduplicate by text content
  const uniquePromptsMap = new Map<string, TextPrompt>();
  allPrompts.forEach(p => {
    if (!uniquePromptsMap.has(p.text)) {
      uniquePromptsMap.set(p.text, p);
    }
  });

  return Array.from(uniquePromptsMap.values());
}

function sanitizeText(raw: string): string {
  return raw
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?'"-]/g, '')
    .trim();
}
