import { fetchPageInsights } from '@/app/actions/meta'
import SocialClient from './SocialClient'

export const metadata = { title: 'Social — Apex Workspace' }

export default async function SocialPage() {
  const token = process.env.META_ACCESS_TOKEN ?? ''
  const pages = [
    { id: 'apex', label: 'Apex TSG', pageId: process.env.META_PAGE_ID_APEX ?? '' },
    { id: 'buildvance', label: 'Buildvance', pageId: process.env.META_PAGE_ID_BUILDVANCE ?? '' },
    { id: 'braik', label: 'Braik', pageId: process.env.META_PAGE_ID_BRAIK ?? '' },
  ]

  if (!token) {
    return <SocialClient pages={pages} pageData={[null, null, null]} connected={false} />
  }

  const pageData = await Promise.all(
    pages.map((p) => (p.pageId ? fetchPageInsights(p.pageId, token) : Promise.resolve(null)))
  )

  return <SocialClient pages={pages} pageData={pageData} connected={true} />
}
