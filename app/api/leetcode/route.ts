import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || '';

  try {
    // 1. Fetch LeetCode daily challenge via GraphQL
    const dailyQuery = {
      query: `
        query questionOfToday {
          activeDailyCodingChallengeQuestion {
            date
            link
            question {
              title
              titleSlug
              difficulty
              topicTags { name }
            }
          }
        }
      `,
    };

    const dailyRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dailyQuery),
      next: { revalidate: 3600 },
    });

    let dailyChallenge = null;
    if (dailyRes.ok) {
      const data = await dailyRes.json();
      const active = data?.data?.activeDailyCodingChallengeQuestion;
      if (active) {
        dailyChallenge = {
          date: active.date,
          title: active.question.title,
          titleSlug: active.question.titleSlug,
          difficulty: active.question.difficulty,
          link: `https://leetcode.com${active.link}`,
          topicTags: (active.question.topicTags || []).map((t: any) => t.name),
        };
      }
    }

    // 2. Fetch user stats if username provided
    let userStats = null;
    if (username) {
      const userQuery = {
        query: `
          query userProblemsSolved($username: String!) {
            allQuestionsCount { difficulty count }
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum { difficulty count }
              }
              profile { ranking }
            }
          }
        `,
        variables: { username },
      };

      const userRes = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userQuery),
        next: { revalidate: 3600 },
      });

      if (userRes.ok) {
        const uData = await userRes.json();
        const matched = uData?.data?.matchedUser;
        if (matched) {
          const ac = matched.submitStats?.acSubmissionNum || [];
          const getSolved = (diff: string) => ac.find((item: any) => item.difficulty === diff)?.count || 0;
          userStats = {
            username,
            totalSolved: getSolved('All'),
            easySolved: getSolved('Easy'),
            mediumSolved: getSolved('Medium'),
            hardSolved: getSolved('Hard'),
            ranking: matched.profile?.ranking || 0,
          };
        }
      }
    }

    return NextResponse.json({
      dailyChallenge,
      userStats,
    });
  } catch (error) {
    return NextResponse.json({ error: 'LeetCode API request failed' }, { status: 500 });
  }
}
