import { NextRequest, NextResponse } from 'next/server';
import { callGrokApi } from '@/app/utils/grok';

export async function POST(request: NextRequest) {
  try {
    const { requirement } = await request.json();

    if (!requirement || typeof requirement !== 'string' || !requirement.trim()) {
      return NextResponse.json(
        { error: 'A dashboard requirement prompt is required' },
        { status: 400 }
      );
    }

    const cleanRequirement = requirement.trim();

    const systemPrompt = `You are Dak Dashboard AI Architect.
Your task is to take a user's natural language requirement for a custom dashboard section and generate a complete, valid PageConfig JSON object.

UI AND DASHBOARD GUIDELINES:
1. The returned JSON MUST conform strictly to the PageConfig TypeScript interface:
{
  "name": "Short Section Title (1-3 words)",
  "width": "default", // optional "default" | "slim" | "wide"
  "columns": [
    {
      "size": "small", // or "full"
      "widgets": [ ... array of valid WidgetConfig objects ... ]
    }
  ]
}

2. ALLOWED WIDGET TYPES & SCHEMAS:
- "rss": { "type": "rss", "title": "...", "style": "vertical-list", "limit": 10, "feeds": [{ "url": "...", "title": "..." }] }
- "hacker-news": { "type": "hacker-news", "title": "Hacker News", "limit": 10, "sortBy": "top" }
- "reddit": { "type": "reddit", "title": "...", "subreddit": "...", "showThumbnails": true, "limit": 10 }
- "weather": { "type": "weather", "title": "Weather", "location": "City Name", "units": "metric", "hourFormat": "12h" }
- "markets": { "type": "markets", "title": "Market Watch", "markets": [{ "symbol": "BTC-USD", "name": "Bitcoin" }, { "symbol": "NVDA", "name": "NVIDIA" }] }
- "videos": { "type": "videos", "title": "Tech Videos", "channels": ["UCsBjURrPoezykLs9EqgamOA"], "limit": 6 }
- "calendar": { "type": "calendar", "title": "Calendar", "firstDayOfWeek": "monday" }
- "clock": { "type": "clock", "title": "World Clock", "hourFormat": "12h", "timezones": [{ "timezone": "America/New_York", "label": "New York" }, { "timezone": "Asia/Tokyo", "label": "Tokyo" }] }
- "bookmarks": { "type": "bookmarks", "title": "Bookmarks", "groups": [{ "title": "Quick Links", "links": [{ "title": "GitHub", "url": "https://github.com" }] }] }
- "search": { "type": "search", "title": "AI Search", "autofocus": false, "enableAiSearch": true }
- "monitor": { "type": "monitor", "title": "Uptime Monitor", "sites": [{ "title": "GitHub", "url": "https://github.com" }] }
- "releases": { "type": "releases", "title": "Releases", "repositories": ["vercel/next.js", "facebook/react"] }
- "todo": { "type": "todo", "title": "Tasks & Notes" }
- "codeforces": { "type": "codeforces", "title": "Codeforces", "handle": "Tourist", "showUpcomingContests": true }
- "leetcode": { "type": "leetcode", "title": "LeetCode Daily", "username": "leetcode" }
- "tools": { "type": "tools", "title": "Design & Dev Tools Catalog" }
- "stock-news": { "type": "stock-news", "title": "Financial News" }
- "project-tracker": { "type": "project-tracker", "title": "Project Activity" }
- "typing-progress": { "type": "typing-progress", "title": "Typing Analytics", "limitHistory": 10 }
- "scraped-list": { "type": "scraped-list", "title": "...", "url": "https://...", "prompt": "Extract the top N items with their scores/values", "limit": 5, "valueLabel": "Score" }
- "ai-benchmark": { "type": "ai-benchmark", "title": "AI Benchmarks Suite" }
  USE scraped-list when the user asks for: leaderboards, rankings, top-N lists, benchmark results, any data that must be fetched from a real web page. Always include a real working url that hosts the relevant data. valueLabel should describe the metric shown (e.g. "Score", "Stars", "Price").

3. LAYOUT STRUCTURE:
- Build 2 or 3 columns. Usually column 1 size="small", column 2 size="full", column 3 size="small".
- Choose relevant RSS feeds, subreddits, stocks, tools, bookmarks, or API handles matching the user's prompt.
- Do NOT use emojis in titles or labels.

Respond ONLY with a valid JSON object of the generated PageConfig. Do not wrap in markdown or add conversational text.`;

    const rawResult = await callGrokApi({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Requirement: ${cleanRequirement}` },
      ],
      temperature: 0.3,
      responseFormatJson: true,
    });

    let pageConfig;
    try {
      pageConfig = JSON.parse(rawResult);
    } catch {
      const stripped = rawResult.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      pageConfig = JSON.parse(stripped);
    }

    if (!pageConfig || !pageConfig.name || !Array.isArray(pageConfig.columns)) {
      return NextResponse.json(
        { error: 'AI generated an invalid dashboard configuration structure.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ page: pageConfig });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate custom dashboard with AI.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
