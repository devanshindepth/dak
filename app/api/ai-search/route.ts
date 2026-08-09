import { NextRequest, NextResponse } from 'next/server';
import { callGrokApi } from '@/app/utils/grok';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const cleanQuery = query.trim();

    const systemPrompt = `You are Dak AI Search. Answer the user's query directly, accurately, and objectively.
Return ONLY a JSON object with the following structure:
{
  "query": "${cleanQuery.replace(/"/g, '\\"')}",
  "summary": "Clear, comprehensive summary answering the query in markdown text.",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "sources": [
    { "title": "Official Doc or Reference Title", "url": "https://..." }
  ],
  "searchLinks": [
    { "name": "GitHub", "url": "https://github.com/search?q=..." },
    { "name": "Stack Overflow", "url": "https://stackoverflow.com/search?q=..." },
    { "name": "DuckDuckGo", "url": "https://duckduckgo.com/?q=..." }
  ]
}`;

    const userPrompt = `Query: ${cleanQuery}`;

    const rawResult = await callGrokApi({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      responseFormatJson: true,
    });

    let jsonResult;
    try {
      jsonResult = JSON.parse(rawResult);
    } catch {
      const stripped = rawResult.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      jsonResult = JSON.parse(stripped);
    }

    return NextResponse.json(jsonResult);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'AI Search failed to retrieve results';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
