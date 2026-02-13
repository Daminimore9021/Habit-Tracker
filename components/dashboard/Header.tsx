'use client'

import { Bell, Search, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import MoodTracker from './MoodTracker'
import SettingsModal from './SettingsModal'

export default function Header({ userId, userData }: { userId?: string, userData?: any }) {
    const [userName, setUserName] = useState('User')
    const [userAvatar, setUserAvatar] = useState<string | null>(null)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState(userData)
    const today = new Date()

    useEffect(() => {
        if (userData) {
            setCurrentUser(userData)
            if (userData.name) setUserName(userData.name)
            if (userData.avatar) setUserAvatar(userData.avatar)
        }
    }, [userData])

    const handleUpdate = (newData: any) => {
        setCurrentUser(newData)
        setUserName(newData.name)
        setUserAvatar(newData.avatar)
    }

    const dateStr = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })

    const hour = today.getHours()
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'

    return (
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-6 px-1">
            <div className="w-full md:w-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{userName}</span>
                </h1>
                <p className="text-gray-400 mt-1 text-xs sm:text-sm font-medium">{dateStr}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
                {/* Mood Tracker */}
                <MoodTracker userId={userId} />

                <div className="flex items-center gap-4">
                    <div className="relative group hidden md:block">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="bg-[#0f0f12] border border-[#2a2a30] text-gray-200 text-sm rounded-xl block pl-10 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-600 w-48"
                            placeholder="Search..."
                        />
                    </div>

                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 p-[2px] hover:scale-110 transition-transform active:scale-95 shadow-lg shadow-indigo-500/20"
                    >
                        <img
                            src={userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                            alt="Profile"
                            className="rounded-full bg-black h-full w-full object-cover"
                        />
                    </button>
                </div>
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                userData={currentUser}
                onUpdate={handleUpdate}
            />
        </header>
    )
}
