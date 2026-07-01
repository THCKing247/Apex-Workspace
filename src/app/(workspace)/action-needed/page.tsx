export const metadata = { title: 'Action Needed — Apex Workspace' }

export default function ActionNeededPage() {
  return (
    <div className="space-y-4">
      <div>
        <p
          className="font-display uppercase tracking-widest"
          style={{ color: 'var(--braik)', fontSize: 11, letterSpacing: '0.1em' }}
        >
          APEX — PRIORITY
        </p>
        <h1 className="font-display" style={{ color: 'var(--ink-primary)', fontSize: 36, lineHeight: 1 }}>
          ACTION NEEDED
        </h1>
      </div>
      <div className="card" style={{ padding: 24 }}>
        <p style={{ color: 'var(--ink-secondary)', fontSize: 14 }}>
          Action Needed — coming soon. This page will surface flagged leads, overdue follow-ups, and items requiring attention across Buildvance and Braik.
        </p>
      </div>
    </div>
  )
}
