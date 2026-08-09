import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subredditParam = searchParams.get('subreddit') || 'selfhosted';
  const cleanSub = subredditParam.replace(/^r\//, '');
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const sortBy = searchParams.get('sortBy') || 'hot';
  const topPeriod = searchParams.get('topPeriod') || 'day';

  const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  try {
    let url = `https://www.reddit.com/r/${encodeURIComponent(cleanSub)}/${encodeURIComponent(sortBy)}.json?limit=${limit}`;
    if (sortBy === 'top') {
      url += `&t=${topPeriod}`;
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent },
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const data = await res.json();
      const posts = data?.data?.children || [];
      if (posts.length > 0) {
        const items = posts.map((child: any) => {
          const p = child.data;
          return {
            id: p.id,
            title: p.title,
            url: p.url,
            permalink: p.permalink?.startsWith('http') ? p.permalink : `https://www.reddit.com${p.permalink}`,
            score: p.score ?? 0,
            numComments: p.num_comments ?? 0,
            author: p.author || 'reddit',
            createdUtc: p.created_utc || Math.floor(Date.now() / 1000),
            thumbnail: p.thumbnail && p.thumbnail.startsWith('http') ? p.thumbnail : undefined,
            domain: p.domain || 'reddit.com',
            isSelf: p.is_self ?? false,
          };
        });
        return NextResponse.json(items);
      }
    }
  } catch {
    // Fall through to RSS fallback
  }

  // RSS Fallback if JSON fails or is blocked
  try {
    const rssUrl = `https://www.reddit.com/r/${encodeURIComponent(cleanSub)}/${encodeURIComponent(sortBy)}.rss`;
    const rssRes = await fetch(rssUrl, {
      headers: { 'User-Agent': userAgent },
      next: { revalidate: 300 },
    });

    if (!rssRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch Reddit feed' }, { status: rssRes.status });
    }

    const xml = await rssRes.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];

    const items = entries.slice(0, limit).map((entry, idx) => {
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = entry.match(/<link href="([\s\S]*?)"/);
      const authorMatch = entry.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/);
      const updatedMatch = entry.match(/<updated>([\s\S]*?)<\/updated>/);
      const thumbMatch = entry.match(/<media:thumbnail url="([\s\S]*?)"/);

      const permalink = linkMatch ? linkMatch[1] : `https://www.reddit.com/r/${cleanSub}`;
      const author = authorMatch ? authorMatch[1].replace(/^\/u\//, '') : 'reddit';
      const createdUtc = updatedMatch ? Math.floor(new Date(updatedMatch[1]).getTime() / 1000) : Math.floor(Date.now() / 1000);

      return {
        id: `rss-${cleanSub}-${idx}`,
        title: titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : `Post ${idx + 1}`,
        url: permalink,
        permalink: permalink,
        score: 1,
        numComments: 0,
        author: author,
        createdUtc: createdUtc,
        thumbnail: thumbMatch ? thumbMatch[1].replace(/&amp;/g, '&') : undefined,
        domain: 'reddit.com',
        isSelf: true,
      };
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse Reddit RSS' }, { status: 500 });
  }
}

