import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import './globals.css'

// Load Sora font from Google Fonts (Secondary font for headings)
// Using next/font/google for optimization
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
    <html lang="en" className={sora.variable}>
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load Fustat via Google Fonts link (not available in next/font/google yet) */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Fustat:wght@200..800&family=Sora:wght@100..800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

