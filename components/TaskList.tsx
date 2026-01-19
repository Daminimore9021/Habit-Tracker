'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Edit2, Plus, Check, X, Target, Calendar as CalendarIcon } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Task {
  id: string
  text: string
  description?: string
  completed: boolean
  dueDate: string // YYYY-MM-DD
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ text: '', description: '', dueDate: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [newTask, setNewTask] = useState({
    text: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0]
  })
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const saved = localStorage.getItem('dailyTasks')
    if (saved) {
      setTasks(JSON.parse(saved).map((t: any) => ({
        ...t,
        description: t.description || '',
        dueDate: t.dueDate || new Date().toISOString().split('T')[0]
      })))
    }
  }, [])

  const saveTasks = (updated: Task[]) => {
    localStorage.setItem('dailyTasks', JSON.stringify(updated))
    setTasks(updated)
  }

  const toggleTask = (id: string) => {
    saveTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditValues({
      text: task.text,
      description: task.description || '',
      dueDate: task.dueDate
    })
  }

  const saveEdit = (id: string) => {
    saveTasks(
      tasks.map((t) => (t.id === id ? { ...t, text: editValues.text, description: editValues.description, dueDate: editValues.dueDate } : t))
    )
    setEditingId(null)
  }

  const deleteTask = (id: string) => {
    if (confirm('Delete this task?')) {
      saveTasks(tasks.filter((t) => t.id !== id))
    }
  }

  const addTask = () => {
    if (!newTask.text.trim()) return

    const item: Task = {
      id: Date.now().toString(),
      text: newTask.text.trim(),
      description: newTask.description.trim(),
      completed: false,
      dueDate: newTask.dueDate
    }

    saveTasks([...tasks, item])
    setNewTask({
      text: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0]
    })
    setIsAdding(false)
  }

  const filteredTasks = tasks.filter(t => t.dueDate === selectedDate)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Tasks
          </h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-blue-400 font-bold focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl transition-all duration-300 w-fit"
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
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Task name..."
                value={newTask.text}
                onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                title="Schedule Date"
              />
            </div>
            <textarea
              placeholder="Description (optional)..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors h-20 resize-none"
            />
            <button
              onClick={addTask}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl transition-colors"
            >
              Add Task
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">No tasks for {selectedDate === new Date().toISOString().split('T')[0] ? 'today' : selectedDate}. ✨</p>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group p-4 rounded-2xl border transition-all duration-300",
                task.completed
                  ? "bg-blue-500/10 border-blue-500/50"
                  : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                    task.completed
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "border-slate-700 group-hover:border-blue-500/50"
                  )}
                >
                  {task.completed && <Check size={14} strokeWidth={3} />}
                </button>

                <div className="flex-1">
                  {editingId === task.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editValues.text}
                          onChange={(e) => setEditValues({ ...editValues, text: e.target.value })}
                          className="flex-1 bg-slate-900 border border-blue-500 rounded-lg px-3 py-1 text-white focus:outline-none"
                        />
                        <input
                          type="date"
                          value={editValues.dueDate}
                          onChange={(e) => setEditValues({ ...editValues, dueDate: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <textarea
                        value={editValues.description}
                        onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-white focus:outline-none h-16 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(task.id)} className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg font-bold">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Target size={16} className="text-blue-400" />
                          <h3 className={cn(
                            "font-semibold transition-all duration-300 text-sm sm:text-base",
                            task.completed ? "text-slate-400 line-through" : "text-white"
                          )}>
                            {task.text}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(task)} className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {task.description && (
                        <p className={cn(
                          "text-xs sm:text-sm mt-1 transition-all duration-300",
                          task.completed ? "text-slate-600" : "text-slate-400"
                        )}>
                          {task.description}
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
