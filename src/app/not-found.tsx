import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: '#0f1117' }}
    >
      <p
        className="text-5xl font-bold text-white"
        style={{ fontFamily: 'monospace' }}
      >
        404
      </p>
      <p className="text-sm" style={{ color: '#6b7280' }}>
        Page not found
      </p>
      <Link
        href="/dashboard"
        className="text-sm px-4 py-2 rounded"
        style={{ backgroundColor: '#3B82F6', color: '#fff' }}
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
