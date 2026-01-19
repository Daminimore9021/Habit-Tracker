'use client'

import { useState, useEffect } from 'react'

interface Habit {
  id: string
  name: string
  completed: boolean
  streak: number
  completedDates: string[]
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newHabitName, setNewHabitName] = useState('')

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
        if (newCompletedDates.length > 0) {
          const sortedDates = newCompletedDates
            .map((d) => new Date(d))
            .sort((a, b) => b.getTime() - a.getTime())

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

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id)
    setEditName(habit.name)
  }

  const saveEdit = (id: string) => {
    saveHabits(
      habits.map((h) => (h.id === id ? { ...h, name: editName } : h))
    )
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const deleteHabit = (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      saveHabits(habits.filter((h) => h.id !== id))
    }
  }

  const addHabit = () => {
    if (!newHabitName.trim()) return

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      completed: false,
      streak: 0,
      completedDates: [],
    }

    saveHabits([...habits, newHabit])
    setNewHabitName('')
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-light text-gray-900">Habit Tracker</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder="New habit"
            className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2563eb] w-32 sm:w-40"
          />
          <button
            onClick={addHabit}
            className="text-sm text-[#2563eb] hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#2563eb] rounded px-3 py-1"
          >
            + Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {habits.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-sm">No habits yet. Add your first habit above!</p>
        ) : (
          habits.map((habit) => {
            const isCompleted = habit.completedDates?.includes(today)
            return (
              <div
                key={habit.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isCompleted
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => toggleHabit(habit.id)}
                  className="w-4 h-4 text-[#2563eb] border-gray-300 rounded focus:ring-[#2563eb] cursor-pointer"
                />

                {editingId === habit.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(habit.id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(habit.id)}
                      className="px-3 py-1 text-xs text-white bg-[#2563eb] rounded hover:bg-blue-700 focus:outline-none"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className={`flex-1 cursor-pointer ${
                        isCompleted ? 'line-through text-gray-400' : 'text-gray-700'
                      }`}
                      onClick={() => startEdit(habit)}
                    >
                      <span className="text-sm sm:text-base">{habit.name}</span>
                      {habit.streak > 0 && (
                        <span className="ml-2 text-xs text-[#2563eb]">
                          🔥 {habit.streak} day{habit.streak !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-gray-400 hover:text-red-500 text-sm px-2 focus:outline-none"
                      title="Delete"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}


