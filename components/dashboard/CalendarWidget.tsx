'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface CalendarWidgetProps {
    selectedDate: Date
    onSelect: (date: Date) => void
}

export default function CalendarWidget({ selectedDate, onSelect }: CalendarWidgetProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const today = new Date()

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const calendarDays = []
    const totalDays = daysInMonth(year, month)
    const startDay = firstDayOfMonth(year, month)

    // Empty slots for previous month
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="h-8 w-8" />)
    }

    // Days
    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(year, month, i)
        // Reset Time for comparison
        const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear()
        const isSelected = i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()

        calendarDays.push(
            <motion.button
                key={`day-${i}`}
                whileHover={{ scale: 1.1 }}
                onClick={() => onSelect(date)}
                className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-full text-xs cursor-pointer transition-all relative font-medium",
                    isSelected ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40" :
                        isToday ? "bg-white/10 text-white border border-white/20" :
                            "text-gray-400 hover:text-white hover:bg-white/5"
                )}
            >
                {i}
                {isToday && !isSelected && <span className="absolute -bottom-1 w-1 h-1 bg-indigo-500 rounded-full"></span>}
            </motion.button>
        )
    }

    return (
        <div className="bg-[#050505] rounded-[2rem] p-4 sm:p-6 border border-[#2a2a30] w-full flex flex-col justify-start min-h-0 md:min-h-[350px]">
            <div className="flex items-center justify-between mb-8 sm:mb-6">
                <h3 className="font-bold text-white text-lg">
                    {monthNames[month]} {year}
                </h3>
                <div className="flex gap-1">
                    <button
                        onClick={prevMonth}
                        className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={`${day}-${index}`} className="text-[10px] font-bold text-gray-500 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-3 gap-x-1 place-items-center flex-1 content-start">
                {calendarDays}
            </div>
        </div>
    )
}
