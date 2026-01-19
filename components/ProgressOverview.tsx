'use client'

import { useState, useEffect } from 'react'

interface ProgressStats {
  habitsCompleted: number
  totalHabits: number
  tasksCompleted: number
  totalTasks: number
  routinesCompleted: number
  totalRoutines: number
}

export default function ProgressOverview() {
  const [stats, setStats] = useState<ProgressStats>({
    habitsCompleted: 0,
    totalHabits: 0,
    tasksCompleted: 0,
    totalTasks: 0,
    routinesCompleted: 0,
    totalRoutines: 0,
  })

  useEffect(() => {
    const loadStats = () => {
      const today = new Date().toISOString().split('T')[0]
      
      // Load habits
      const habits = JSON.parse(localStorage.getItem('habits') || '[]')
      const todayHabits = habits.filter((h: any) => 
        h.completedDates?.includes(today)
      )
      
      // Load tasks
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
      const todayTasks = tasks.filter((t: any) => 
        t.date === today && t.completed
      )
      
      // Load routines
      const routines = JSON.parse(localStorage.getItem('routines') || '[]')
      const todayRoutines = routines.filter((r: any) => 
        r.completedDates?.includes(today)
      )

      setStats({
        habitsCompleted: todayHabits.length,
        totalHabits: habits.length,
        tasksCompleted: todayTasks.length,
        totalTasks: tasks.filter((t: any) => t.date === today).length,
        routinesCompleted: todayRoutines.length,
        totalRoutines: routines.length,
      })
    }

    loadStats()
    const interval = setInterval(loadStats, 1000)
    return () => clearInterval(interval)
  }, [])

  const getPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  const cards = [
    {
      title: 'Habits',
      completed: stats.habitsCompleted,
      total: stats.totalHabits,
      color: 'bg-blue-100',
      textColor: 'text-[#2563eb]',
    },
    {
      title: 'Tasks',
      completed: stats.tasksCompleted,
      total: stats.totalTasks,
      color: 'bg-green-100',
      textColor: 'text-green-700',
    },
    {
      title: 'Routines',
      completed: stats.routinesCompleted,
      total: stats.totalRoutines,
      color: 'bg-purple-100',
      textColor: 'text-purple-700',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => {
        const percentage = getPercentage(card.completed, card.total)
        return (
          <div
            key={card.title}
            className="bg-white border-2 border-[#2563eb] rounded-lg p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {card.title}
            </h3>
            <div className="mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  {card.completed}/{card.total}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${card.color}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {card.completed === card.total && card.total > 0
                ? 'All completed! 🎉'
                : `${card.total - card.completed} remaining`}
            </p>
          </div>
        )
      })}
    </div>
  )
}


