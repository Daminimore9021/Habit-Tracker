'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  title: string
  description: string
  date: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

export default function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'medium' as 'low' | 'medium' | 'high',
  })
  const [filter, setFilter] = useState<'all' | 'today' | 'completed' | 'pending'>('all')

  useEffect(() => {
    const saved = localStorage.getItem('tasks')
    if (saved) {
      setTasks(JSON.parse(saved))
    }
  }, [])

  const saveTasks = (updated: Task[]) => {
    localStorage.setItem('tasks', JSON.stringify(updated))
    setTasks(updated)
  }

  const addTask = () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      date: newTask.date,
      completed: false,
      priority: newTask.priority,
    }

    saveTasks([...tasks, task])
    setNewTask({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      priority: 'medium',
    })
  }

  const toggleTask = (id: string) => {
    saveTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter((t) => t.id !== id))
  }

  const today = new Date().toISOString().split('T')[0]
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'today') return task.date === today
    if (filter === 'completed') return task.completed
    if (filter === 'pending') return !task.completed
    return true
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Tasks</h3>
          <div className="flex gap-2">
            {(['all', 'today', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium rounded-md border-2 ${
                  filter === f
                    ? 'border-[#2563eb] text-[#2563eb] bg-blue-50'
                    : 'border-gray-300 text-gray-700 hover:border-[#2563eb] hover:text-[#2563eb]'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-[#2563eb]">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Task</h4>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full px-4 py-2 border-2 border-[#2563eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
          <textarea
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full px-4 py-2 border-2 border-[#2563eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            rows={2}
          />
          <div className="flex gap-4">
            <input
              type="date"
              value={newTask.date}
              onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
              className="px-4 py-2 border-2 border-[#2563eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value as 'low' | 'medium' | 'high',
                })
              }
              className="px-4 py-2 border-2 border-[#2563eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <button
              onClick={addTask}
              className="px-6 py-2 bg-[#2563eb] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-medium"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks found. Add your first task above!</p>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start justify-between p-4 rounded-lg border-2 ${
                task.completed
                  ? 'border-green-500 bg-green-50'
                  : 'border-[#2563eb] bg-white'
              }`}
            >
              <div className="flex items-start space-x-4 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 mt-1 text-[#2563eb] border-2 border-[#2563eb] rounded focus:ring-2 focus:ring-[#2563eb]"
                />
                <div className="flex-1">
                  <h5
                    className={`font-medium mb-1 ${
                      task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    {task.title}
                  </h5>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">📅 {task.date}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


