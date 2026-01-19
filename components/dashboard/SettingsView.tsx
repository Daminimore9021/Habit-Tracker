'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Save, AlertTriangle, Trash2, Camera } from 'lucide-react'

interface SettingsViewProps {
    userId?: string
}

export default function SettingsView({ userId }: SettingsViewProps) {
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        if (userId) {
            fetch(`/api/user?userId=${userId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.name) setName(data.name)
                    if (data.avatar) setAvatar(data.avatar)
                })
        }
    }, [userId])

    const handleUpdateProfile = async () => {
        setLoading(true)
        setErrorMsg('')
        setSuccessMsg('')
        try {
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, name, avatar })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setSuccessMsg('Profile updated successfully!')
        } catch (e: any) {
            setErrorMsg(e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePassword = async () => {
        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match")
            return
        }
        if (password.length < 6) {
            setErrorMsg("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        setErrorMsg('')
        setSuccessMsg('')
        try {
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setSuccessMsg('Password updated successfully!')
            setPassword('')
            setConfirmPassword('')
        } catch (e: any) {
            setErrorMsg(e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatar(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {/* Profile Section */}
                <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <User size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Profile Settings</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                                    {avatar ? (
                                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-gray-500" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 transition-colors shadow-lg">
                                    <Camera size={14} className="text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Profile Photo</h4>
                                <p className="text-xs text-gray-500">Click the camera icon to upload.</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                placeholder="Enter your name"
                            />
                        </div>
                        <button
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>

                {/* Password Section */}
                <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Lock size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Security</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            onClick={handleUpdatePassword}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            <Save size={16} /> Update Password
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Notification Messages */}
            {successMsg && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-center font-bold"
                >
                    {successMsg}
                </motion.div>
            )}
            {errorMsg && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center font-bold"
                >
                    {errorMsg}
                </motion.div>
            )}

            {/* Danger Zone */}
            <div className="bg-red-900/5 border border-red-500/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-red-500">Danger Zone</h3>
                        <p className="text-sm text-red-400/60">Once you delete your account, there is no going back.</p>
                    </div>
                </div>
                <button
                    className="px-6 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-500/20 rounded-lg font-bold transition-all text-sm flex items-center gap-2"
                    onClick={() => alert('Account deletion is disabled in this demo.')}
                >
                    <Trash2 size={14} /> Delete Account
                </button>
            </div>
        </div>
    )
}
