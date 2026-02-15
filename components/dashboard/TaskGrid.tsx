'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2, Calendar, Plus, Loader2, Target } from 'lucide-react'
import AddItemModal from './AddItemModal'
import ItemDetailModal from './ItemDetailModal'
import LoadingState from './LoadingState'

export default function TaskGrid({ userId }: { userId?: string }) {
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    const fetchTasks = async () => {
        if (!userId) return
        setLoading(true)
        try {
            const res = await fetch(`/api/tasks?userId=${userId}&date=${selectedDate}`)
            const data = await res.json()
            if (res.ok) setTasks(data)
        } catch (e) {
            console.error("Failed to load tasks")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [userId, selectedDate])

    const toggleComplete = async (id: string, completed: boolean) => {
        if (!userId) return
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t))
        try {
            await fetch('/api/tasks', {
                method: 'PATCH',
                body: JSON.stringify({ id, completed: !completed, userId })
            })
        } catch (e) {
            fetchTasks()
        }
    }

    const deleteTask = async (id: string) => {
        if (!userId) return
        setTasks(prev => prev.filter(t => t.id !== id))
        try {
            await fetch('/api/tasks', {
                method: 'DELETE',
                body: JSON.stringify({ id, userId })
            })
        } catch (e) {
            fetchTasks()
        }
    }

    return (
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={userId || ''}
                onSuccess={fetchTasks}
                initialType="task"
                defaultDate={selectedDate}
                lockType={true}
            />

            <ItemDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                item={selectedItem}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">Tasks</h2>
                        <p className="text-sm text-gray-400">Get things done</p>
                    </div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-indigo-400 font-bold focus:outline-none focus:border-indigo-500/50"
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-xs font-bold w-fit"
                >
                    <Plus size={16} strokeWidth={3} />
                    Add Task
                </button>
            </div>

            {loading ? (
                <LoadingState message="Organizing your day..." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.length === 0 ? (
                        <div className="col-span-full text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                            <p className="text-gray-500">No tasks for this date. ✨</p>
                        </div>
                    ) : (
                        tasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`group p-4 rounded-2xl border transition-all duration-300 ${task.completed ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                            >
                                <div className="flex items-start gap-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleComplete(task.id, task.completed);
                                        }}
                                        className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-700 hover:border-indigo-400'}`}
                                    >
                                        {task.completed && <Check size={14} strokeWidth={3} />}
                                    </button>
                                    <div
                                        className="flex-1 min-w-0 cursor-pointer"
                                        onClick={() => {
                                            setSelectedItem({ ...task, type: 'task' });
                                            setIsDetailModalOpen(true);
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Target size={14} className="text-indigo-400" />
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{task.date}</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteTask(task.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <h3 className={`font-semibold mt-2 ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</h3>
                                        {task.description && (
                                            <p className={`text-xs mt-1 ${task.completed ? 'text-gray-600' : 'text-gray-400'}`}>{task.description}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
