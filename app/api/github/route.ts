import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');
  const type = searchParams.get('type') || 'releases';

  if (!repo) {
    return NextResponse.json({ error: 'Repository name required' }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'DakDashboard/1.0',
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
