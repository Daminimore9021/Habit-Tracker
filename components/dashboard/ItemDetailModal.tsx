'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Tag, AlignLeft } from 'lucide-react'

interface ItemDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: string;
        type: 'habit' | 'routine' | 'task';
        title: string;
        completed: boolean;
        time?: string;
        description?: string;
        date?: string; // For tasks
        emoji?: string;
    } | null;
}

export default function ItemDetailModal({ isOpen, onClose, item }: ItemDetailModalProps) {
    if (!isOpen || !item) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0f0f12] border border-[#2a2a30] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
                        >
                            {/* Header Image / Color Bar */}
                            <div className={`h-24 w-full bg-gradient-to-r ${item.type === 'habit' ? 'from-pink-600 to-purple-600' :
                                    item.type === 'task' ? 'from-indigo-600 to-blue-600' :
                                        'from-blue-500 to-cyan-500'
                                } relative`}>
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                                >
                                    <X size={18} />
                                </button>
                                <div className="absolute -bottom-6 left-6">
                                    <div className="w-16 h-16 rounded-2xl bg-[#0f0f12] border-4 border-[#0f0f12] flex items-center justify-center text-3xl shadow-lg">
                                        {item.emoji || (
                                            item.type === 'habit' ? '🔥' :
                                                item.type === 'task' ? '✅' : '📅'
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 px-6 pb-6 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.type === 'habit' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                                                item.type === 'task' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {item.type}
                                        </span>
                                        {item.completed && (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-white leading-tight">{item.title}</h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Description */}
                                    <div className="flex gap-3">
                                        <div className="mt-1 p-2 bg-white/5 rounded-lg h-fit text-gray-400">
                                            <AlignLeft size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</h3>
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                {item.description || "No description provided."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Time / Date */}
                                    {(item.time || item.date) && (
                                        <div className="flex gap-3">
                                            <div className="mt-1 p-2 bg-white/5 rounded-lg h-fit text-gray-400">
                                                {item.type === 'routine' ? <Clock size={16} /> : <Calendar size={16} />}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                    {item.type === 'routine' ? 'Time' : 'Date'}
                                                </h3>
                                                <p className="text-sm text-gray-300 font-mono">
                                                    {item.time || item.date}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
