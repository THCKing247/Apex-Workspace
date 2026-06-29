import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
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
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: '#0f1117' }}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              backgroundColor: '#1a1d2e',
              border: '1px solid #1e2330',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
