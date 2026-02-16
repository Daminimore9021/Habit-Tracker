'use client'

import React, { useRef, useEffect } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

export default function MouseSpotlight() {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth movement
    const springX = useSpring(mouseX, { damping: 50, stiffness: 400 })
    const springY = useSpring(mouseY, { damping: 50, stiffness: 400 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    return (
        <motion.div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none', // Crucial: don't block clicks or scroll
                zIndex: 9999,
                background: `radial-gradient(600px circle at calc(var(--x) * 1px) calc(var(--y) * 1px), rgba(99, 102, 241, 0.05), transparent 80%)`,
                // @ts-ignore
                '--x': springX,
                // @ts-ignore
                '--y': springY,
            }}
            className="hidden lg:block"
        />
    )
}
