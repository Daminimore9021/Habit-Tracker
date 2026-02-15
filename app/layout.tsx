import type { Metadata } from 'next'
import './globals.css'
import ChatBot from '@/components/ChatBot'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'FocusFlow | Premium Habit Tracker',
  description: 'Track your daily habits, routines, and tasks with style.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#020617]">
        <AuthProvider>
          {children}
          <ChatBot />
        </AuthProvider>
      </body>
    </html>
  )
}


