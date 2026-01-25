'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion'

export default function MouseSpotlight() {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([])

    // Physics configuration for the "Antigravity" fluid feel
    const createSpring = (damping: number, stiffness: number) => ({ damping, stiffness })

    // Multiple points for a smooth, organic trail
    const points = [
        { x: useSpring(mouseX, createSpring(30, 200)), y: useSpring(mouseY, createSpring(30, 200)), size: 400, color: 'rgba(59, 130, 246, 0.2)' },
        { x: useSpring(mouseX, createSpring(40, 150)), y: useSpring(mouseY, createSpring(40, 150)), size: 300, color: 'rgba(139, 92, 246, 0.15)' },
        { x: useSpring(mouseX, createSpring(50, 100)), y: useSpring(mouseY, createSpring(50, 100)), size: 200, color: 'rgba(59, 130, 246, 0.1)' }
    ]

    const cursorDotX = useSpring(mouseX, createSpring(20, 400))
    const cursorDotY = useSpring(mouseY, createSpring(20, 400))

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }

        const handleClick = (e: MouseEvent) => {
            const id = Date.now()
            setClicks(prev => [...prev, { id, x: e.clientX, y: e.clientY }])
            setTimeout(() => {
                setClicks(prev => prev.filter(c => c.id !== id))
            }, 1000)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('click', handleClick)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('click', handleClick)
        }
    }, [mouseX, mouseY])

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {/* Organic Fluid Trail */}
            {points.map((point, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full blur-[80px]"
                    style={{
                        x: point.x,
                        y: point.y,
                        width: point.size,
                        height: point.size,
                        left: -point.size / 2,
                        top: -point.size / 2,
                        backgroundColor: point.color,
                        zIndex: 10 - i
                    }}
                />
            ))}

            {/* Sharp Lead Point */}
            <motion.div
                className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full blur-[1px] opacity-80"
                style={{
                    x: cursorDotX,
                    y: cursorDotY,
                    left: -3,
                    top: -3,
                }}
            />

            {/* Inner Glow Core */}
            <motion.div
                className="absolute w-32 h-32 bg-white/10 rounded-full blur-2xl"
                style={{
                    x: cursorDotX,
                    y: cursorDotY,
                    left: -64,
                    top: -64,
                }}
            />

            {/* Interactive Click Shockwaves */}
            <AnimatePresence>
                {clicks.map(click => (
                    <motion.div
                        key={click.id}
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 4, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute w-40 h-40 border border-blue-500/30 rounded-full"
                        style={{
                            left: click.x - 80,
                            top: click.y - 80,
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Deep Background Grid that slightly reacts */}
            <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #3b82f6 1px, transparent 0)`,
                    backgroundSize: '48px 48px'
                }}
            />
        </div>
    )
}
