'use client'

import { useState, useEffect } from 'react'

export default function ProgressHeader() {
  const [motivationalLine, setMotivationalLine] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [progress, setProgress] = useState({ completed: 0, total: 0 })

  useEffect(() => {
    const saved = localStorage.getItem('motivationalLine')
    if (saved) {
      setMotivationalLine(saved)
    } else {
      setMotivationalLine('Every day is a fresh start 🌱')
      localStorage.setItem('motivationalLine', 'Every day is a fresh start 🌱')
    }
    updateProgress()
    const interval = setInterval(updateProgress, 1000)
    return () => clearInterval(interval)
  }, [])

  const updateProgress = () => {
    const today = new Date().toISOString().split('T')[0]
    
    // Count routines
    const routines = JSON.parse(localStorage.getItem('dailyRoutine') || '[]')
    const completedRoutines = routines.filter((r: any) => r.completed).length
    
    // Count habits
    const habits = JSON.parse(localStorage.getItem('habits') || '[]')
    const completedHabits = habits.filter((h: any) => 
      h.completedDates?.includes(today)
    ).length
    
    // Count tasks
    const tasks = JSON.parse(localStorage.getItem('dailyTasks') || '[]')
    const completedTasks = tasks.filter((t: any) => t.completed).length
    
    const total = routines.length + habits.length + tasks.length
    const completed = completedRoutines + completedHabits + completedTasks
    
    setProgress({ completed, total })
  }

  const handleSaveMotivation = () => {
    localStorage.setItem('motivationalLine', motivationalLine)
    setIsEditing(false)
  }

  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const progressPercentage = progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100) 
    : 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-gray-900 mb-1">
            {dateString}
          </h1>
          {isEditing ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={motivationalLine}
                onChange={(e) => setMotivationalLine(e.target.value)}
                onBlur={handleSaveMotivation}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveMotivation()}
                className="flex-1 px-3 py-1 text-sm text-gray-600 border-b border-gray-300 focus:outline-none focus:border-[#2563eb]"
                autoFocus
              />
            </div>
          ) : (
            <p 
              className="text-sm sm:text-base text-gray-600 cursor-pointer hover:text-[#2563eb] transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {motivationalLine}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-light text-[#2563eb] mb-1">
            {progress.completed}/{progress.total}
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {progressPercentage}% Complete
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-[#2563eb] h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  )
}


