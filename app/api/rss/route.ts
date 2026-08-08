import { NextResponse } from 'next/server';
import type { RSSItem } from '@/app/types/dashboard';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const feeds = body.feeds || [];
    const globalLimit = body.limit || 20;

    let allItems: RSSItem[] = [];

    await Promise.all(
      feeds.map(async (feed: any) => {
        try {
          const res = await fetch(feed.url, { next: { revalidate: 300 } });
          if (!res.ok) return;
          const xml = await res.text();
          
          const items: RSSItem[] = [];
          
          // Basic XML parsing with regex
          const isAtom = xml.includes('<feed');
          
          if (isAtom) {
            const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
            let match;
            while ((match = entryRegex.exec(xml)) !== null) {
              const entry = match[1];
              const titleMatch = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/);
              const linkMatch = entry.match(/<link[^>]*href="([^"]+)"/);
              const updatedMatch = entry.match(/<updated>([\s\S]*?)<\/updated>/);
              const summaryMatch = entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || entry.match(/<content[^>]*>([\s\S]*?)<\/content>/);
              
              if (titleMatch && linkMatch) {
                items.push({
                  title: titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
                  link: linkMatch[1],
                  description: summaryMatch ? summaryMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>?/gm, '').trim() : undefined,
                  pubDate: updatedMatch ? updatedMatch[1] : undefined,
                  source: feed.title || 'RSS Feed'
                });
              }
            }
          } else {
            // RSS 2.0
            const itemRegex = /<item>([\s\S]*?)<\/item>/g;
            let match;
            while ((match = itemRegex.exec(xml)) !== null) {
              const item = match[1];
              const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
              const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
              const pubDateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
              const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);
              
              if (titleMatch && linkMatch) {
                items.push({
                  title: titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
                  link: linkMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
                  description: descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>?/gm, '').trim() : undefined,
                  pubDate: pubDateMatch ? pubDateMatch[1].trim() : undefined,
                  source: feed.title || 'RSS Feed'
                });
              }
            }
          }
          
          let feedItems = items;
          if (feed.limit) {
            feedItems = feedItems.slice(0, feed.limit);
          }
          
          allItems = allItems.concat(feedItems);
        } catch (e) {
          // ignore individual feed errors
        }
      })
    );

    // sort by date
    allItems.sort((a, b) => {
      if (!a.pubDate) return 1;
      if (!b.pubDate) return -1;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    return NextResponse.json(allItems.slice(0, globalLimit));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process RSS feeds' }, { status: 500 });
  }
}
