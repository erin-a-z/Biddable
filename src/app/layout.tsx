import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/context/AuthContext'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Online Bidding Platform',
  description: 'Real-time auction platform',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <Toaster position="top-center" />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 
