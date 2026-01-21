'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Layout Components
import Sidebar from './dashboard/Sidebar'
import Header from './dashboard/Header'

// Dashboard Widgets
import HeroSection from './dashboard/HeroSection'
import StatsOverview from './dashboard/StatsOverview'
import CalendarWidget from './dashboard/CalendarWidget'
import DailyPlanner from './dashboard/DailyPlanner'
import HabitGrid from './dashboard/HabitGrid'
import RoutineGrid from './dashboard/RoutineGrid'
import TaskGrid from './dashboard/TaskGrid'
import SettingsView from './dashboard/SettingsView'
import AnalyticsDashboard from './Analytics/AnalyticsDashboard'

export default function AnimatedDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routine' | 'tasks' | 'habits' | 'settings' | 'analytics'>('dashboard')
  const [mounted, setMounted] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const id = localStorage.getItem('userId')
    if (id && id !== 'null' && id !== 'undefined') {
      setUserId(id)
    }
  }, [])

  if (!mounted) return null

  const logout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userId')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
        logout={logout}
        userId={userId || undefined}
      />

      <main className="lg:pl-72 min-h-screen transition-all duration-300">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-10">
          <Header userId={userId || undefined} />

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 sm:space-y-10"
              >
                {/* Row 1: Hero + Calendar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
                  <div className="lg:col-span-2">
                    <HeroSection />
                  </div>
                  <div className="lg:col-span-1 h-full">
                    {/* Pass selectedDate and handler to CalendarWidget */}
                    <CalendarWidget selectedDate={selectedDate} onSelect={setSelectedDate} />
                  </div>
                </div>

                {/* Row 2: Stats */}
                <StatsOverview userId={userId || undefined} />

                {/* Row 3: Daily Planner (Unified Habits, Routines, Tasks) */}
                {/* Pass selectedDate to DailyPlanner */}
                <DailyPlanner selectedDate={selectedDate} userId={userId || undefined} />
              </motion.div>
            )}

            {activeTab === 'habits' && (
              <motion.div
                key="habits"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 sm:space-y-10"
              >
                <HabitGrid userId={userId || undefined} />
              </motion.div>
            )}

            {activeTab === 'routine' && (
              <motion.div
                key="routine"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 sm:space-y-10"
              >
                <RoutineGrid userId={userId || undefined} />
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 sm:space-y-10"
              >
                <TaskGrid userId={userId || undefined} />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 sm:space-y-10"
              >
                <SettingsView userId={userId || undefined} />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 sm:space-y-10"
              >
                <AnalyticsDashboard />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer / Copyright */}
          <div className="pt-12 pb-4 text-center text-gray-600 text-xs">
            <p>© 2024 FocusFlow. Designed for excellence.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
