'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, MoreHorizontal, ArrowUp, Loader2, Check } from 'lucide-react'
import LoadingState from './LoadingState'

function AnimatedNumber({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        let start = 0
        const end = value
        if (start === end) return

        let totalDuration = 1000
        let iterationTime = 20
        let totalIterations = totalDuration / iterationTime
        let increment = end / totalIterations

        let timer = setInterval(() => {
            start += increment
            if (start >= end) {
                setDisplayValue(end)
                clearInterval(timer)
            } else {
                setDisplayValue(Math.floor(start))
            }
        }, iterationTime)

        return () => clearInterval(timer)
    }, [value])

    return <span>{displayValue.toLocaleString()}</span>
}

interface ProgressRingProps {
    progress: number
    size?: number
    strokeWidth?: number
    color?: string
    trackColor?: string
    label?: string
    sublabel?: string
}

function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 10,
    color = "#6366f1",
    trackColor = "rgba(255,255,255,0.05)",
    label,
    sublabel
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (progress / 100) * circumference

    return (
        <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="transform -rotate-90 w-full h-full">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={trackColor}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white leading-none">
                        <AnimatedNumber value={progress} />%
                    </span>
                </div>
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-300">{label}</p>
                {sublabel && <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-0.5">{sublabel}</p>}
            </div>
        </div>
    )
}

export default function StatsOverview({ userId }: { userId?: string }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = async () => {
        if (!userId) return
        try {
            const res = await fetch(`/api/stats?userId=${userId}`)
            const json = await res.json()
            if (res.ok) {
                setData(json)
            }
        } catch (e) {
            console.error("Failed to fetch stats")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        // Poll every 60 seconds instead of every 5 seconds to reduce load
        const interval = setInterval(fetchStats, 60000)
        return () => clearInterval(interval)
    }, [userId])

    if (loading && !data) {
        return <LoadingState message="Calculating your progress..." />
    }

    const stats = [
        { label: 'Weekly Score', value: `${data?.thisWeekProgress || 0}%`, color: 'indigo' },
        { label: 'Total XP', value: data?.totalXp?.toLocaleString() || '0', color: 'pink' },
        { label: 'Current Streak', value: `${data?.streak || 0} Days`, color: 'blue' },
        { label: 'Level', value: data?.level?.toString() || '1', color: 'purple' },
    ]

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Overall Progress Card */}
                <div className="glass-panel rounded-[2rem] p-6 col-span-1 md:col-span-2 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div>
                            <h3 className="text-lg font-bold text-white">Your Performance</h3>
                            <p className="text-sm text-gray-400">Weekly tracking analysis</p>
                        </div>
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    <div className="flex flex-row justify-around items-end relative z-10 pb-4 sm:pb-0 gap-1 sm:gap-2">
                        <div className="scale-[0.85] sm:scale-100 flex-1 flex justify-center">
                            <ProgressRing
                                progress={data?.lastWeekProgress || 0}
                                size={100}
                                strokeWidth={8}
                                color="#3b82f6"
                                label="Last"
                            />
                        </div>
                        <div className="scale-95 sm:scale-100 flex-1 flex justify-center transform translate-y-[-5px] sm:translate-y-0">
                            <ProgressRing
                                progress={data?.thisWeekProgress || 0}
                                size={120}
                                strokeWidth={10}
                                color="#8b5cf6"
                                label="This Week"
                                sublabel={data?.thisWeekProgress > 80 ? "EXC!" : "GO!"}
                            />
                        </div>
                        <div className="scale-[0.85] sm:scale-100 flex-1 flex justify-center">
                            <ProgressRing
                                progress={data?.todayProgress || 0}
                                size={100}
                                strokeWidth={8}
                                color="#06b6d4"
                                label="Today"
                            />
                        </div>
                    </div>

                    {/* Background decoration - empty state by default as requested */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 opacity-5 pointer-events-none">
                        <div className="flex items-end justify-between px-4 h-full gap-2">
                            {/* Empty or very subtle bars */}
                            {[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                                <div key={i} className="flex-1 bg-white rounded-t-sm" style={{ height: `2px` }}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Adherence Card */}
                <div className="glass-panel rounded-[2rem] p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Adherence</h3>
                        <div className="bg-emerald-500/10 p-2 rounded-lg">
                            <TrendingUp size={20} className="text-emerald-500" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <span className="text-4xl font-bold text-white">
                                <AnimatedNumber value={data?.thisWeekProgress || 0} />%
                            </span>
                            <span className="text-emerald-400 text-xs font-bold ml-2 inline-flex items-center">
                                <ArrowUp size={12} className="mr-0.5" />
                                <AnimatedNumber value={Math.max(0, (data?.thisWeekProgress || 0) - (data?.lastWeekProgress || 0))} />%
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-snug">
                            {data?.thisWeekProgress >= (data?.lastWeekProgress || 0)
                                ? "You're performing better than last week! Keep it up."
                                : "A bit behind last week's pace. You've got this!"}
                        </p>

                        <div className="w-full bg-white/5 rounded-full h-2 mt-4 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data?.thisWeekProgress || 0}%` }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#050505] rounded-2xl p-4 border border-[#2a2a30] flex flex-col items-center text-center shadow-lg shadow-black/20"
                    >
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">{stat.label}</p>
                        <p className="text-xl font-bold text-white">{stat.value}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

