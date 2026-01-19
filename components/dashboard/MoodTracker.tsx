'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smile, Frown, Meh, Sun, CloudRain } from 'lucide-react'

const MOODS = [
    { id: 'great', icon: Sun, color: 'text-yellow-400', label: 'Great' },
    { id: 'good', icon: Smile, color: 'text-green-400', label: 'Good' },
    { id: 'okay', icon: Meh, color: 'text-blue-400', label: 'Okay' },
    { id: 'bad', icon: Frown, color: 'text-orange-400', label: 'Bad' },
    { id: 'awful', icon: CloudRain, color: 'text-slate-400', label: 'Awful' },
]

export default function MoodTracker({ userId }: { userId?: string }) {
    const [selectedMood, setSelectedMood] = useState<string | null>(null)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMood = async () => {
            if (!userId) return
            try {
                const today = new Date().toISOString().split('T')[0]
                const res = await fetch(`/api/mood?userId=${userId}`)
                const data = await res.json()
                const todayMood = data.find((m: any) => m.date === today)
                if (todayMood) setSelectedMood(todayMood.moodType)
            } catch (e) {
                console.error("Failed to fetch mood")
            } finally {
                setLoading(false)
            }
        }
        fetchMood()
    }, [userId])

    const handleSelect = async (id: string) => {
        if (!userId) return
        setSelectedMood(id)
        const today = new Date().toISOString().split('T')[0]

        // Save to Database
        try {
            await fetch('/api/mood', {
                method: 'POST',
                body: JSON.stringify({ moodType: id, date: today, userId })
            })

            // Give XP for tracking mood
            await fetch('/api/user', {
                method: 'POST',
                body: JSON.stringify({ xpToAdd: 5, userId })
            })
        } catch (e) {
            console.error("Failed to sync mood")
        }

        // Set feedback message
        const msgs: Record<string, string> = {
            great: "That's the spirit! 🌟",
            good: "Keep it up! 👍",
            okay: "Stay balanced. 😌",
            bad: "Tomorrow is a new day. 💪",
            awful: "Be kind to yourself. 💙"
        }
        setMessage(msgs[id] || "Saved!")
        setTimeout(() => setMessage(''), 3000)
    }

    if (loading) return <div className="h-20 flex items-center justify-center">...</div>

    return (
        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4 min-w-[300px]">
            <div>
                <h4 className="text-sm font-bold text-white">How are you feeling?</h4>
                <AnimatePresence mode="wait">
                    {message ? (
                        <motion.p
                            key="msg"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-[10px] text-indigo-400 font-medium"
                        >
                            {message}
                        </motion.p>
                    ) : (
                        <motion.p
                            key="def"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-[10px] text-gray-500"
                        >
                            Track your daily mood
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex bg-black/20 rounded-xl p-1 gap-1">
                {MOODS.map((mood) => {
                    const Icon = mood.icon
                    const isSelected = selectedMood === mood.id

                    return (
                        <button
                            key={mood.id}
                            onClick={() => handleSelect(mood.id)}
                            className={`relative p-2 rounded-lg transition-all duration-300 ${isSelected ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                            title={mood.label}
                        >
                            <Icon
                                size={20}
                                className={`transition-colors duration-300 ${isSelected ? mood.color : 'text-gray-400'}`}
                                strokeWidth={isSelected ? 2.5 : 2}
                            />
                            {isSelected && (
                                <motion.span
                                    layoutId="active-mood"
                                    className="absolute inset-0 rounded-lg border border-white/10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
