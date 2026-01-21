'use client'

import {
    Home,
    Calendar,
    CheckSquare,
    LayoutDashboard,
    Settings,
    LogOut,
    Menu,
    X,
    TrendingUp
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface SidebarProps {
    activeTab: string
    setActiveTab: (tab: string) => void
    logout: () => void
    userId?: string
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'habits', label: 'Habits', icon: LayoutDashboard },
    { id: 'routine', label: 'Routine', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'analytics', label: 'AI Evolution', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
]

import AchievementsModal from './AchievementsModal'

// ... existing imports

export default function Sidebar({ activeTab, setActiveTab, logout, userId }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showAchievements, setShowAchievements] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return
            try {
                const res = await fetch(`/api/user?userId=${userId}`)
                const data = await res.json()
                if (res.ok) {
                    setUser(data)
                }
            } catch (e) {
                console.error("Failed to fetch user")
            } finally {
                setLoading(false)
            }
        }
        fetchUser()

        // Polling for real-time XP updates
        const interval = setInterval(fetchUser, 5000)
        return () => clearInterval(interval)
    }, [userId])

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#050505] border-r border-[#1a1a1a]">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
                    <LayoutDashboard className="text-white" size={18} />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">FocusFlow</span>
            </div>

            {/* User Profile / XP Bar */}
            <div className="px-6 pb-6">
                <button
                    onClick={() => setShowAchievements(true)}
                    className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-indigo-500/30 hover:bg-white/10 transition-all group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-colors">
                                <span className="text-xs font-bold text-indigo-400">LVL</span>
                            </div>
                            <span className="font-bold text-white text-sm group-hover:text-indigo-200 transition-colors">{user?.level || 1}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{user?.xp || 0} / {(user?.level || 1) * 100} XP</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(user?.xp % 100) || 0}%` }}
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 font-medium flex items-center justify-between">
                        <span>Next level in {100 - (user?.xp % 100 || 0)} XP</span>
                        <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">View Badges →</span>
                    </p>
                </button>
            </div>

            <div className="flex-1 px-4 py-4 space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-4">
                    Menu
                </div>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveTab(item.id)
                            setIsOpen(false)
                        }}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                            activeTab === item.id
                                ? "bg-white/5 text-white shadow-md shadow-black/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon
                            size={18}
                            className={cn(
                                "transition-colors",
                                activeTab === item.id ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"
                            )}
                        />
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-[#1a1a1a]">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 text-sm font-medium"
                >
                    <LogOut size={18} />
                    <span>Log Out</span>
                </button>
            </div>

            {userId && (
                <AchievementsModal
                    isOpen={showAchievements}
                    onClose={() => setShowAchievements(false)}
                    userId={userId}
                />
            )}
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 h-screen fixed left-0 top-0 z-40">
                <SidebarContent />
            </aside>

            {/* Mobile Toggle */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-white shadow-lg"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 shadow-2xl"
                        >
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
