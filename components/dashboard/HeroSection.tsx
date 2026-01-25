'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Zap, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

const QUOTES = [
    { text: "Consistency is the key to mastering a new habit.", highlight: "mastering a new habit", author: "Unknown" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", highlight: "keeps you going", author: "Jim Ryun" },
    { text: "Small daily improvements are the key to staggering long-term results.", highlight: "staggering results", author: "Robin Sharma" },
    { text: "The secret of your future is hidden in your daily routine.", highlight: "daily routine", author: "Mike Murdock" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", highlight: "excellence", author: "Aristotle" },
    { text: "Don't watch the clock; do what it does. Keep going.", highlight: "keep going", author: "Sam Levenson" },
    { text: "Your net worth to the world is usually determined by what remains after your bad habits are subtracted from your good ones.", highlight: "good habits", author: "Benjamin Franklin" },
]

export default function HeroSection() {
    const [quote, setQuote] = useState(QUOTES[0])
    const [isRotating, setIsRotating] = useState(false)

    useEffect(() => {
        // Pick a quote based on the day of the year to be "Daily"
        const today = new Date()
        const start = new Date(today.getFullYear(), 0, 0)
        const diff = (today.getTime() - start.getTime()) + ((start.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000)
        const oneDay = 1000 * 60 * 60 * 24
        const dayOfYear = Math.floor(diff / oneDay)

        setQuote(QUOTES[dayOfYear % QUOTES.length])
    }, [])

    const rotateQuote = () => {
        setIsRotating(true)
        setTimeout(() => {
            const nextIndex = (QUOTES.indexOf(quote) + 1) % QUOTES.length
            setQuote(QUOTES[nextIndex])
            setIsRotating(false)
        }, 500)
    }

    const parts = quote.text.split(quote.highlight)

    // Dynamic text sizing based on length
    const getFontSize = (text: string) => {
        if (text.length > 100) return "text-xl md:text-2xl"
        if (text.length > 60) return "text-2xl md:text-3xl"
        return "text-2xl md:text-4xl"
    }

    return (
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/5 shadow-2xl h-full min-h-[350px] flex items-center">
            {/* Dynamic Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full mix-blend-screen" />

            <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="space-y-6 max-w-xl text-center md:text-left flex flex-col items-center md:items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase tracking-wider backdrop-blur-md">
                                <Zap size={12} className="fill-amber-400" />
                                Daily Wisdom
                            </span>
                            <button
                                onClick={rotateQuote}
                                className="p-1 rounded-full text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                                title="New quote"
                            >
                                <RefreshCw size={14} className={isRotating ? "animate-spin" : ""} />
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.h2
                                key={quote.text}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`${getFontSize(quote.text)} font-extrabold text-white leading-tight`}
                            >
                                {parts[0]}<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 relative inline mx-1">
                                    {quote.highlight}
                                    <svg className="absolute w-full h-2 bottom-1 left-0 text-purple-500/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                    </svg>
                                </span>{parts[1]}
                            </motion.h2>
                        </AnimatePresence>

                        <motion.p
                            key={quote.author}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-slate-400 mt-4 text-sm md:text-base font-medium italic opacity-80"
                        >
                            — {quote.author}
                        </motion.p>
                    </motion.div>

                    {/* Start Planning button removed */}
                </div>

                {/* 3D Visual - Hidden on mobile, shown on md+ */}
                <motion.div
                    className="relative w-64 h-64 flex-shrink-0 perspective-1000 hidden md:flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="relative w-48 h-48 animate-float">
                        <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-[2rem] opacity-30 blur-3xl animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-[2rem] border border-white/20 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-4 flex items-center justify-center shadow-lg shadow-orange-500/20 text-4xl">
                                💡
                            </div>
                            <div className="space-y-1">
                                <div className="h-2 w-24 bg-white/10 rounded-full mx-auto"></div>
                                <div className="h-2 w-16 bg-white/10 rounded-full mx-auto"></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )

}
