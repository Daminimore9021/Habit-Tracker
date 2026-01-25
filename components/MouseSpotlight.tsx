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
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
            {/* Main Spotlight Glow */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 bg-blue-500/30"
                style={{
                    x: spotlightX,
                    y: spotlightY,
                    left: -400,
                    top: -400,
                }}
            />

            {/* Subtle Purple Counter-glow */}
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-10 bg-purple-500/20"
                style={{
                    x: spotlightX,
                    y: spotlightY,
                    left: -300,
                    top: -300,
                    transitionDelay: '0.1s'
                }}
            />

            {/* Interactive Grid Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}
            />
        </div>
    )
}
