'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Coffee, Zap, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { createPortal } from 'react-dom'

export default function FocusTimer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60)
    const [isActive, setIsActive] = useState(false)
    const [mode, setMode] = useState<'focus' | 'shortBreak'>('focus')
    const [showSettings, setShowSettings] = useState(false)
    const [customMins, setCustomMins] = useState('25')
    const [mounted, setMounted] = useState(false)

    const handleSetTime = () => {
        const mins = parseInt(customMins)
        if (!isNaN(mins) && mins > 0) {
            setTimeLeft(mins * 60)
            setIsActive(false)
            setShowSettings(false)
        }
    }

    useEffect(() => {
        setMounted(true)
        let interval: NodeJS.Timeout | null = null

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setIsActive(false)
            // Optional: Play sound or notification here
            if (mode === 'focus') {
                setMode('shortBreak')
                setTimeLeft(5 * 60)
            } else {
                setMode('focus')
                setTimeLeft(25 * 60)
            }
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isActive, timeLeft, mode])

    const toggleTimer = () => setIsActive(!isActive)

    const resetTimer = () => {
        setIsActive(false)
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60)
    }

    const switchMode = (newMode: 'focus' | 'shortBreak') => {
        setMode(newMode)
        setIsActive(false)
        setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const progress = ((mode === 'focus' ? 25 * 60 : 5 * 60) - timeLeft) / (mode === 'focus' ? 25 * 60 : 5 * 60) * 100

    return (
        <div className="glass-panel p-6 rounded-[2rem] flex flex-col items-center justify-between min-h-[300px]">
            {/* Header */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-4">
                <button
                    onClick={() => switchMode('focus')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${mode === 'focus' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Zap size={14} /> Focus
                </button>
                <button
                    onClick={() => switchMode('shortBreak')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${mode === 'shortBreak' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Coffee size={14} /> Break
                </button>
            </div>

            {/* Timer Display */}
            <div className="w-40 h-40 mb-2 relative group">
                <CircularProgressbarWithChildren
                    value={mode === 'focus' ? 100 - progress : progress} // Count down for focus, up for break? Or just always remaining? Let's do remaining visually
                    styles={buildStyles({
                        pathColor: mode === 'focus' ? '#6366f1' : '#10b981',
                        trailColor: 'rgba(255,255,255,0.1)',
                        strokeLinecap: 'round',
                        pathTransitionDuration: 0.5,
                    })}
                >
                    <div className="text-center flex flex-col items-center">
                        <div className="text-4xl font-bold text-white font-mono tracking-wider">
                            {formatTime(timeLeft)}
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">
                            {isActive ? 'Running' : 'Paused'}
                        </p>
                    </div>
                </CircularProgressbarWithChildren>

                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-full blur-[40px] opacity-20 ${mode === 'focus' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />

                {/* Adjust Controls (Visible on Hover/Pause) */}
                {!isActive && (
                    <div className="absolute inset-x-0 -bottom-8 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setTimeLeft(curr => Math.max(60, curr - 60))} className="p-1 text-gray-400 hover:text-white bg-black/50 rounded-full backdrop-blur-md"><Minus size={14} /></button>
                        <span className="text-xs text-gray-500 font-bold py-1">Adjust</span>
                        <button onClick={() => setTimeLeft(curr => curr + 60)} className="p-1 text-gray-400 hover:text-white bg-black/50 rounded-full backdrop-blur-md"><Plus size={14} /></button>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-4 w-full">
                    <button
                        onClick={resetTimer}
                        className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    >
                        <RotateCcw size={20} />
                    </button>
                    <button
                        onClick={toggleTimer}
                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${isActive
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                            : 'bg-white text-black hover:bg-gray-200'
                            }`}
                    >
                        {isActive ? (
                            <>
                                <Pause size={20} fill="currentColor" /> Pause
                            </>
                        ) : (
                            <>
                                <Play size={20} fill="currentColor" /> Start
                            </>
                        )}
                    </button>
                </div>

                {/* Custom Time Button */}
                <button
                    onClick={() => setShowSettings(true)}
                    className="w-full py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all text-sm font-bold flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Set Custom Time
                </button>
            </div>

            {/* Global Portal for Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-[#0B0C15] border border-white/10 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] w-full max-w-[calc(100vw-40px)] sm:max-w-[400px] shadow-[0_0_80px_rgba(99,102,241,0.3)] relative overflow-hidden"
                            >
                                {/* Background Accent */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 blur-[80px] rounded-full" />

                                <div className="relative z-10">
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/20 rounded-xl font-bold">
                                            <Zap className="text-indigo-400" size={20} />
                                        </div>
                                        Session Time
                                    </h3>
                                    <p className="text-gray-400 text-xs sm:text-sm mb-6 sm:mb-8">Customize your focus flow.</p>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 sm:mb-8">
                                        {[15, 25, 45, 60].map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setCustomMins(m.toString())}
                                                className={`py-3.5 rounded-2xl text-xs font-bold transition-all ${customMins === m.toString() ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                            >
                                                {m}m
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative mb-10">
                                        <input
                                            type="number"
                                            value={customMins}
                                            onChange={(e) => setCustomMins(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-3xl py-6 px-6 text-white text-4xl font-bold font-mono text-center outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                            placeholder="25"
                                        />
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-600 font-black uppercase text-[12px] tracking-[0.2em]">MIN</div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setShowSettings(false)}
                                            className="flex-1 py-4 rounded-2xl text-gray-400 font-bold hover:text-white hover:bg-white/5 transition-all text-sm"
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            onClick={handleSetTime}
                                            className="flex-1 py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all shadow-xl active:scale-95 text-sm"
                                        >
                                            Update Time
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    )
}
