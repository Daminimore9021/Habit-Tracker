'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Target, Zap, Bot, ArrowRight, X } from 'lucide-react'

const STEPS = [
    {
        title: "Welcome to FocusFlow",
        description: "Your ultimate personal dashboard for productivity and growth. Let's take a quick tour!",
        icon: <Sparkles className="w-8 h-8 text-indigo-400" />,
        color: "from-indigo-500 to-purple-500"
    },
    {
        title: "Level Up Your Life",
        description: "Complete tasks and habits to earn XP. Watch your level grow as you build consistent routines.",
        icon: <Zap className="w-8 h-8 text-yellow-400" />,
        color: "from-yellow-500 to-orange-500"
    },
    {
        title: "Meet Your AI Coach",
        description: "FocusFlow AI is here to help. Ask it for performance insights or to help you schedule tasks!",
        icon: <Bot className="w-8 h-8 text-emerald-400" />,
        color: "from-emerald-500 to-teal-500"
    },
    {
        title: "Set Your Intentions",
        description: "Use the Daily Planner to organize your day and the Mood Tracker to stay mindful of your energy.",
        icon: <Target className="w-8 h-8 text-pink-400" />,
        color: "from-pink-500 to-rose-500"
    }
]

export default function OnboardingTour() {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenTour')
        if (!hasSeenTour) {
            setIsOpen(true)
        }
    }, [])

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleClose()
        }
    }

    const handleClose = () => {
        localStorage.setItem('hasSeenTour', 'true')
        setIsOpen(false)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass-panel w-full max-w-lg rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10"
                    >
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 w-full h-1.5 flex gap-1 px-8 pt-4">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-full flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-white' : 'bg-white/10'}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-12 flex flex-col items-center text-center space-y-8">
                            <motion.div
                                key={currentStep}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${STEPS[currentStep].color} flex items-center justify-center shadow-2xl shadow-indigo-500/20`}
                            >
                                {STEPS[currentStep].icon}
                            </motion.div>

                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-white tracking-tight">
                                    {STEPS[currentStep].title}
                                </h2>
                                <p className="text-lg text-gray-400 leading-relaxed max-w-xs mx-auto">
                                    {STEPS[currentStep].description}
                                </p>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full py-5 bg-white text-black rounded-[2rem] font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                            >
                                {currentStep === STEPS.length - 1 ? "Get Started" : "Continue"}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
