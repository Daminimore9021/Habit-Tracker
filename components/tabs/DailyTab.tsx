'use client'

import { useState, useEffect } from 'react'

interface DailyItem {
  id: string
  type: 'routine' | 'task' | 'habit'
  name: string
  time?: string
  completed: boolean
  priority?: string
}

export default function DailyTab() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyItems, setDailyItems] = useState<DailyItem[]>([])

  useEffect(() => {
    loadDailyItems()
  }, [selectedDate])

  const loadDailyItems = () => {
    const items: DailyItem[] = []

    // Load routines
    const routines = JSON.parse(localStorage.getItem('routines') || '[]')
    routines.forEach((routine: any) => {
      const isCompleted = routine.completedDates?.includes(selectedDate)
      items.push({
        id: `routine-${routine.id}`,
        type: 'routine',
        name: routine.name,
        time: routine.time,
        completed: isCompleted,
      })
    })

    // Load tasks
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    tasks
      .filter((task: any) => task.date === selectedDate)
      .forEach((task: any) => {
        items.push({
          id: `task-${task.id}`,
          type: 'task',
          name: task.title,
          completed: task.completed,
          priority: task.priority,
        })
      })

    // Load habits
    const habits = JSON.parse(localStorage.getItem('habits') || '[]')
    habits.forEach((habit: any) => {
      const isCompleted = habit.completedDates?.includes(selectedDate)
      items.push({
        id: `habit-${habit.id}`,
        type: 'habit',
        name: habit.name,
        completed: isCompleted,
      })
    })

    // Sort by time if available, then by type
    items.sort((a, b) => {
      if (a.time && b.time) {
        return a.time.localeCompare(b.time)
      }
      if (a.time) return -1
      if (b.time) return 1
      return a.type.localeCompare(b.type)
    })

    setDailyItems(items)
  }

  const toggleItem = (id: string) => {
    const [type, itemId] = id.split('-').slice(0, 2)
    const today = selectedDate

    if (type === 'routine') {
      const routines = JSON.parse(localStorage.getItem('routines') || '[]')
      const updated = routines.map((r: any) => {
        if (r.id === itemId) {
          const completedDates = r.completedDates || []
          const isCompleted = completedDates.includes(today)
          return {
            ...r,
            completedDates: isCompleted
              ? completedDates.filter((d: string) => d !== today)
              : [...completedDates, today],
          }
        }
        return r
      })
      localStorage.setItem('routines', JSON.stringify(updated))
    } else if (type === 'task') {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
      const updated = tasks.map((t: any) => {
        if (t.id === itemId) {
          return { ...t, completed: !t.completed }
        }
        return t
      })
      localStorage.setItem('tasks', JSON.stringify(updated))
    } else if (type === 'habit') {
      const habits = JSON.parse(localStorage.getItem('habits') || '[]')
      const updated = habits.map((h: any) => {
        if (h.id === itemId) {
          const completedDates = h.completedDates || []
          const isCompleted = completedDates.includes(today)
          const newCompletedDates = isCompleted
            ? completedDates.filter((d: string) => d !== today)
            : [...completedDates, today]

          // Calculate streak
          let streak = 0
          const sortedDates = newCompletedDates
            .map((d: string) => new Date(d))
            .sort((a: Date, b: Date) => b.getTime() - a.getTime())

          if (sortedDates.length > 0) {
            let currentDate = new Date(today)
            for (const date of sortedDates) {
              const dateStr = date.toISOString().split('T')[0]
              const expectedDateStr = currentDate.toISOString().split('T')[0]
              if (dateStr === expectedDateStr) {
                streak++
                currentDate.setDate(currentDate.getDate() - 1)
              } else {
                break
              }
            }
          }

          return {
            ...h,
            completedDates: newCompletedDates,
            streak,
          }
        }
        return h
      })
      localStorage.setItem('habits', JSON.stringify(updated))
    }

    loadDailyItems()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'routine':
        return '📅'
      case 'task':
        return '✅'
      case 'habit':
        return '🎯'
      default:
        return '•'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'routine':
        return 'border-purple-500 bg-purple-50'
      case 'task':
        return 'border-blue-500 bg-blue-50'
      case 'habit':
        return 'border-green-500 bg-green-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    }
    return (
      <span
        className={`text-xs px-2 py-1 rounded ${colors[priority] || colors.medium}`}
      >
        {priority.toUpperCase()}
      </span>
    )
  }

  const completedCount = dailyItems.filter((item) => item.completed).length
  const totalCount = dailyItems.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const isToday = selectedDate === new Date().toISOString().split('T')[0]
  const isYesterday = (() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return selectedDate === yesterday.toISOString().split('T')[0]
  })()

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Daily View</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const date = new Date(selectedDate)
                date.setDate(date.getDate() - 1)
                setSelectedDate(date.toISOString().split('T')[0])
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 border-2 border-[#2563eb] rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            >
              ← Previous
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border-2 border-[#2563eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
            <button
              onClick={() => {
                const date = new Date(selectedDate)
                date.setDate(date.getDate() + 1)
                const today = new Date().toISOString().split('T')[0]
                if (date.toISOString().split('T')[0] <= today) {
                  setSelectedDate(date.toISOString().split('T')[0])
                }
              }}
              disabled={selectedDate >= new Date().toISOString().split('T')[0]}
              className="px-4 py-2 text-sm font-medium text-gray-700 border-2 border-[#2563eb] rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2563eb] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            >
              Today
            </button>
          </div>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-[#2563eb]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {isToday
                  ? "Today's Activities"
                  : isYesterday
                  ? "Yesterday's Activities"
                  : `Activities for ${new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}`}
              </h4>
              <p className="text-sm text-gray-600">
                {completedCount}/{totalCount} completed
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#2563eb]">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-[#2563eb] h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {dailyItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No activities scheduled for this date. Add routines, tasks, or habits to see them here!
          </p>
        ) : (
          dailyItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                item.completed
                  ? 'border-green-500 bg-green-50'
                  : getTypeColor(item.type)
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleItem(item.id)}
                  className="w-5 h-5 text-[#2563eb] border-2 border-[#2563eb] rounded focus:ring-2 focus:ring-[#2563eb]"
                />
                <span className="text-xl">{getTypeIcon(item.type)}</span>
                <div className="flex-1">
                  <h5
                    className={`font-medium ${
                      item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    {item.name}
                  </h5>
                  <div className="flex items-center gap-3 mt-1">
                    {item.time && (
                      <span className="text-xs text-gray-600">⏰ {item.time}</span>
                    )}
                    <span className="text-xs text-gray-500 capitalize">
                      {item.type}
                    </span>
                    {getPriorityBadge(item.priority)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


