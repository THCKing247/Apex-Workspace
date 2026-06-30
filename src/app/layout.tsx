import type { Metadata } from 'next'
import { Teko, Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

// FONT USAGE RULE:
// - Headers, section labels, nav items, ALL numeric/stat values: font-display (Teko) — UPPERCASE for labels
// - Body copy, form inputs, notes content, email text: font-sans (Inter)
// - Code-like content (repo names, technical IDs): font-mono (JetBrains Mono)

const teko = Teko({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-teko' })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'Apex Workspace',
  description: 'Internal workspace for Apex Technical Solutions Group',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${teko.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              backgroundColor: '#10204a',
              border: '1px solid rgba(91,155,255,0.22)',
              color: '#f4f8ff',
              fontFamily: 'var(--font-inter)',
            },
          }}
        />
      </body>
    </html>
  )
}
