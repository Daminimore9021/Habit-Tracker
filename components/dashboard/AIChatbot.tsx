'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, User, Brain, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AIChatbot({ userId }: { userId?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: "Hello! I'm your FocusFlow AI. I can analyze your progress or just chat. How are you feeling today?" }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return

        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsLoading(true)

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, userId })
            })

            const data = await res.json()
            if (data.response) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble thinking right now. Please try again." }])
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Is the server running?" }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="glass-panel rounded-[2rem] flex flex-col h-[500px] max-h-[70vh] w-[calc(100vw-32px)] sm:w-[400px] overflow-hidden border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-4"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-xl">
                                    <Sparkles className="text-indigo-400" size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Assistant</h3>
                                    <p className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        ONLINE
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide bg-black/20">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg'
                                        : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                                        <Loader2 className="animate-spin text-indigo-400" size={16} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-black/40 border-t border-white/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Ask about your progress..."
                                    className="w-full bg-[#0f0f12] border border-[#2a2a30] text-white text-sm rounded-xl py-3.5 pl-4 pr-12 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-600"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:opacity-50"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative group overflow-hidden ${isOpen ? 'bg-white text-black' : 'bg-indigo-600 text-white'
                    }`}
            >
                {/* Glow Effect */}
                {!isOpen && (
                    <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
                )}

                <div className="relative z-10">
                    {isOpen ? <X size={24} /> : <Brain size={28} className="animate-bounce" style={{ animationDuration: '3s' }} />}
                </div>
            </motion.button>
        </div>
    )
}
