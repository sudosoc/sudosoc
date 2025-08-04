import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ToasterWrapper from '@/components/ToasterWrapper'
import { AuthProvider } from '@/components/providers/AuthProvider'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SudoSoc - Cybersecurity Platform',
  description: 'A comprehensive cybersecurity platform for tools, scripts, e-books, and security research',
  keywords: 'cybersecurity, security tools, penetration testing, ethical hacking, security scripts',
  authors: [{ name: 'SudoSoc Team' }],
  openGraph: {
    title: 'SudoSoc - Cybersecurity Platform',
    description: 'A comprehensive cybersecurity platform for tools, scripts, e-books, and security research',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark-950 text-white min-h-screen`}>
        <AuthProvider>
          <Navigation />
          {children}
          <ToasterWrapper />
        </AuthProvider>
      </body>
    </html>
  )
} 