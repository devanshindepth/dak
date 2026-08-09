import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');
  const username = searchParams.get('username') || searchParams.get('user');
  const type = searchParams.get('type') || 'releases';

  const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  if (type === 'contributions') {
    const cleanUser = (username || 'octocat').replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    try {
      const res = await fetch(`https://github.com/users/${encodeURIComponent(cleanUser)}/contributions`, {
        headers: { 'User-Agent': userAgent },
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch GitHub contributions' }, { status: res.status });
      }

      const html = await res.text();

      // Extract total contributions string if present
      const totalMatch = html.match(/([\d,]+)\s+contributions\s+in\s+the\s+last\s+year/i);
      const totalContributions = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ''), 10) : 0;

      // Step 1: Extract cells — map id -> { date, level }
      // GitHub renders <td id="contribution-day-component-X-Y" data-date="..." data-level="...">
      const cellMap: Record<string, { date: string; level: number }> = {};

      let m: RegExpExecArray | null;
      // Pattern 1: id comes before data-date
      const p1 = /<td[^>]*?id="(contribution-day-component-\d+-\d+)"[^>]*?data-date="([^"]+)"[^>]*?data-level="(\d+)"/g;
      while ((m = p1.exec(html)) !== null) {
        cellMap[m[1]] = { date: m[2], level: parseInt(m[3], 10) };
      }
      // Pattern 2: data-date comes before id
      const p2 = /<td[^>]*?data-date="([^"]+)"[^>]*?id="(contribution-day-component-\d+-\d+)"[^>]*?data-level="(\d+)"/g;
      while ((m = p2.exec(html)) !== null) {
        if (!cellMap[m[2]]) cellMap[m[2]] = { date: m[1], level: parseInt(m[3], 10) };
      }

      // Step 2: Extract actual counts from <tool-tip> elements
      // Pattern: for="contribution-day-component-X-Y" ...>N contributions on ...
      const countMap: Record<string, number> = {};
      const tipRegex = /for="(contribution-day-component[^"]+)"[^>]*>([^<]+)</g;
      while ((m = tipRegex.exec(html)) !== null) {
        const id = m[1];
        const text = m[2].trim();
        const numMatch = text.match(/^(\d+) contribution/);
        if (numMatch) {
          countMap[id] = parseInt(numMatch[1], 10);
        }
      }

      // Step 3: Merge into a date-keyed map
      const dayMap: Record<string, { level: number; count: number }> = {};
      for (const [id, cell] of Object.entries(cellMap)) {
        dayMap[cell.date] = { level: cell.level, count: countMap[id] ?? 0 };
      }

      // Step 4: Determine the padded date range.
      // react-activity-calendar (weekStart=1/Monday) goes back to the Monday on
      // or before the first entry. To avoid a truncated first-month label we
      // start from the Monday that begins the week containing exactly one year
      // ago from today, then end on today — ensuring today is always visible.
      //
      // Use local-date math (year/month/date components) to avoid UTC shift bugs.
      const localToday = new Date();
      const todayY = localToday.getFullYear();
      const todayM = localToday.getMonth();
      const todayD = localToday.getDate();

      // Build a zero-padded ISO string from local date components
      const localISO = (y: number, m: number, d: number) =>
        `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      const todayISO = localISO(todayY, todayM, todayD);

      // One year ago (local)
      const oneYearAgoDate = new Date(todayY - 1, todayM, todayD);

      // Step back to the nearest Monday on or before oneYearAgo
      const startDate = new Date(oneYearAgoDate);
      const dow = startDate.getDay(); // 0=Sun, 1=Mon … 6=Sat
      const daysBack = dow === 0 ? 6 : dow - 1; // steps to reach Monday
      startDate.setDate(startDate.getDate() - daysBack);

      // Build a full day-by-day array from startDate → today (local dates)
      const days: { date: string; level: number; count: number }[] = [];
      const cursor = new Date(startDate);
      while (true) {
        const iso = localISO(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
        const existing = dayMap[iso];
        days.push({ date: iso, level: existing?.level ?? 0, count: existing?.count ?? 0 });
        if (iso === todayISO) break;
        cursor.setDate(cursor.getDate() + 1);
        // Safety guard against infinite loop
        if (days.length > 400) break;
      }

      return NextResponse.json({
        username: cleanUser,
        totalContributions,
        days,
      });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to parse GitHub contribution graph' }, { status: 500 });
    }
  }

  if (!repo) {
    return NextResponse.json({ error: 'Repository name required' }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': userAgent,
      'Accept': 'application/vnd.github.v3+json',
    };

    if (type === 'releases') {
      const res = await fetch(`https://api.github.com/repos/${repo}/releases`, {
        headers,
        next: { revalidate: 600 },
      });
      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch releases' }, { status: res.status });
      }
      const data = await res.json();
      const releases = (data || []).map((rel: any) => ({
        id: rel.id,
        tagName: rel.tag_name,
        name: rel.name || rel.tag_name,
        publishedAt: rel.published_at,
        htmlUrl: rel.html_url,
        body: rel.body ? rel.body.slice(0, 140) : '',
        repo,
      }));
      return NextResponse.json(releases);
    } else {
      const res = await fetch(`https://api.github.com/repos/${repo}`, {
        headers,
        next: { revalidate: 600 },
      });
      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch repository info' }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json({
        name: data.full_name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        issues: data.open_issues_count,
        language: data.language,
        updatedAt: data.updated_at,
        htmlUrl: data.html_url,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to query GitHub API' }, { status: 500 });
  }
}

