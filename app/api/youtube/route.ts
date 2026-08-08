import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channelsParam = searchParams.get('channels') || '';
  const channels = channelsParam.split(',').map((c) => c.trim()).filter(Boolean);

  if (channels.length === 0) {
    return NextResponse.json([]);
  }

  try {
    const allVideos: any[] = [];

    for (const channel of channels) {
      // Support both channel ID (UC...) and channel handles
      const rssUrl = channel.startsWith('UC')
        ? `https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`
        : `https://www.youtube.com/feeds/videos.xml?user=${channel}`;

      const res = await fetch(rssUrl, { next: { revalidate: 600 } });
      if (!res.ok) continue;

      const xml = await res.text();

      // Extract entries using regex
      const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
      for (const entry of entries.slice(0, 4)) {
        const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
        const titleMatch = entry.match(/<title>(.*?)<\/title>/);
        const authorMatch = entry.match(/<name>(.*?)<\/name>/);
        const publishedMatch = entry.match(/<published>(.*?)<\/published>/);

        if (videoIdMatch && titleMatch) {
          const videoId = videoIdMatch[1];
          allVideos.push({
            id: videoId,
            title: titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
            link: `https://www.youtube.com/watch?v=${videoId}`,
            author: authorMatch ? authorMatch[1] : 'YouTube',
            pubDate: publishedMatch ? publishedMatch[1] : new Date().toISOString(),
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          });
        }
      }
    }

    // Sort by publication date
    allVideos.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return NextResponse.json(allVideos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch YouTube videos' }, { status: 500 });
  }
}
