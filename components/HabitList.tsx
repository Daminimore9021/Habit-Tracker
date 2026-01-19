'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Trash2, Edit2, Plus, Check, X, Info } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Habit {
  id: string
  name: string
  description?: string
  completed: boolean
  streak: number
  completedDates: string[]
}

export default function HabitList() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ name: '', description: '' })
  const [newHabit, setNewHabit] = useState({ name: '', description: '' })
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('habits')
    if (saved) {
      setHabits(JSON.parse(saved).map((h: any) => ({
        ...h,
        description: h.description || ''
      })))
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
          const sortedDates = [...newCompletedDates]
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
    setEditValues({ name: habit.name, description: habit.description || '' })
  }

  const saveEdit = (id: string) => {
    saveHabits(
      habits.map((h) => (h.id === id ? { ...h, name: editValues.name, description: editValues.description } : h))
    )
    setEditingId(null)
  }

  const deleteHabit = (id: string) => {
    if (confirm('Delete this habit?')) {
      saveHabits(habits.filter((h) => h.id !== id))
    }
  }

  const addHabit = () => {
    if (!newHabit.name.trim()) return

    const item: Habit = {
      id: Date.now().toString(),
      name: newHabit.name.trim(),
      description: newHabit.description.trim(),
      completed: false,
      streak: 0,
      completedDates: [],
    }

    saveHabits([...habits, item])
    setNewHabit({ name: '', description: '' })
    setIsAdding(false)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Habit Tracker
          <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {habits.length}
          </span>
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl transition-all duration-300"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3"
          >
            <input
              type="text"
              value={newHabit.name}
              onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              placeholder="Habit name..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <textarea
              value={newHabit.description}
              onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
              placeholder="Description (optional)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors h-20 resize-none"
            />
            <button
              onClick={addHabit}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl transition-colors"
            >
              Add Habit
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {habits.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">No habits yet. Start small! 🌱</p>
          </div>
        ) : (
          habits.map((habit, index) => {
            const isCompleted = habit.completedDates?.includes(today)
            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "group relative p-4 rounded-2xl border transition-all duration-300",
                  isCompleted
                    ? "bg-blue-500/10 border-blue-500/50"
                    : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                )}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={cn(
                      "mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                      isCompleted
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-slate-700 group-hover:border-blue-500/50"
                    )}
                  >
                    {isCompleted && <Check size={14} strokeWidth={3} />}
                  </button>

                  <div className="flex-1">
                    {editingId === habit.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          className="w-full bg-slate-900 border border-blue-500 rounded-lg px-3 py-1 text-white focus:outline-none"
                          autoFocus
                        />
                        <textarea
                          value={editValues.description}
                          onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-white focus:outline-none h-16 resize-none"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(habit.id)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-xs bg-slate-700 text-white px-2 py-1 rounded">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className={cn(
                            "font-semibold text-lg transition-all duration-300",
                            isCompleted ? "text-slate-400 line-through" : "text-white"
                          )}>
                            {habit.name}
                          </h3>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(habit)} className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => deleteHabit(habit.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        {habit.description && (
                          <p className={cn(
                            "text-sm mt-1 transition-all duration-300",
                            isCompleted ? "text-slate-600" : "text-slate-400"
                          )}>
                            {habit.description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-4">
                          {habit.streak > 0 && (
                            <div className="flex items-center gap-1.5 text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full text-xs font-bold">
                              <Flame size={12} strokeWidth={3} className="animate-pulse" />
                              {habit.streak} DAY STREAK
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-slate-500 text-xs">
                            <Info size={12} />
                            Click to toggle completion
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
