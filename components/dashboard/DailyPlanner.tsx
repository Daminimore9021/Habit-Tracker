'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, Plus, Loader2, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AddItemModal from './AddItemModal'
import ItemDetailModal from './ItemDetailModal'

interface Item {
    id: string
    type: 'habit' | 'routine' | 'task'
    title: string
    completed: boolean
    time?: string // for routines
    emoji?: string // for habits
    description?: string
}

export default function DailyPlanner({ selectedDate, userId }: { selectedDate: Date, userId?: string }) {
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [newItemText, setNewItemText] = useState('')
    const [newItemType, setNewItemType] = useState<'task' | 'habit' | 'routine'>('task')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<Item | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    const dateStr = selectedDate.toISOString().split('T')[0]

    const lastFetch = useRef(dateStr + userId)

    const fetchData = async () => {
        if (!userId) return
        setLoading(true)
        try {
            console.log(`DailyPlanner: Fetching data for userId: ${userId}, date: ${dateStr}`);
            const [habitsRes, tasksRes, routinesRes] = await Promise.all([
                fetch(`/api/habits?userId=${userId}`),
                fetch(`/api/tasks?date=${dateStr}&userId=${userId}`),
                fetch(`/api/routines?userId=${userId}&date=${dateStr}`)
            ]);

            if (!habitsRes.ok || !tasksRes.ok || !routinesRes.ok) {
                console.error("DailyPlanner: One or more fetches failed", {
                    habits: habitsRes.status,
                    tasks: tasksRes.status,
                    routines: routinesRes.status
                });
            }

            const habits = await habitsRes.json()
            const tasks = await tasksRes.json()
            const routines = await routinesRes.json()

            const combined: Item[] = [
                ...(Array.isArray(habits) ? habits.map((h: any) => ({
                    id: h.id,
                    type: 'habit' as const,
                    title: h.title,
                    completed: h.logs?.some((l: any) => l.date === dateStr) || false,
                    emoji: h.emoji,
                    description: h.description
                })) : []),
                ...(Array.isArray(routines) ? routines.map((r: any) => ({
                    id: r.id,
                    type: 'routine' as const,
                    title: r.title,
                    completed: r.logs?.some((l: any) => l.date === dateStr) || false,
                    time: r.time,
                    description: r.description
                })) : []),
                ...(Array.isArray(tasks) ? tasks.map((t: any) => ({
                    id: t.id,
                    type: 'task' as const,
                    title: t.title,
                    completed: t.completed,
                    description: t.description
                })) : [])
            ]

            setItems(combined)
        } catch (e) {
            console.error("DailyPlanner: Failed to fetch data", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const currentParams = dateStr + userId
        if (currentParams !== lastFetch.current) {
            fetchData()
            lastFetch.current = currentParams
        } else if (items.length === 0 && !loading) {
            // Initial mount fetch
            fetchData()
        }
    }, [selectedDate, userId])

    const deleteItem = async (id: string, type: 'habit' | 'routine' | 'task') => {
        if (!userId) return

        // Optimistic UI update
        setItems(prev => prev.filter(item => item.id !== id))

        try {
            const endpoint = type === 'habit' ? '/api/habits' : type === 'task' ? '/api/tasks' : '/api/routines'
            const res = await fetch(endpoint, {
                method: 'DELETE',
                body: JSON.stringify({ id, userId })
            })
            if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
        } catch (e) {
            console.error("DailyPlanner: Failed to delete", e)
            fetchData() // Re-fetch on error to restore item
        }
    }

    const toggleItem = async (id: string, type: 'habit' | 'routine' | 'task', currentCompleted: boolean) => {
        if (!userId) return
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, completed: !currentCompleted } : item
        ))

        try {
            let res;
            if (type === 'habit') {
                res = await fetch('/api/habits/log', {
                    method: 'POST',
                    body: JSON.stringify({ habitId: id, date: dateStr, completed: !currentCompleted, userId })
                })
            } else if (type === 'task') {
                res = await fetch('/api/tasks', {
                    method: 'PATCH',
                    body: JSON.stringify({ id, completed: !currentCompleted, userId })
                })
            } else if (type === 'routine') {
                res = await fetch('/api/routines', {
                    method: 'PATCH',
                    body: JSON.stringify({ id, completed: !currentCompleted, userId })
                })
            }
            if (res && !res.ok) throw new Error(`Toggle failed: ${res.status}`);

            // Trigger Badge Check
            if (res && res.ok && userId) {
                await fetch('/api/badges', {
                    method: 'POST',
                    body: JSON.stringify({ userId, actionContext: { type: 'item_toggle', itemType: type } })
                })
            }
        } catch (e) {
            console.error("DailyPlanner: Failed to toggle", e)
            fetchData(); // Sync back
        }
    }

    const addNewItem = async () => {
        if (!newItemText.trim() || !userId) {
            console.warn("DailyPlanner: Cannot add item", { newItemText, userId });
            return
        }

        try {
            let res;
            if (newItemType === 'task') {
                res = await fetch('/api/tasks', {
                    method: 'POST',
                    body: JSON.stringify({ title: newItemText, date: dateStr, userId })
                })
            } else if (newItemType === 'habit') {
                res = await fetch('/api/habits', {
                    method: 'POST',
                    body: JSON.stringify({ title: newItemText, emoji: '⚡', color: 'blue', userId })
                })
            } else if (newItemType === 'routine') {
                res = await fetch('/api/routines', {
                    method: 'POST',
                    body: JSON.stringify({ title: newItemText, time: 'Daily', userId })
                })
            }

            if (res && res.ok) {
                setNewItemText('')
                fetchData() // Refresh list
            } else {
                const errData = await res?.json();
                console.error("DailyPlanner: Failed to add item", errData);
                alert(`Failed to add: ${errData?.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error("DailyPlanner: Error adding item", e)
            alert("Error adding item. Check console.");
        }
    }

    return (
        <div className="w-full h-full bg-[#050505] rounded-[2rem] p-4 sm:p-6 border border-[#2a2a30]">
            {userId && (
                <AddItemModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    userId={userId}
                    onSuccess={fetchData}
                    initialType={newItemType}
                    defaultDate={dateStr}
                />
            )}

            <ItemDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                item={selectedItem}
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Daily Focus</h2>
                    <p className="text-sm text-gray-500">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <button
                    onClick={() => { setNewItemType('task'); setIsModalOpen(true); }}
                    className="group flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    <Plus size={16} className="group-hover:scale-110 transition-transform" />
                    Add Item
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tasks Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tasks</h3>
                        </div>
                        <div className="space-y-3">
                            {items.filter(item => item.type === 'task').length === 0 ? (
                                <div className="text-[10px] text-gray-600 italic py-4">No tasks.</div>
                            ) : (
                                items.filter(item => item.type === 'task').map(item => (
                                    <ItemRow
                                        key={item.id}
                                        item={item}
                                        toggleItem={toggleItem}
                                        deleteItem={deleteItem}
                                        onView={(item) => { setSelectedItem(item); setIsDetailModalOpen(true); }}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Habits Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Habits</h3>
                        </div>
                        <div className="space-y-3">
                            {items.filter(item => item.type === 'habit').length === 0 ? (
                                <div className="text-[10px] text-gray-600 italic py-4">No habits.</div>
                            ) : (
                                items.filter(item => item.type === 'habit').map(item => (
                                    <ItemRow
                                        key={item.id}
                                        item={item}
                                        toggleItem={toggleItem}
                                        deleteItem={deleteItem}
                                        onView={(item) => { setSelectedItem(item); setIsDetailModalOpen(true); }}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Routines Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Routine</h3>
                        </div>
                        <div className="space-y-3">
                            {items.filter(item => item.type === 'routine').length === 0 ? (
                                <div className="text-[10px] text-gray-600 italic py-4">No routines.</div>
                            ) : (
                                items.filter(item => item.type === 'routine').map(item => (
                                    <ItemRow
                                        key={item.id}
                                        item={item}
                                        toggleItem={toggleItem}
                                        deleteItem={deleteItem}
                                        onView={(item) => { setSelectedItem(item); setIsDetailModalOpen(true); }}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function ItemRow({ item, toggleItem, deleteItem, onView }: { item: Item, toggleItem: any, deleteItem: any, onView: (item: Item) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${item.completed
                ? 'bg-indigo-500/5 border-indigo-500/10 opacity-60'
                : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                }`}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(item.id, item.type, item.completed);
                }}
                className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${item.completed
                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'border-gray-700 text-transparent hover:border-indigo-400'
                    }`}
            >
                <Check size={14} strokeWidth={4} />
            </button>

            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onView(item)}>
                <div className={`font-semibold text-xs sm:text-sm truncate transition-all ${item.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                    {item.title}
                </div>
                {item.description && (
                    <div className={`text-[9px] sm:text-[10px] mt-0.5 line-clamp-1 transition-all ${item.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                        {item.description}
                    </div>
                )}
                <div className="flex items-center justify-between mt-1">
                    {item.time && (
                        <span className="text-[9px] text-gray-500 font-mono">
                            {item.time}
                        </span>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id, item.type);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
