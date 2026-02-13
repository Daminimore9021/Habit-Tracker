'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Camera, Check, Loader2 } from 'lucide-react'

const AVATAR_PRESETS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie'
]

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    userData: any
    onUpdate: (newData: any) => void
}

export default function SettingsModal({ isOpen, onClose, userData, onUpdate }: SettingsModalProps) {
    const [name, setName] = useState(userData?.name || 'User')
    const [selectedAvatar, setSelectedAvatar] = useState(userData?.avatar || AVATAR_PRESETS[0])
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        const userId = localStorage.getItem('userId')
        if (!userId) return

        try {
            const res = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, avatar: selectedAvatar, userId })
            })

            if (res.ok) {
                const updatedUser = await res.json()
                onUpdate(updatedUser)
                onClose()
            }
        } catch (e) {
            console.error("Failed to update settings", e)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="glass-panel w-full max-w-md rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-white/10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-xl">
                                    <User className="text-indigo-400 w-5 h-5" />
                                </div>
                                Profile Settings
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl overflow-hidden mb-4">
                                        <img src={selectedAvatar} alt="Profile" className="w-full h-full rounded-full bg-black object-cover" />
                                    </div>
                                    <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full mb-4">
                                        <Camera className="text-white w-6 h-6" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-3 mt-2">
                                    {AVATAR_PRESETS.map((avatar, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedAvatar(avatar)}
                                            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${selectedAvatar === avatar ? 'border-indigo-400 scale-110 shadow-lg shadow-indigo-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={avatar} alt={`Avatar ${i}`} className="w-full h-full object-cover bg-black" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Form Section */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-white/5 flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3.5 rounded-2xl text-gray-400 font-bold hover:text-white transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 py-3.5 bg-white text-black rounded-2xl font-bold hover:bg-gray-200 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
