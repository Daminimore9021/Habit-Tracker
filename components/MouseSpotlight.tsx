'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

export default function MouseSpotlight() {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth movement with springs
    const springConfig = { damping: 25, stiffness: 150 }
    const spotlightX = useSpring(mouseX, springConfig)
    const spotlightY = useSpring(mouseY, springConfig)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {/* Primary Large Glow */}
            <motion.div
                className="absolute w-[1000px] h-[1000px] rounded-full blur-[150px] opacity-40 bg-blue-500/20"
                style={{
                    x: spotlightX,
                    y: spotlightY,
                    left: -500,
                    top: -500,
                }}
            />

            {/* Secondary Sharper Glow */}
            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-30 bg-purple-500/30"
                style={{
                    x: spotlightX,
                    y: spotlightY,
                    left: -200,
                    top: -200,
                }}
            />

            {/* Central Cursor Point */}
            <motion.div
                className="absolute w-2 h-2 bg-blue-400 rounded-full blur-[2px] opacity-60"
                style={{
                    x: spotlightX,
                    y: spotlightY,
                    left: -4,
                    top: -4,
                }}
            />

            {/* Interactive Grid Overlay */}
            <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}
            />
        </div>
    )
}
