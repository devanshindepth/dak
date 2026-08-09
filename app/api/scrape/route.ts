import { NextRequest, NextResponse } from 'next/server';
import { callGrokApi } from '@/app/utils/grok';

export interface ScrapedItem {
  rank?: number;
  label: string;
  value?: string;
  sublabel?: string;
  url?: string;
}

export interface ScrapeResult {
  items: ScrapedItem[];
  source: string;
  fetchedAt: string;
}

/**
 * Strips HTML tags and collapses whitespace to produce clean plain text
 * suitable for passing to an LLM.
 */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, prompt, limit = 5 } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    // Fetch the target page server-side (no CORS issues).
    // Strategy:
    //   1. Try Jina Reader (https://r.jina.ai/<url>) — renders JS-heavy SPAs,
    //      returns clean markdown. Free, no key required.
    //   2. Fall back to direct fetch + HTML strip for simple static pages.
    let pageText: string;
    try {
      const jinaUrl = `https://r.jina.ai/${url}`;
      const jinaRes = await fetch(jinaUrl, {
        headers: {
          Accept: 'text/plain',
          'User-Agent': 'Mozilla/5.0 (compatible; DakBot/1.0)',
          // Ask Jina for plain text output
          'X-Return-Format': 'text',
        },
        next: { revalidate: 3600 },
      });

      if (jinaRes.ok) {
        pageText = await jinaRes.text();
      } else {
        // Jina failed — direct fetch fallback
        const directRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DakBot/1.0)',
            Accept: 'text/html,application/xhtml+xml',
          },
          next: { revalidate: 3600 },
        });
        if (!directRes.ok) {
          return NextResponse.json(
            { error: `Failed to fetch page: HTTP ${directRes.status}` },
            { status: 502 }
          );
        }
        const raw = await directRes.text();
        pageText = htmlToText(raw);
      }
    } catch (fetchErr) {
      return NextResponse.json(
        { error: `Could not reach URL: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}` },
        { status: 502 }
      );
    }

    // Truncate to ~12 000 chars so we stay well within LLM context
    const truncated = pageText.slice(0, 12000);

    const systemPrompt = `You are a structured data extractor. The user will give you plain text scraped from a web page and a description of what to extract.
Extract exactly ${limit} items and return ONLY a JSON object in this format:
{
  "items": [
    { "rank": 1, "label": "Item Name", "value": "Score or metric", "sublabel": "optional extra context", "url": "https://... or null" }
  ]
}
Rules:
- rank starts at 1
- label is the primary name
- value is the key metric (score, percentage, number — keep it short, max 10 chars)
- sublabel is optional secondary info (company, model size, etc.)
- url is a direct link to that item if present in the text, otherwise null
- Do NOT add commentary. Return ONLY the JSON object.`;

    const userPrompt = `Page URL: ${url}
Task: ${prompt}
Limit: ${limit} items

Page content:
${truncated}`;

    const rawAI = await callGrokApi({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      responseFormatJson: true,
    });

    let parsed: { items: ScrapedItem[] };
    try {
      parsed = JSON.parse(rawAI);
    } catch {
      const stripped = rawAI.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsed = JSON.parse(stripped);
    }

    if (!parsed?.items || !Array.isArray(parsed.items)) {
      return NextResponse.json({ error: 'AI returned unexpected structure' }, { status: 500 });
    }

    const result: ScrapeResult = {
      items: parsed.items.slice(0, limit),
      source: url,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Scrape failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
