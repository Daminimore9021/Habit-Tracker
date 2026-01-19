'use client'

import { useState, useEffect } from 'react'

interface Routine {
  id: string
  name: string
  time: string
  completed: boolean
  completedDates: string[]
}

export default function DailyRoutineTab() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [newRoutine, setNewRoutine] = useState({ name: '', time: '' })

  useEffect(() => {
    const saved = localStorage.getItem('routines')
    if (saved) {
      setRoutines(JSON.parse(saved))
    }
  }, [])

  const saveRoutines = (updated: Routine[]) => {
    localStorage.setItem('routines', JSON.stringify(updated))
    setRoutines(updated)
  }

  const addRoutine = () => {
    if (!newRoutine.name.trim() || !newRoutine.time.trim()) return

    const routine: Routine = {
      id: Date.now().toString(),
      name: newRoutine.name,
      time: newRoutine.time,
      completed: false,
      completedDates: [],
    }

    saveRoutines([...routines, routine])
    setNewRoutine({ name: '', time: '' })
  }

  const toggleRoutine = (id: string) => {
    const today = new Date().toISOString().split('T')[0]
    const updated = routines.map((r) => {
      if (r.id === id) {
        const completedDates = r.completedDates || []
        const isCompleted = completedDates.includes(today)
        return {
          ...r,
          completedDates: isCompleted
            ? completedDates.filter((d) => d !== today)
            : [...completedDates, today],
        }
      }
      return r
    })
    saveRoutines(updated)
  }

  const deleteRoutine = (id: string) => {
    saveRoutines(routines.filter((r) => r.id !== id))
  }

  const today = new Date().toISOString().split('T')[0]
  const todayCompleted = routines.filter((r) =>
    r.completedDates?.includes(today)
  ).length
  const progress = routines.length > 0 ? (todayCompleted / routines.length) * 100 : 0

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Daily Routine Progress</h3>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {todayCompleted}/{routines.length} Completed
            </span>
            <span className="text-sm font-medium text-[#2563eb]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-[#2563eb] h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-[#2563eb]">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Routine</h4>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Routine name (e.g., Morning Exercise)"
            value={newRoutine.name}
            onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
            className="flex-1 px-4 py-2 border-2 border-[#2563eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
          <input
            type="time"
            value={newRoutine.time}
            onChange={(e) => setNewRoutine({ ...newRoutine, time: e.target.value })}
            className="px-4 py-2 border-2 border-[#2563eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
          <button
            onClick={addRoutine}
            className="px-6 py-2 bg-[#2563eb] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-medium"
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-900">Today's Routines</h4>
        {routines.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No routines added yet. Add your first routine above!</p>
        ) : (
          routines.map((routine) => {
            const isCompleted = routine.completedDates?.includes(today)
            return (
              <div
                key={routine.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  isCompleted
                    ? 'border-green-500 bg-green-50'
                    : 'border-[#2563eb] bg-white'
                }`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => toggleRoutine(routine.id)}
                    className="w-5 h-5 text-[#2563eb] border-2 border-[#2563eb] rounded focus:ring-2 focus:ring-[#2563eb]"
                  />
                  <div>
                    <h5 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {routine.name}
                    </h5>
                    <p className="text-sm text-gray-600">⏰ {routine.time}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteRoutine(routine.id)}
                  className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}


