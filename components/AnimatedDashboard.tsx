'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MouseSpotlight from './MouseSpotlight'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as any,
      opacity: { duration: 0.5 }
    }
  }
}

const hoverEffect = {
  scale: 1.02,
  y: -5,
  transition: { duration: 0.4, ease: "easeOut" as any }
}

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
import FocusTimer from './dashboard/FocusTimer'
import AnalyticsDashboard from './Analytics/AnalyticsDashboard'
import OnboardingTour from './dashboard/OnboardingTour'

export default function AnimatedDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routine' | 'tasks' | 'habits' | 'settings' | 'analytics'>('dashboard')
  const [mounted, setMounted] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [userId, setUserId] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)

  const fetchUser = async (id: string) => {
    try {
      const res = await fetch(`/api/user?userId=${id}`)
      if (res.ok) {
        const data = await res.json()
        setUserData(data)
      } else if (res.status === 404) {
        localStorage.clear()
        window.location.href = '/login'
      }
    } catch (e) {
      console.error("Dashboard: User fetch failed", e)
    }
  }

  useEffect(() => {
    setMounted(true)
    const id = localStorage.getItem('userId')
    if (id && id !== 'null' && id !== 'undefined') {
      setUserId(id)
      fetchUser(id)
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 relative">
      <MouseSpotlight />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
        logout={logout}
        userId={userId || undefined}
      />

      <main className="lg:pl-72 min-h-screen transition-all duration-300 overflow-y-auto overflow-x-hidden">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-8 lg:p-10 space-y-8 sm:space-y-10">
          <Header userId={userId || undefined} userData={userData} />

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div
                key="dashboard"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="space-y-6 sm:space-y-10"
              >
                {/* Row 1: Hero + Calendar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10 items-stretch">
                  <motion.div
                    variants={cardVariants}
                    whileHover={hoverEffect}
                    className="lg:col-span-2 h-full"
                  >
                    <HeroSection />
                  </motion.div>
                  <motion.div
                    variants={cardVariants}
                    whileHover={hoverEffect}
                    className="lg:col-span-1 h-full"
                  >
                    <CalendarWidget selectedDate={selectedDate} onSelect={setSelectedDate} />
                  </motion.div>
                </div>

                {/* Row 2: Widgets & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <motion.div
                    variants={cardVariants}
                    whileHover={hoverEffect}
                    className="lg:col-span-1 space-y-6"
                  >
                    <FocusTimer />
                  </motion.div>
                  <motion.div
                    variants={cardVariants}
                    whileHover={hoverEffect}
                    className="lg:col-span-3"
                  >
                    <StatsOverview userId={userId || undefined} />
                  </motion.div>
                </div>

                {/* Row 3: Daily Planner (Unified Habits, Routines, Tasks) */}
                <motion.div
                  variants={cardVariants}
                  whileHover={hoverEffect}
                >
                  <DailyPlanner selectedDate={selectedDate} userId={userId || undefined} />
                </motion.div>
              </motion.div>
            ) : activeTab === 'habits' ? (
              <motion.div
                key="habits"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 sm:space-y-10"
              >
                <motion.div
                  variants={cardVariants}
                >
                  <HabitGrid userId={userId || undefined} />
                </motion.div>
              </motion.div>
            ) : activeTab === 'routine' ? (
              <motion.div
                key="routine"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 sm:space-y-10"
              >
                <motion.div
                  variants={cardVariants}
                >
                  <RoutineGrid userId={userId || undefined} />
                </motion.div>
              </motion.div>
            ) : activeTab === 'tasks' ? (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 sm:space-y-10"
              >
                <motion.div
                  variants={cardVariants}
                >
                  <TaskGrid userId={userId || undefined} />
                </motion.div>
              </motion.div>
            ) : activeTab === 'settings' ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 sm:space-y-10"
              >
                <motion.div
                  variants={cardVariants}
                >
                  <SettingsView userId={userId || undefined} />
                </motion.div>
              </motion.div>
            ) : activeTab === 'analytics' ? (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 sm:space-y-10"
              >
                <motion.div
                  variants={cardVariants}
                >
                  <AnalyticsDashboard />
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Footer / Copyright */}
          <div className="pt-12 pb-4 text-center text-gray-600 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50">
            <p>© 2026 FocusFlow • Crafted for your best self.</p>
          </div>
        </div>
      </main>
      <OnboardingTour />
    </div>
  )
}
