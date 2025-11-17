import './globals.css'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'FiveMinuteReports',
  description: 'Generate client reports in minutes, not hours',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
