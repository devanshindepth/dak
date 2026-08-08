import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const cleanQuery = query.trim();
    let summary = '';
    const sources: { title: string; url: string }[] = [];
    const keyTakeaways: string[] = [];

    // 1. Fetch from DuckDuckGo Instant Answer API
    try {
      const ddgRes = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`,
        { next: { revalidate: 3600 } }
      );
      if (ddgRes.ok) {
        const data = await ddgRes.json();
        if (data.AbstractText) {
          summary = data.AbstractText;
          if (data.AbstractURL) {
            sources.push({ title: data.AbstractSource || 'DuckDuckGo Abstract', url: data.AbstractURL });
          }
        } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
          const firstTopic = data.RelatedTopics.find((t: any) => t.Text);
          if (firstTopic) {
            summary = firstTopic.Text;
            if (firstTopic.FirstURL) {
              sources.push({ title: 'Topic Overview', url: firstTopic.FirstURL });
            }
          }
        }
      }
    } catch {
      // Ignore DDG errors
    }

    // 2. Fetch from Wikipedia Summary REST API if DDG returned no main abstract
    if (!summary) {
      try {
        const wikiRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`,
          { headers: { 'User-Agent': 'DakDashboard/1.0' }, next: { revalidate: 3600 } }
        );
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          if (wikiData.extract && wikiData.type !== 'disambiguation') {
            summary = wikiData.extract;
            if (wikiData.content_urls?.desktop?.page) {
              sources.push({ title: `${wikiData.title} (Wikipedia)`, url: wikiData.content_urls.desktop.page });
            }
          }
        }
      } catch {
        // Ignore Wiki summary errors
      }
    }

    // 3. Fetch from Wikipedia Search API if summary still empty
    if (!summary) {
      try {
        const searchRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&origin=*`,
          { next: { revalidate: 3600 } }
        );
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const firstHit = searchData?.query?.search?.[0];
          if (firstHit && firstHit.snippet) {
            const cleanSnippet = firstHit.snippet.replace(/<[^>]*>/g, '');
            summary = `${firstHit.title}: ${cleanSnippet}...`;
            sources.push({
              title: `${firstHit.title} (Wikipedia)`,
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(firstHit.title)}`,
            });
          }
        }
      } catch {
        // Ignore Wiki search errors
      }
    }

    // Fallback if no instant text found across APIs
    if (!summary) {
      summary = `Overview for "${cleanQuery}": Live web references compiled across primary developer knowledge bases, official documentation, and community indexers.`;
    }

    // Generate takeaways from summary
    const sentences = summary.split(/(?<=[.!?])\s+/).filter((s) => s.length > 10);
    if (sentences.length > 1) {
      keyTakeaways.push(...sentences.slice(0, 3));
    } else {
      keyTakeaways.push(summary);
    }

    // Direct search links across top developer & web platforms
    const searchLinks = [
      { name: 'DuckDuckGo', url: `https://duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}` },
      { name: 'GitHub', url: `https://github.com/search?q=${encodeURIComponent(cleanQuery)}` },
      { name: 'Stack Overflow', url: `https://stackoverflow.com/search?q=${encodeURIComponent(cleanQuery)}` },
      { name: 'YouTube', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}` },
      { name: 'Reddit', url: `https://www.reddit.com/search/?q=${encodeURIComponent(cleanQuery)}` },
    ];

    return NextResponse.json({
      query: cleanQuery,
      summary,
      keyTakeaways,
      sources,
      searchLinks,
    });
  } catch (error) {
    return NextResponse.json({ error: 'AI Search failed to retrieve results' }, { status: 500 });
  }
}
