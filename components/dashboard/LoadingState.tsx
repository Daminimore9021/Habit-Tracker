'use client'

import { motion } from 'framer-motion'

export default function LoadingState({ message = "Loading..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-12 h-12">
                {/* Outer pulsing ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-indigo-500/20"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Spinning arc */}
                <motion.div
                    className="absolute inset-0 rounded-full border-t-2 border-indigo-500"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Inner dot */}
                <motion.div
                    className="absolute inset-[18px] rounded-full bg-indigo-500/40"
                    animate={{
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <motion.p
                className="text-xs font-medium text-gray-500 tracking-wider uppercase"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {message}
            </motion.p>
        </div>
    )
}
