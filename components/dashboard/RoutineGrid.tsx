'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2, Clock, Plus, Loader2 } from 'lucide-react'
import AddItemModal from './AddItemModal'
import ItemDetailModal from './ItemDetailModal'
import LoadingState from './LoadingState'

export default function RoutineGrid({ userId }: { userId?: string }) {
    const [routines, setRoutines] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    const fetchRoutines = async () => {
        if (!userId) return
        setLoading(true)
        try {
            const res = await fetch(`/api/routines?userId=${userId}`)
            const data = await res.json()
            if (res.ok) setRoutines(data)
        } catch (e) {
            console.error("Failed to load routines")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRoutines()
    }, [userId])

    const toggleComplete = async (id: string, completed: boolean) => {
        if (!userId) return
        setRoutines(prev => prev.map(r => r.id === id ? { ...r, completed: !completed } : r))
        try {
            await fetch('/api/routines', {
                method: 'PATCH',
                body: JSON.stringify({ id, completed: !completed, userId })
            })
        } catch (e) {
            fetchRoutines()
        }
    }

    const deleteRoutine = async (id: string) => {
        if (!userId) return
        setRoutines(prev => prev.filter(r => r.id !== id))
        try {
            await fetch('/api/routines', {
                method: 'DELETE',
                body: JSON.stringify({ id, userId })
            })
        } catch (e) {
            fetchRoutines()
        }
    }

    return (
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={userId || ''}
                onSuccess={fetchRoutines}
                initialType="routine"
                lockType={true}
            />

            <ItemDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                item={selectedItem}
            />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white">Daily Routine</h2>
                    <p className="text-sm text-gray-400">Your roadmap for success</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-xs font-bold"
                >
                    <Plus size={16} strokeWidth={3} />
                    Add Routine
                </button>
            </div>

            {loading ? (
                <LoadingState message="Fetching your routines..." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {routines.length === 0 ? (
                        <div className="col-span-full text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                            <p className="text-gray-500">No routines set. Plan your day! 🚀</p>
                        </div>
                    ) : (
                        routines.map((routine, index) => (
                            <motion.div
                                key={routine.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`group p-4 rounded-2xl border transition-all duration-300 ${routine.completed ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                            >
                                <div className="flex items-start gap-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleComplete(routine.id, routine.completed);
                                        }}
                                        className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${routine.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-700 hover:border-indigo-400'}`}
                                    >
                                        {routine.completed && <Check size={14} strokeWidth={3} />}
                                    </button>
                                    <div
                                        className="flex-1 min-w-0 cursor-pointer"
                                        onClick={() => {
                                            setSelectedItem({ ...routine, type: 'routine' });
                                            setIsDetailModalOpen(true);
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {routine.time}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteRoutine(routine.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <h3 className={`font-semibold mt-2 ${routine.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{routine.title}</h3>
                                        {routine.description && (
                                            <p className={`text-xs mt-1 ${routine.completed ? 'text-gray-600' : 'text-gray-400'}`}>{routine.description}</p>
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
