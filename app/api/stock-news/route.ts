import { NextRequest, NextResponse } from 'next/server';

export interface StockNewsArticle {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  symbol: string;
  snippet?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filterSymbol = (searchParams.get('symbol') || 'ALL').toUpperCase();

  try {
    // Curated RSS feeds for financial news & tracked stock tickers
    const defaultFeeds = [
      {
        symbol: 'BTC-USD',
        name: 'Bitcoin News',
        url: 'https://cointelegraph.com/rss/tag/bitcoin',
      },
      {
        symbol: 'ETH-USD',
        name: 'Ethereum News',
        url: 'https://cointelegraph.com/rss/tag/ethereum',
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA News',
        url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=NVDA&region=US&lang=en-US',
      },
      {
        symbol: 'AAPL',
        name: 'Apple News',
        url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=AAPL&region=US&lang=en-US',
      },
      {
        symbol: 'SPY',
        name: 'Market Watch',
        url: 'https://feeds.arstechnica.com/arstechnica/index',
      },
    ];

    let targetFeeds: { symbol: string; name: string; url: string }[] = [];

    if (filterSymbol === 'ALL') {
      targetFeeds = defaultFeeds;
    } else {
      const found = defaultFeeds.filter((f) => f.symbol === filterSymbol);
      if (found.length > 0) {
        targetFeeds = found;
      } else {
        // Dynamic feeds for custom symbols (Yahoo Finance & Google News RSS)
        targetFeeds = [
          {
            symbol: filterSymbol,
            name: `${filterSymbol} Yahoo Finance`,
            url: `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(filterSymbol)}&region=US&lang=en-US`,
          },
          {
            symbol: filterSymbol,
            name: `${filterSymbol} Market News`,
            url: `https://news.google.com/rss/search?q=${encodeURIComponent(filterSymbol)}+stock+OR+crypto&hl=en-US&gl=US&ceid=US:en`,
          },
        ];
      }
    }

    const articles: StockNewsArticle[] = [];

    await Promise.all(
      targetFeeds.map(async (feed) => {
        try {
          const res = await fetch(feed.url, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            },
            next: { revalidate: 300 },
          });
          if (!res.ok) return;
          const xml = await res.text();

          const itemRegex = /<item>([\s\S]*?)<\/item>/g;
          let match;
          let count = 0;
          while ((match = itemRegex.exec(xml)) !== null && count < 6) {
            const item = match[1];
            const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
            const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
            const pubDateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
            const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);

            if (titleMatch && linkMatch) {
              const cleanTitle = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
              const cleanLink = linkMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
              const cleanDesc = descMatch
                ? descMatch[1]
                    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
                    .replace(/<[^>]*>?/gm, '')
                    .slice(0, 140) + '...'
                : undefined;

              articles.push({
                title: cleanTitle,
                link: cleanLink,
                pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString(),
                source: feed.name,
                symbol: feed.symbol,
                snippet: cleanDesc,
              });
              count++;
            }
          }
        } catch {
          // Ignore feed errors
        }
      })
    );

    // Fallback news if external RSS is temporarily unreachable
    if (articles.length === 0) {
      articles.push({
        title: `Latest Updates & Market Intelligence for ${filterSymbol}`,
        link: `https://finance.yahoo.com/quote/${encodeURIComponent(filterSymbol)}/`,
        pubDate: new Date().toISOString(),
        source: 'Market Intelligence',
        symbol: filterSymbol,
        snippet: `Tracked financial activity and real-time updates for ${filterSymbol}.`,
      });
    }

    // Sort by publication date
    articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return NextResponse.json(articles.slice(0, 20));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stock news' }, { status: 500 });
  }
}

