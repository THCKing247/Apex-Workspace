import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export interface SearchResult {
  id:       string
  type:     'lead' | 'project' | 'braik_target' | 'note' | 'competitor' | 'resource'
  title:    string
  subtitle: string
  brand:    string
  href:     string
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json({ results: [] })

  const supabase = await createClient()
  const pattern  = `%${q}%`
  const results: SearchResult[] = []

  const [leads, projects, targets, notes, competitors, resources] = await Promise.all([
    supabase.from('leads').select('id, name, company, brand, status').ilike('name', pattern).limit(5),
    supabase.from('projects').select('id, name, brand, status').ilike('name', pattern).limit(5),
    supabase.from('braik_targets').select('id, school_name, contact_name').ilike('school_name', pattern).limit(5),
    supabase.from('notes').select('id, title, brand').ilike('title', pattern).limit(5),
    supabase.from('competitors').select('id, name, brand').ilike('name', pattern).limit(5),
    supabase.from('resources').select('id, title, brand').ilike('title', pattern).limit(5),
  ])

  leads.data?.forEach(l => results.push({
    id: l.id, type: 'lead', title: l.name ?? 'Untitled lead',
    subtitle: [l.company, l.status].filter(Boolean).join(' · '),
    brand: l.brand ?? 'buildvance', href: '/pipeline',
  }))
  projects.data?.forEach(p => results.push({
    id: p.id, type: 'project', title: p.name ?? 'Untitled project',
    subtitle: [p.brand, p.status].filter(Boolean).join(' · '),
    brand: p.brand ?? 'buildvance', href: '/projects',
  }))
  targets.data?.forEach(t => results.push({
    id: t.id, type: 'braik_target', title: t.school_name ?? 'Untitled target',
    subtitle: t.contact_name ?? '',
    brand: 'braik', href: '/braik-targets',
  }))
  notes.data?.forEach(n => results.push({
    id: n.id, type: 'note', title: n.title ?? 'Untitled note',
    subtitle: n.brand ?? '',
    brand: n.brand ?? 'apex', href: '/notes',
  }))
  competitors.data?.forEach(c => results.push({
    id: c.id, type: 'competitor', title: c.name ?? 'Untitled',
    subtitle: c.brand ?? '',
    brand: c.brand ?? 'buildvance', href: '/competitors',
  }))
  resources.data?.forEach(r => results.push({
    id: r.id, type: 'resource', title: r.title ?? 'Untitled',
    subtitle: r.brand ?? '',
    brand: r.brand ?? 'buildvance', href: '/resources',
  }))

  return NextResponse.json({ results })
}
