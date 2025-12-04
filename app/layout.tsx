import type { Metadata } from 'next'
import { Fustat, Sora } from 'next/font/google'
import './globals.css'

// Load Fustat font from Google Fonts (Primary font)
const fustat = Fustat({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-fustat',
  display: 'swap',
  preload: true,
})

// Load Sora font from Google Fonts (Secondary font for headings)
const sora = Sora({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Partner Portal - Helium AI',
  description: 'Partner management and proposal generation system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${fustat.variable} ${sora.variable}`}>
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${fustat.className}`}>{children}</body>
    </html>
  )
}

