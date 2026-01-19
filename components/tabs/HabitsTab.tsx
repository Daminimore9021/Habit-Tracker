'use client'

import { useState, useEffect } from 'react'

interface Habit {
  id: string
  name: string
  description: string
  streak: number
  completedDates: string[]
  color: string
}

export default function HabitsTab() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabit, setNewHabit] = useState({ name: '', description: '', color: '#2563eb' })

  const colors = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Pink', value: '#ec4899' },
  ]

  useEffect(() => {
    const saved = localStorage.getItem('habits')
    if (saved) {
      setHabits(JSON.parse(saved))
    }
  }, [])

  const saveHabits = (updated: Habit[]) => {
    localStorage.setItem('habits', JSON.stringify(updated))
    setHabits(updated)
  }

  const addHabit = () => {
    if (!newHabit.name.trim()) return

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description,
      streak: 0,
      completedDates: [],
      color: newHabit.color,
    }

    saveHabits([...habits, habit])
    setNewHabit({ name: '', description: '', color: '#2563eb' })
  }

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0]
    const updated = habits.map((h) => {
      if (h.id === id) {
        const completedDates = h.completedDates || []
        const isCompleted = completedDates.includes(today)
        const newCompletedDates = isCompleted
          ? completedDates.filter((d) => d !== today)
          : [...completedDates, today]

        // Calculate streak
        let streak = 0
        const sortedDates = newCompletedDates
          .map((d) => new Date(d))
          .sort((a, b) => b.getTime() - a.getTime())

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
    saveHabits(updated)
  }

  const deleteHabit = (id: string) => {
    saveHabits(habits.filter((h) => h.id !== id))
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Habits Tracker</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {habits.map((habit) => {
            const isCompleted = habit.completedDates?.includes(today)
            const completionRate =
              habit.completedDates.length > 0
                ? Math.round((habit.completedDates.length / 30) * 100)
                : 0

            return (
              <div
                key={habit.id}
                className={`p-4 rounded-lg border-2 ${
                  isCompleted
                    ? 'border-green-500 bg-green-50'
                    : 'border-[#2563eb] bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4
                      className={`font-semibold mb-1 ${
                        isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {habit.name}
                    </h4>
                    {habit.description && (
                      <p className="text-sm text-gray-600 mb-2">{habit.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="ml-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Streak</span>
                    <span className="text-lg font-bold" style={{ color: habit.color }}>
                      🔥 {habit.streak} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(completionRate, 100)}%`,
                        backgroundColor: habit.color,
                      }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full py-2 rounded-md font-medium transition-colors ${
                    isCompleted
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'border-2 border-[#2563eb] text-[#2563eb] hover:bg-blue-50'
                  } focus:outline-none focus:ring-2 focus:ring-[#2563eb]`}
                >
                  {isCompleted ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-[#2563eb]">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Habit</h4>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Habit name (e.g., Drink Water, Read Books)"
            value={newHabit.name}
            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
            className="w-full px-4 py-2 border-2 border-[#2563eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
          <textarea
            placeholder="Description (optional)"
            value={newHabit.description}
            onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
            className="w-full px-4 py-2 border-2 border-[#2563eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            rows={2}
          />
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Color:</label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setNewHabit({ ...newHabit, color: color.value })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    newHabit.color === color.value
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <button
              onClick={addHabit}
              className="ml-auto px-6 py-2 bg-[#2563eb] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-medium"
            >
              Add Habit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


