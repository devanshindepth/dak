import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle') || 'Tourist';

  try {
    // 1. Fetch upcoming contests
    const contestsRes = await fetch('https://codeforces.com/api/contest.list?gym=false', {
      next: { revalidate: 1800 },
    });

    let upcomingContests: any[] = [];
    if (contestsRes.ok) {
      const contestsData = await contestsRes.json();
      if (contestsData.status === 'OK') {
        upcomingContests = (contestsData.result || [])
          .filter((c: any) => c.phase === 'BEFORE')
          .sort((a: any, b: any) => a.startTimeSeconds - b.startTimeSeconds)
          .slice(0, 5)
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            phase: c.phase,
            durationSeconds: c.durationSeconds,
            startTimeSeconds: c.startTimeSeconds,
            relativeTimeSeconds: c.relativeTimeSeconds,
          }));
      }
    }

    // 2. Fetch user stats if handle provided
    let userStats: any = null;
    if (handle) {
      const userRes = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`, {
        next: { revalidate: 3600 },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.status === 'OK' && userData.result?.[0]) {
          const u = userData.result[0];
          userStats = {
            handle: u.handle,
            rating: u.rating || 0,
            maxRating: u.maxRating || 0,
            rank: u.rank || 'Unrated',
            maxRank: u.maxRank || 'Unrated',
            avatar: u.titlePhoto || u.avatar,
          };
        }
      }
    }

    return NextResponse.json({
      upcomingContests,
      userStats,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Codeforces API request failed' }, { status: 500 });
  }
}
