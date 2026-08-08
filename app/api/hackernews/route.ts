import { NextResponse } from 'next/server';
import type { HackerNewsItem } from '@/app/types/dashboard';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sortBy') || 'top';
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
  let listUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json';
  if (sortBy === 'new') listUrl = 'https://hacker-news.firebaseio.com/v0/newstories.json';
  else if (sortBy === 'best') listUrl = 'https://hacker-news.firebaseio.com/v0/beststories.json';

  try {
    const listRes = await fetch(listUrl);
    if (!listRes.ok) throw new Error('Failed to fetch IDs');
    const ids: number[] = await listRes.json();
    
    const topIds = ids.slice(0, limit);
    
    const items = await Promise.all(
      topIds.map(async (id) => {
        const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!itemRes.ok) return null;
        const data = await itemRes.json();
        
        if (!data) return null;
        
        let domain = undefined;
        if (data.url) {
          try {
            domain = new URL(data.url).hostname.replace(/^www\./, '');
          } catch (e) {}
        }
        
        const now = Math.floor(Date.now() / 1000);
        const diff = now - (data.time || now);
        
        let timeAgo = '';
        if (diff < 60) timeAgo = `${diff}s ago`;
        else if (diff < 3600) timeAgo = `${Math.floor(diff / 60)}m ago`;
        else if (diff < 86400) timeAgo = `${Math.floor(diff / 3600)}h ago`;
        else timeAgo = `${Math.floor(diff / 86400)}d ago`;

        const hnItem: HackerNewsItem = {
          id: data.id,
          title: data.title,
          url: data.url || `https://news.ycombinator.com/item?id=${data.id}`,
          domain,
          points: data.score || 0,
          commentCount: data.descendants || 0,
          timeAgo,
          by: data.by || '',
        };
        
        return hnItem;
      })
    );

    return NextResponse.json(items.filter(Boolean));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Hacker News' }, { status: 500 });
  }
}
