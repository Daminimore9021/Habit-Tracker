'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, TrendingUp, Calendar, Activity } from 'lucide-react'
import TrendChart from './TrendChart'

export default function AnalyticsDashboard() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem('userId')
            if (!userId) return

            try {
                const res = await fetch(`/api/stats?userId=${userId}`)
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                }
            } catch (error) {
                console.error('Failed to load analytics', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!data) return null

    // Prepare data slices
    const last30Days = data.history || []
    const last7Days = last30Days.slice(-7)

    return (
        <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
            {/* Header with AI Insight */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-[#0B0C15] border border-white/10 p-8 text-white shadow-2xl"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Brain size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Sparkles className="w-6 h-6 text-yellow-300" />
                        </div>
                        <h2 className="text-xl font-bold tracking-wider uppercase">AI Evolution Insight</h2>
                    </div>

                    <p className="text-2xl sm:text-3xl font-light leading-relaxed max-w-3xl">
                        "{data.insight || "Keep tracking to generate insights."}"
                    </p>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(data.tips || []).map((tip: string, i: number) => (
                            <div key={i} className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 text-sm leading-relaxed text-blue-50">
                                {tip}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <TrendChart
                        title="Weekly Flow"
                        description="Your consistency over the last 7 days"
                        data={last7Days}
                        color="#3b82f6"
                        trend={data.thisWeekProgress >= data.lastWeekProgress ? 'up' : 'down'}
                        trendValue={`${Math.abs(data.thisWeekProgress - data.lastWeekProgress)}% vs last week`}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <TrendChart
                        title="Monthly Momentum"
                        description="30-day evolution & habit formation"
                        data={last30Days}
                        color="#8b5cf6"
                        trend="neutral"
                        trendValue="Long-term tracking"
                    />
                </motion.div>
            </div>
        </div>
    )
}
