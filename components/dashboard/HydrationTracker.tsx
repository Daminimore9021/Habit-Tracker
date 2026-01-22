'use client'

import { useState } from 'react'
import { Droplets, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function HydrationTracker() {
    const [glasses, setGlasses] = useState(0)
    const goal = 8

    const addGlass = () => setGlasses(prev => Math.min(prev + 1, goal))
    const removeGlass = () => setGlasses(prev => Math.max(prev - 1, 0))

    const percentage = Math.round((glasses / goal) * 100)

    return (
        <div className="glass-panel p-6 rounded-[2rem] relative overflow-hidden min-h-[200px] flex flex-col justify-between">
            <div className="flex items-center justify-between z-10 relative">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Droplets className="text-sky-400" size={20} />
                        Hydration
                    </h3>
                    <p className="text-sm text-gray-400">Daily Water Intake</p>
                </div>
                <div className="text-2xl font-bold text-white">
                    {glasses}<span className="text-gray-500 text-sm">/{goal}</span>
                </div>
            </div>

            {/* Visual Representation */}
            <div className="flex items-end justify-between gap-1 h-32 my-4 z-10 relative px-2">
                {[...Array(goal)].map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end h-full gap-1 group cursor-pointer" onClick={() => setGlasses(i + 1)}>
                        <div className="relative w-full bg-white/5 rounded-full overflow-hidden transition-all duration-300 hover:bg-white/10" style={{ height: '100%' }}>
                            <motion.div
                                initial={{ height: '0%' }}
                                animate={{ height: i < glasses ? '100%' : '0%' }}
                                className="absolute bottom-0 w-full bg-gradient-to-t from-sky-500 to-cyan-400"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 z-10 relative">
                <button
                    onClick={removeGlass}
                    className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <Minus size={20} />
                </button>
                <button
                    onClick={addGlass}
                    className="flex-1 py-3 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition-all font-bold flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> Add Water
                </button>
            </div>

            {/* Background Wave Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-full opacity-5 pointer-events-none">
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    className="absolute bottom-0 w-full h-2/3 bg-sky-500 blur-[80px]"
                />
            </div>
        </div>
    )
}
