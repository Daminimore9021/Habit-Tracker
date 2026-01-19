'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote } from 'lucide-react'
import Image from 'next/image'

const quotes = [
    "Your only limit is your mind. ✨",
    "Consistency is the key to success. 🔑",
    "Push yourself, because no one else is going to do it for you. 💪",
    "Success started with a disciplined routine. 📈",
    "Don't stop until you're proud. 🌟",
    "Small daily habits lead to massive results. 🚀"
]

export default function MotivationalSection() {
    const [quote, setQuote] = useState("")

    useEffect(() => {
        // Pick a random quote based on the day
        const day = new Date().getDate()
        setQuote(quotes[day % quotes.length])
    }, [])

    return (
        <div className="relative w-full h-[220px] rounded-3xl overflow-hidden glass-card border-slate-800/50 group">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/habit_tracker_hero_1767234817473.png"
                    alt="Productivity"
                    fill
                    className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>

            <div className="relative z-10 h-full p-6 flex flex-col justify-end">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Quote className="text-blue-500 mb-2 opacity-50" size={24} />
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 leading-tight">
                        The secret of your future is hidden in your daily routine.
                    </h2>
                    <p className="text-blue-400 text-xs sm:text-sm font-medium tracking-wide">
                        {quote}
                    </p>
                </motion.div>
            </div>

            {/* Decorative Blur */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 blur-3xl -mr-12 -mt-12" />
        </div>
    )
}
