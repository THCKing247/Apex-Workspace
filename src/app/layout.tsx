import type { Metadata } from 'next'
import { Teko, Inter, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

// FONT USAGE RULE:
// - Headers, section labels, nav items, ALL numeric/stat values: font-display (Teko) — UPPERCASE for labels
// - Body copy, form inputs, notes content, email text: font-sans (Inter)
// - Code-like content (repo names, technical IDs): font-mono (Geist Mono)

const teko = Teko({
  variable: '--font-teko',
  subsets: ['latin'],
  weight: ['500', '600'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Apex Workspace',
  description: 'Internal workspace for Apex Technical Solutions Group',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${teko.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--body-bg)', color: 'var(--ink-primary)' }}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              backgroundColor: '#ffffff',
              border: '1px solid #e8e6df',
              color: '#1a1f2e',
              boxShadow: '0 4px 16px rgba(13,27,61,0.12)',
            },
          }}
        />
      </body>
    </html>
  )
}
