'use client'

import { useAuth } from '@/contexts/AuthContext'
import AnimatedDashboard from '@/components/AnimatedDashboard'

export default function Home() {
  const { user, loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          <p className="text-sm font-medium animate-pulse">Loading HabitQuest...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect happens in middleware
  // If authenticated, show the dashboard
  return user ? <AnimatedDashboard /> : null
}
