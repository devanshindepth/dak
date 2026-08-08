import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit') || 'technology';
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const sortBy = searchParams.get('sortBy') || 'hot';
  const topPeriod = searchParams.get('topPeriod') || 'day';

  try {
    let url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/${encodeURIComponent(sortBy)}.json?limit=${limit}`;
    if (sortBy === 'top') {
      url += `&t=${topPeriod}`;
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DakDashboard/1.0',
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch Reddit data' }, { status: res.status });
    }

    const data = await res.json();
    const posts = data?.data?.children || [];

    const items = posts.map((child: any) => {
      const p = child.data;
      return {
        id: p.id,
        title: p.title,
        url: p.url,
        permalink: `https://www.reddit.com${p.permalink}`,
        score: p.score,
        numComments: p.num_comments,
        author: p.author,
        createdUtc: p.created_utc,
        thumbnail: p.thumbnail && p.thumbnail.startsWith('http') ? p.thumbnail : undefined,
        domain: p.domain,
        isSelf: p.is_self,
      };
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse Reddit data' }, { status: 500 });
  }
}
