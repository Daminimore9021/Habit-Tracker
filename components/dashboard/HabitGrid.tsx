'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Flame, Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import AddItemModal from './AddItemModal'
import ItemDetailModal from './ItemDetailModal'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface Habit {
    id: string
    name: string
    completed: boolean
    streak: number
    completedDates: string[]
    color?: string
}

const HABIT_COLORS = [
    "from-orange-400 to-amber-400",
    "from-purple-500 to-indigo-500",
    "from-cyan-400 to-blue-400",
    "from-emerald-400 to-teal-400",
    "from-pink-500 to-rose-500",
]

export default function HabitGrid({ userId }: { userId?: string }) {
    const [habits, setHabits] = useState<Habit[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    // Get current week dates (Mon-Sun)
    const [weekDates, setWeekDates] = useState<Date[]>([])

    const fetchHabits = async () => {
        if (!userId) return
        try {
            // 1. Generate current week
            const today = new Date()
            const day = today.getDay()
            const diff = today.getDate() - day + (day === 0 ? -6 : 1)
            const monday = new Date(today.setDate(diff))
            const week = []
            for (let i = 0; i < 7; i++) {
                const d = new Date(monday)
                d.setDate(monday.getDate() + i)
                week.push(d)
            }
            setWeekDates(week)

            // 2. Fetch habits from API
            const res = await fetch(`/api/habits?userId=${userId}`)
            const data = await res.json()

            if (data && Array.isArray(data)) {
                setHabits(data.map((h: any, i: number) => ({
                    id: h.id,
                    name: h.title,
                    completed: false, // fallback
                    streak: h.streak || 0,
                    completedDates: h.logs?.map((l: any) => l.date) || [],
                    color: HABIT_COLORS[i % HABIT_COLORS.length]
                })))
            }
        } catch (e) {
            console.error("Failed to load habits", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHabits()
    }, [userId])

    const deleteHabit = async (id: string) => {
        if (!userId) return

        // Optimistic UI update
        setHabits(prev => prev.filter(h => h.id !== id))

        try {
            await fetch('/api/habits', {
                method: 'DELETE',
                body: JSON.stringify({ id, userId })
            })
        } catch (e) {
            console.error("Failed to delete habit", e)
            fetchHabits() // Rollback on error
        }
    }

    const toggleHabitDate = async (habitId: string, date: Date) => {
        if (!userId) return
        const dateStr = date.toISOString().split('T')[0]
        const habit = habits.find(h => h.id === habitId)
        if (!habit) return

        const isCompleted = habit.completedDates?.includes(dateStr)

        // Optimistic UI update
        const updatedHabits = habits.map(h => {
            if (h.id === habitId) {
                const newDates = isCompleted
                    ? h.completedDates.filter(d => d !== dateStr)
                    : [...(h.completedDates || []), dateStr]
                return { ...h, completedDates: newDates }
            }
            return h
        })
        setHabits(updatedHabits)

        try {
            // 1. Sync with API
            await fetch('/api/habits/log', {
                method: 'POST',
                body: JSON.stringify({ habitId, date: dateStr, completed: !isCompleted, userId })
            })

            // Trigger Badge Check
            await fetch('/api/badges', {
                method: 'POST',
                body: JSON.stringify({ userId, actionContext: { type: 'habit_toggle', date: dateStr } })
            })
        } catch (e) {
            console.error("Failed to toggle habit", e)
        }
    }

    const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' })
    const getDayNum = (date: Date) => date.getDate()

    const isToday = (date: Date) => {
        const today = new Date()
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
    }

    return (
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={userId || ''}
                onSuccess={fetchHabits}
                initialType="habit"
                lockType={true}
            />

            <ItemDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                item={selectedItem}
            />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white">Daily Habits</h2>
                    <p className="text-sm text-gray-400">Track your consistency</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-xs font-bold"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Add Habit
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-[200px_1fr] gap-4 mb-4">
                        <div className="flex items-end pb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Habit Name</span>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {weekDates.map((date, i) => (
                                <div key={i} className={`flex flex-col items-center gap-1 pb-2 border-b-2 ${isToday(date) ? 'border-blue-500' : 'border-transparent'}`}>
                                    <span className={`text-[10px] font-bold uppercase ${isToday(date) ? 'text-blue-400' : 'text-gray-500'}`}>
                                        {getDayName(date)}
                                    </span>
                                    <span className={`text-sm font-bold ${isToday(date) ? 'text-white' : 'text-gray-400'}`}>
                                        {getDayNum(date)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Habit Rows */}
                    <div className="space-y-3">
                        {habits.map((habit) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={habit.id}
                                className="grid grid-cols-[200px_1fr] gap-4 items-center group py-2"
                            >
                                {/* Habit Info */}
                                <div className="flex items-center gap-3">
                                    <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${habit.color || "from-gray-500 to-gray-700"}`}></div>
                                    <div
                                        className="flex-1 min-w-0 cursor-pointer"
                                        onClick={() => {
                                            setSelectedItem({ ...habit, title: habit.name, type: 'habit' });
                                            setIsDetailModalOpen(true);
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-gray-200 group-hover:text-white transition-colors truncate">{habit.name}</h4>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteHabit(habit.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all ml-2"
                                                title="Delete Habit"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-orange-400 font-bold">
                                            <Flame size={10} className="fill-orange-400" />
                                            {habit.streak} day streak
                                        </div>
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="grid grid-cols-7 gap-2">
                                    {weekDates.map((date, i) => {
                                        const dateStr = date.toISOString().split('T')[0]
                                        const isCompleted = habit.completedDates?.includes(dateStr)
                                        const isFuture = date > new Date() // simplistic future check

                                        return (
                                            <div key={i} className="flex justify-center">
                                                <button
                                                    onClick={() => toggleHabitDate(habit.id, date)}
                                                    disabled={isFuture}
                                                    className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                                                        isFuture ? "opacity-20 cursor-not-allowed bg-gray-800" :
                                                            isCompleted
                                                                ? `bg-gradient-to-br ${habit.color} shadow-lg`
                                                                : "bg-[#0f0f15] border border-[#2a2a30] hover:border-gray-500"
                                                    )}
                                                >
                                                    {isCompleted && (
                                                        <motion.div
                                                            initial={{ scale: 0.5, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                        >
                                                            <Check size={18} strokeWidth={4} className="text-white drop-shadow-md" />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
