import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Focus Buddy',
  description: 'An App for focused study',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
