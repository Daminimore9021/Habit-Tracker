'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Loader2, Plus, Languages, Sparkles } from 'lucide-react'

interface AddItemModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    onSuccess: () => void
    initialType?: 'task' | 'habit' | 'routine'
    defaultDate?: string
    lockType?: boolean
}

export default function AddItemModal({ isOpen, onClose, userId, onSuccess, initialType = 'task', defaultDate, lockType = false }: AddItemModalProps) {
    const [type, setType] = useState<'task' | 'habit' | 'routine'>(initialType)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setType(initialType)
        }
    }, [initialType, isOpen])
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '09:00',
        endTime: '10:00',
        date: defaultDate || new Date().toISOString().split('T')[0],
        emoji: '⚡',
        color: 'blue'
    })
    const [translatingField, setTranslatingField] = useState<'title' | 'description' | null>(null)

    const translateField = async (field: 'title' | 'description') => {
        const text = formData[field] as string
        if (!text || text.length < 2) return

        setTranslatingField(field)
        try {
            // We'll try Hindi first as it's the most common "Hinglish" case
            // If it seems like Marathi, we could add a toggle, but Hi covers most Hinglish.
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            })
            const data = await res.json()
            if (data.translatedText) {
                setFormData(prev => ({ ...prev, [field]: data.translatedText }))
            }
        } catch (error) {
            console.error('Translation error:', error)
        } finally {
            setTranslatingField(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title.trim()) return

        setLoading(true)
        try {
            let endpoint = '/api/tasks'
            let body: any = { title: formData.title, description: formData.description, userId }

            if (type === 'task') {
                endpoint = '/api/tasks'
                body.date = formData.date
            } else if (type === 'habit') {
                endpoint = '/api/habits'
                body.emoji = formData.emoji
                body.color = formData.color
            } else if (type === 'routine') {
                endpoint = '/api/routines'
                // Format time range: "09:00 - 10:00"
                body.time = `${formData.startTime} - ${formData.endTime}`
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                onSuccess()
                onClose()
                setFormData({
                    title: '',
                    description: '',
                    startTime: '09:00',
                    endTime: '10:00',
                    date: defaultDate || new Date().toISOString().split('T')[0],
                    emoji: '⚡',
                    color: 'blue'
                })
            } else {
                const err = await res.json()
                alert(err.error || 'Failed to add item')
            }
        } catch (error) {
            console.error('Error adding item:', error)
            alert('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg bg-[#0f0f15] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
            >
                <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Add New Item</h2>
                            <p className="text-sm text-gray-400">What are we focusing on today?</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>

                    {!lockType && (
                        <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
                            {['task', 'habit', 'routine'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setType(t as any)}
                                    className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all capitalize ${type === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 relative">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">Title</label>
                                <button
                                    type="button"
                                    onClick={() => translateField('title')}
                                    disabled={translatingField === 'title' || !formData.title}
                                    className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-all bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20 disabled:opacity-30"
                                >
                                    {translatingField === 'title' ? (
                                        <Loader2 size={10} className="animate-spin" />
                                    ) : (
                                        <Languages size={10} />
                                    )}
                                    Translate to English
                                </button>
                            </div>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder={`Enter ${type} title...`}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">Description</label>
                                <button
                                    type="button"
                                    onClick={() => translateField('description')}
                                    disabled={translatingField === 'description' || !formData.description}
                                    className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-all bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20 disabled:opacity-30"
                                >
                                    {translatingField === 'description' ? (
                                        <Loader2 size={10} className="animate-spin" />
                                    ) : (
                                        <Languages size={10} />
                                    )}
                                    Translate to English
                                </button>
                            </div>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Details about this item (optional)..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium h-24 resize-none"
                            />
                        </div>

                        {type === 'task' && (
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">Due Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        )}

                        {type === 'routine' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">Start Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="time"
                                            required
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">End Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="time"
                                            required
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <Plus size={20} strokeWidth={3} />
                                    Add {type}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
