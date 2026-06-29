'use server'

export interface MetaInsights {
  impressions: number | null
  engagedUsers: number | null
  fans: number | null
  pageViews: number | null
}

export interface MetaPost {
  id: string
  message: string
  created_time: string
  likes: number
  comments: number
}

export interface MetaPageData {
  insights: MetaInsights
  posts: MetaPost[]
}

export async function fetchPageInsights(
  pageId: string,
  accessToken: string
): Promise<MetaPageData | null> {
  try {
    const [insightsRes, postsRes] = await Promise.all([
      fetch(
        `https://graph.facebook.com/v19.0/${pageId}/insights?metric=page_impressions_week,page_engaged_users,page_fans,page_views_total&period=week&access_token=${accessToken}`,
        { next: { revalidate: 3600 } }
      ),
      fetch(
        `https://graph.facebook.com/v19.0/${pageId}/posts?fields=message,created_time,likes.summary(true),comments.summary(true)&limit=5&access_token=${accessToken}`,
        { next: { revalidate: 3600 } }
      ),
    ])

    if (!insightsRes.ok && !postsRes.ok) return null

    const insightsJson = insightsRes.ok ? await insightsRes.json() : { data: [] }
    const postsJson = postsRes.ok ? await postsRes.json() : { data: [] }

    const metricMap: Record<string, number> = {}
    for (const metric of insightsJson.data ?? []) {
      const lastValue = metric.values?.[metric.values.length - 1]?.value
      if (lastValue !== undefined) {
        metricMap[metric.name] = lastValue
      }
    }

    const posts: MetaPost[] = (postsJson.data ?? []).map(
      (p: { id: string; message?: string; created_time: string; likes?: { summary?: { total_count: number } }; comments?: { summary?: { total_count: number } } }) => ({
        id: p.id,
        message: p.message ?? '',
        created_time: p.created_time,
        likes: p.likes?.summary?.total_count ?? 0,
        comments: p.comments?.summary?.total_count ?? 0,
      })
    )

    return {
      insights: {
        impressions: metricMap['page_impressions_week'] ?? null,
        engagedUsers: metricMap['page_engaged_users'] ?? null,
        fans: metricMap['page_fans'] ?? null,
        pageViews: metricMap['page_views_total'] ?? null,
      },
      posts,
    }
  } catch {
    return null
  }
}
