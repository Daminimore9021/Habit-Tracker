'use client'

import { useState, useEffect } from 'react'

interface ProgressStats {
  routines: { completed: number; total: number }
  tasks: { completed: number; total: number }
  habits: { completed: number; total: number }
}

export default function AnimatedProgressCards() {
  const [stats, setStats] = useState<ProgressStats>({
    routines: { completed: 0, total: 0 },
    tasks: { completed: 0, total: 0 },
    habits: { completed: 0, total: 0 },
  })

  useEffect(() => {
    const updateStats = () => {
      const today = new Date().toISOString().split('T')[0]

      // Routines
      const routines = JSON.parse(localStorage.getItem('dailyRoutine') || '[]')
      const completedRoutines = routines.filter((r: any) => r.completed).length

      // Habits
      const habits = JSON.parse(localStorage.getItem('habits') || '[]')
      const completedHabits = habits.filter((h: any) =>
        h.completedDates?.includes(today)
      ).length

      // Tasks
      const tasks = JSON.parse(localStorage.getItem('dailyTasks') || '[]')
      const completedTasks = tasks.filter((t: any) => t.completed).length

      setStats({
        routines: { completed: completedRoutines, total: routines.length },
        tasks: { completed: completedTasks, total: tasks.length },
        habits: { completed: completedHabits, total: habits.length },
      })
    }

    updateStats()
    const interval = setInterval(updateStats, 1000)
    return () => clearInterval(interval)
  }, [])

  const cards = [
    {
      title: 'Daily Routines',
      icon: '📅',
      ...stats.routines,
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      bgGradient: 'from-purple-50 to-pink-50',
      iconBg: 'bg-gradient-to-br from-purple-400 to-pink-400',
    },
    {
      title: 'Tasks',
      icon: '✅',
      ...stats.tasks,
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-gradient-to-br from-blue-400 to-cyan-400',
    },
    {
      title: 'Habits',
      icon: '🎯',
      ...stats.habits,
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-gradient-to-br from-green-400 to-emerald-400',
    },
  ]

  const getPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const percentage = getPercentage(card.completed, card.total)
        return (
          <div
            key={card.title}
            className={`glass-card rounded-2xl p-6 border border-white/50 hover-lift animate-scaleIn`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`${card.iconBg} p-4 rounded-2xl shadow-lg text-3xl`}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
                  <p className="text-sm text-gray-500">Today's Progress</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-end justify-between mb-3">
                <span className="text-4xl font-bold text-gray-900">
                  {card.completed}
                  <span className="text-xl text-gray-500">/{card.total}</span>
                </span>
                <span className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  {percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className={`h-4 rounded-full bg-gradient-to-r ${card.gradient} progress-bar transition-all duration-1000 ease-out`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">
                {card.completed === card.total && card.total > 0
                  ? '🎉 All completed!'
                  : `${card.total - card.completed} remaining`}
              </span>
              {percentage === 100 && card.total > 0 && (
                <span className="text-sm font-bold text-green-600 animate-pulse-slow">
                  ✨ Perfect!
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
