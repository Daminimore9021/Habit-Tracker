'use client'

import { Bell, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import MoodTracker from './MoodTracker'
export default function Header({ userId }: { userId?: string }) {
    const [userName, setUserName] = useState('User')
    const [userAvatar, setUserAvatar] = useState<string | null>(null)
    const today = new Date()

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return
            try {
                const res = await fetch(`/api/user?userId=${userId}`)
                if (res.status === 404) {
                    console.warn("User not found, logging out");
                    localStorage.clear();
                    window.location.href = '/login';
                    return;
                }
                const data = await res.json()
                if (data.name) setUserName(data.name)
                if (data.avatar) setUserAvatar(data.avatar)
            } catch (e) {
                console.error("Failed to fetch user", e)
            }
        }
        fetchUser()
    }, [userId])

    const dateStr = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })

    const hour = today.getHours()
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'

    return (
        <header className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6 py-6 px-1">
            <div className="w-full sm:w-auto">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{userName}</span>
                </h1>
                <p className="text-gray-400 mt-1 text-sm font-medium">{dateStr}</p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center gap-6 w-full sm:w-auto">
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

                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 p-[2px]">
                        <img
                            src={userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                            alt="Profile"
                            className="rounded-full bg-black h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}
