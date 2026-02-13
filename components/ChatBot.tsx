'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, User } from 'lucide-react'

interface Message {
    id: string
    text: string
    sender: 'bot' | 'user'
    timestamp: Date
}

export default function ChatBot() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    // Hide on auth pages
    const isAuthPage = pathname?.startsWith('/login') ||
        pathname?.startsWith('/signup') ||
        pathname?.startsWith('/reset-password')

    if (isAuthPage) return null

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Welcome to FocusFlow! ✨ I\'m your AI assistant. How can I help you optimize your habits and routines today?',
            sender: 'bot',
            timestamp: new Date()
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isOpen, isLoading])

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return

        const userId = localStorage.getItem('userId')
        if (!userId) {
            alert('Please login to use FocusFlow AI')
            return
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)

        try {
            const history = messages.map(msg => ({
                role: msg.sender === 'bot' ? 'model' : 'user',
                content: msg.text
            }))

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: inputValue,
                    userId,
                    history
                })
            })

            const data = await res.json()

            if (data.error) throw new Error(data.error)

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.content,
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botMessage])
        } catch (e: any) {
            console.error("ChatBot Error:", e)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I encountered an error. Please try again later.",
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[350px] sm:w-[400px] h-[500px] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                    >
                        {/* Header */}
                        <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                    <Bot className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">FocusFlow AI</h3>
                                    <div className="flex items-center gap-1.5 leading-none">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500/80">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${msg.sender === 'bot'
                                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                        : 'bg-white/5 border-white/10 text-white/50'
                                        }`}>
                                        {msg.sender === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'bot'
                                        ? 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                                        : 'bg-indigo-600/20 border border-indigo-500/30 text-white rounded-tr-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-start gap-2.5">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center border shrink-0 bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                                        <Bot className="w-4 h-4 animate-pulse" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 text-white/40 p-3 rounded-2xl rounded-tl-none text-xs flex gap-1 items-center">
                                        <span className="w-1 h-1 bg-white/40 rounded-full animate-bounce"></span>
                                        <span className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/5 bg-white/5">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Command the AI..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/20"
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all text-white shadow-lg shadow-indigo-500/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 border border-indigo-400/30 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                {isOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
            </motion.button>
        </div>
    )
}
