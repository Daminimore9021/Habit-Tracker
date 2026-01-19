'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export default function ModernCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date())

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const days = daysInMonth(year, month)
    const firstDay = firstDayOfMonth(year, month)

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

    const today = new Date()

    return (
        <div className="glass-card rounded-3xl p-4 border-slate-800/50 h-[220px] flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-sm">{monthNames[month]} {year}</h3>
                    <div className="flex gap-1">
                        <button onClick={prevMonth} className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                            <ChevronLeft size={14} />
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-center text-[8px] uppercase font-bold text-slate-500">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {[...Array(firstDay)].map((_, i) => (
                        <div key={`empty-${i}`} className="h-6" />
                    ))}
                    {[...Array(days)].map((_, i) => {
                        const day = i + 1
                        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
                        return (
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                key={day}
                                className={cn(
                                    "h-6 flex items-center justify-center rounded-lg text-[10px] font-medium transition-all duration-300 cursor-pointer",
                                    isToday
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                {day}
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Today: {today.getDate()} {monthNames[today.getMonth()]}</p>
                </div>
            </div>
        </div>
    )
}
