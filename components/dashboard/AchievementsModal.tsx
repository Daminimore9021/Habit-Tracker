
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Award, Loader2 } from 'lucide-react'
import LoadingState from './LoadingState'

interface Badge {
    id: string
    name: string
    description: string
    icon: string
    category: string
    color: string
    earned: boolean
    earnedAt?: string
}

interface AchievementsModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
}

export default function AchievementsModal({ isOpen, onClose, userId }: AchievementsModalProps) {
    const [badges, setBadges] = useState<Badge[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true)
            fetch(`/api/badges?userId=${userId}`)
                .then(res => res.json())
                .then(data => {
                    setBadges(data)
                    setLoading(false)
                })
                .catch(e => {
                    console.error("Failed to load badges", e)
                    setLoading(false)
                })
        }
    }, [isOpen, userId])

    if (!isOpen) return null

    const earnedCount = badges.filter(b => b.earned).length
    const totalCount = badges.length
    const progress = Math.round((earnedCount / totalCount) * 100) || 0

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-2xl bg-[#0f0f15] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                <Award className="w-8 h-8 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Achievements</h2>
                                <p className="text-sm text-gray-400">Unlock badges by staying consistent</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                            <span className="text-indigo-400">{earnedCount} Unlocked</span>
                            <span className="text-gray-500">{totalCount - earnedCount} Locked</span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {loading ? (
                        <LoadingState message="Fetching your achievements..." />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {badges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className={`relative p-4 rounded-xl border transition-all ${badge.earned
                                        ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10'
                                        : 'bg-black/20 border-white/5 opacity-60 grayscale'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg ${badge.earned
                                            ? `bg-gradient-to-br ${badge.color}`
                                            : 'bg-gray-800'
                                            }`}>
                                            {badge.earned ? badge.icon : <Lock size={16} className="text-gray-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold ${badge.earned ? 'text-white' : 'text-gray-500'}`}>
                                                {badge.name}
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                                {badge.description}
                                            </p>
                                            {badge.earned && (
                                                <div className="mt-2 text-[10px] text-gray-500 font-mono bg-black/30 inline-block px-1.5 py-0.5 rounded">
                                                    Unlocked {new Date(badge.earnedAt!).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {badge.earned && (
                                        <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
