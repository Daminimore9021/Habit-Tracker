'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Edit2, Plus, Check, X, Clock } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface RoutineItem {
  id: string
  time: string
  task: string
  description?: string
  completed: boolean
}

export default function RoutineList() {
  const [routines, setRoutines] = useState<RoutineItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ time: '', task: '', description: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [newRoutine, setNewRoutine] = useState({ time: '', task: '', description: '' })

  useEffect(() => {
    const saved = localStorage.getItem('dailyRoutine')
    if (saved) {
      setRoutines(JSON.parse(saved).map((r: any) => ({
        ...r,
        description: r.description || ''
      })))
    }
  }, [])

  const saveRoutines = (updated: RoutineItem[]) => {
    localStorage.setItem('dailyRoutine', JSON.stringify(updated))
    setRoutines(updated)
  }

  const toggleComplete = (id: string) => {
    saveRoutines(
      routines.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    )
  }

  const startEdit = (routine: RoutineItem) => {
    setEditingId(routine.id)
    setEditValues({
      time: routine.time,
      task: routine.task,
      description: routine.description || ''
    })
  }

  const saveEdit = (id: string) => {
    saveRoutines(
      routines.map((r) =>
        r.id === id
          ? { ...r, time: editValues.time, task: editValues.task, description: editValues.description }
          : r
      )
    )
    setEditingId(null)
  }

  const deleteItem = (id: string) => {
    if (confirm('Delete this routine item?')) {
      saveRoutines(routines.filter((r) => r.id !== id))
    }
  }

  const addRoutine = () => {
    if (!newRoutine.time.trim() || !newRoutine.task.trim()) return

    const item: RoutineItem = {
      id: Date.now().toString(),
      time: newRoutine.time,
      task: newRoutine.task,
      description: newRoutine.description,
      completed: false,
    }

    saveRoutines([...routines, item])
    setNewRoutine({ time: '', task: '', description: '' })
    setIsAdding(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Daily Routine
          <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {routines.length}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Time (e.g., 5:00 AM)"
                value={newRoutine.time}
                onChange={(e) => setNewRoutine({ ...newRoutine, time: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Task name"
                value={newRoutine.task}
                onChange={(e) => setNewRoutine({ ...newRoutine, task: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <textarea
              placeholder="Description (optional)..."
              value={newRoutine.description}
              onChange={(e) => setNewRoutine({ ...newRoutine, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors h-20 resize-none"
            />
            <button
              onClick={addRoutine}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl transition-colors"
            >
              Add Routine
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {routines.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">No routines set. Plan your day! 🚀</p>
          </div>
        ) : (
          routines.map((routine, index) => (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group p-4 rounded-2xl border transition-all duration-300",
                routine.completed
                  ? "bg-blue-500/10 border-blue-500/50"
                  : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleComplete(routine.id)}
                  className={cn(
                    "mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                    routine.completed
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "border-slate-700 group-hover:border-blue-500/50"
                  )}
                >
                  {routine.completed && <Check size={14} strokeWidth={3} />}
                </button>

                <div className="flex-1">
                  {editingId === routine.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editValues.time}
                          onChange={(e) => setEditValues({ ...editValues, time: e.target.value })}
                          className="bg-slate-900 border border-blue-500 rounded-lg px-3 py-1 text-white focus:outline-none"
                        />
                        <input
                          type="text"
                          value={editValues.task}
                          onChange={(e) => setEditValues({ ...editValues, task: e.target.value })}
                          className="bg-slate-900 border border-blue-500 rounded-lg px-3 py-1 text-white focus:outline-none"
                        />
                      </div>
                      <textarea
                        value={editValues.description}
                        onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-white focus:outline-none h-16 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(routine.id)} className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg font-bold">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-blue-400 font-mono text-sm bg-blue-400/10 px-2 py-0.5 rounded-full">
                            <Clock size={12} />
                            {routine.time}
                          </span>
                          <h3 className={cn(
                            "font-semibold transition-all duration-300",
                            routine.completed ? "text-slate-400 line-through" : "text-white"
                          )}>
                            {routine.task}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(routine)} className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => deleteItem(routine.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {routine.description && (
                        <p className={cn(
                          "text-sm mt-1 transition-all duration-300",
                          routine.completed ? "text-slate-600" : "text-slate-400"
                        )}>
                          {routine.description}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
