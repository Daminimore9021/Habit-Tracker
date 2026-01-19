'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  text: string
  completed: boolean
}

export default function DailyTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    // Reset tasks daily
    const lastResetDate = localStorage.getItem('lastTaskResetDate')
    const today = new Date().toISOString().split('T')[0]
    
    if (lastResetDate !== today) {
      localStorage.setItem('dailyTasks', JSON.stringify([]))
      localStorage.setItem('lastTaskResetDate', today)
      setTasks([])
    } else {
      const saved = localStorage.getItem('dailyTasks')
      if (saved) {
        setTasks(JSON.parse(saved))
      }
    }
  }, [])

  const saveTasks = (updated: Task[]) => {
    localStorage.setItem('dailyTasks', JSON.stringify(updated))
    setTasks(updated)
  }

  const addTask = () => {
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
    }

    saveTasks([...tasks, task])
    setNewTask('')
  }

  const toggleTask = (id: string) => {
    saveTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditText(task.text)
  }

  const saveEdit = (id: string) => {
    saveTasks(
      tasks.map((t) => (t.id === id ? { ...t, text: editText } : t))
    )
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter((t) => t.id !== id))
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-light text-gray-900">Daily Tasks</h2>
      </div>

      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
          />
          <button
            onClick={addTask}
            className="px-4 py-2 text-sm text-white bg-[#2563eb] rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-medium"
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-sm">No tasks yet. Add your first task above!</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                task.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="mt-1 w-4 h-4 text-[#2563eb] border-gray-300 rounded focus:ring-[#2563eb] cursor-pointer"
              />

              {editingId === task.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(task.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(task.id)}
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
                  <span
                    className={`flex-1 cursor-pointer ${
                      task.completed ? 'line-through text-gray-400' : 'text-gray-700'
                    }`}
                    onClick={() => startEdit(task)}
                  >
                    {task.text}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
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


