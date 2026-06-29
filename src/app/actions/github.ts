'use server'

export interface GitHubCommit {
  message: string
  author: string
  date: string
}

export interface GitHubRepoData {
  name: string
  description: string | null
  defaultBranch: string
  lastPushDate: string
  openIssues: number
  openPRs: number
  commits: GitHubCommit[]
}

export async function fetchRepoData(repoFullName: string): Promise<GitHubRepoData | null> {
  const token = process.env.GITHUB_TOKEN
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  try {
    const [repoRes, commitsRes, prsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repoFullName}`, { headers, next: { revalidate: 300 } }),
      fetch(`https://api.github.com/repos/${repoFullName}/commits?per_page=5`, { headers, next: { revalidate: 300 } }),
      fetch(`https://api.github.com/repos/${repoFullName}/pulls?state=open&per_page=1`, { headers, next: { revalidate: 300 } }),
    ])

    if (!repoRes.ok) return null

    const [repo, commits, prs] = await Promise.all([
      repoRes.json(),
      commitsRes.ok ? commitsRes.json() : [],
      prsRes.ok ? prsRes.json() : [],
    ])

    return {
      name: repo.name,
      description: repo.description,
      defaultBranch: repo.default_branch,
      lastPushDate: repo.pushed_at,
      openIssues: repo.open_issues_count,
      openPRs: Array.isArray(prs) ? prs.length : 0,
      commits: (Array.isArray(commits) ? commits : []).map((c: { commit: { message: string; author: { name: string; date: string } } }) => ({
        message: c.commit.message.split('\n')[0],
        author: c.commit.author.name,
        date: c.commit.author.date,
      })),
    }
  } catch {
    return null
  }
}
