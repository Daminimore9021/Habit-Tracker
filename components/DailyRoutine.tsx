'use client'

import { useState, useEffect } from 'react'

interface RoutineItem {
  id: string
  time: string
  task: string
  completed: boolean
}

export default function DailyRoutine() {
  const [routines, setRoutines] = useState<RoutineItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ time: '', task: '' })

  useEffect(() => {
    const saved = localStorage.getItem('dailyRoutine')
    if (saved) {
      setRoutines(JSON.parse(saved))
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
    setEditValues({ time: routine.time, task: routine.task })
  }

  const saveEdit = (id: string) => {
    saveRoutines(
      routines.map((r) =>
        r.id === id
          ? { ...r, time: editValues.time, task: editValues.task }
          : r
      )
    )
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const deleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this routine item?')) {
      saveRoutines(routines.filter((r) => r.id !== id))
    }
  }

  const addNewItem = () => {
    const newItem: RoutineItem = {
      id: Date.now().toString(),
      time: '00:00 – 00:00',
      task: 'New task',
      completed: false,
    }
    saveRoutines([...routines, newItem])
    setEditingId(newItem.id)
    setEditValues({ time: newItem.time, task: newItem.task })
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-light text-gray-900">Daily Routine</h2>
        <button
          onClick={addNewItem}
          className="text-sm text-[#2563eb] hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#2563eb] rounded px-3 py-1"
        >
          + Add Item
        </button>
      </div>

      <div className="space-y-2">
        {routines.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-sm">No routine items yet. Click "+ Add Item" to get started.</p>
        ) : (
          routines.map((routine) => (
            <div
              key={routine.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                routine.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={routine.completed}
                onChange={() => toggleComplete(routine.id)}
                className="mt-1 w-4 h-4 text-[#2563eb] border-gray-300 rounded focus:ring-[#2563eb] cursor-pointer"
              />
              
              {editingId === routine.id ? (
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={editValues.time}
                    onChange={(e) => setEditValues({ ...editValues, time: e.target.value })}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                    placeholder="Time range"
                  />
                  <input
                    type="text"
                    value={editValues.task}
                    onChange={(e) => setEditValues({ ...editValues, task: e.target.value })}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                    placeholder="Task name"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(routine.id)}
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
                </div>
              ) : (
                <>
                  <div
                    className={`flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 cursor-pointer ${
                      routine.completed ? 'line-through text-gray-400' : 'text-gray-700'
                    }`}
                    onClick={() => startEdit(routine)}
                  >
                    <span className="text-sm font-medium text-gray-600 min-w-[100px]">
                      {routine.time}
                    </span>
                    <span className="text-sm sm:text-base">: {routine.task}</span>
                  </div>
                  <button
                    onClick={() => deleteItem(routine.id)}
                    className="text-gray-400 hover:text-red-500 text-sm px-2 focus:outline-none"
                    title="Delete"
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}


