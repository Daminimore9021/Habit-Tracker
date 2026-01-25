'use client'

import React, { useRef, useEffect } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

export default function MouseSpotlight() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth springs for the glow
    const springConfig = { damping: 30, stiffness: 200 }
    const glowX = useSpring(mouseX, springConfig)
    const glowY = useSpring(mouseY, springConfig)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let w: number, h: number, particles: Particle[] = []
        const particleCount = 60
        const connectionDistance = 150
        const mouse = { x: 0, y: 0, radius: 200 }

        class Particle {
            x: number
            y: number
            vx: number
            vy: number
            size: number

            constructor() {
                this.x = Math.random() * w
                this.y = Math.random() * h
                this.vx = (Math.random() - 0.5) * 0.5
                this.vy = (Math.random() - 0.5) * 0.5
                this.size = Math.random() * 2 + 1
            }

            update() {
                this.x += this.vx
                this.y += this.vy

                if (this.x < 0 || this.x > w) this.vx *= -1
                if (this.y < 0 || this.y > h) this.vy *= -1

                // Mouse attraction/repulsion logic
                const dx = mouse.x - this.x
                const dy = mouse.y - this.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius
                    this.x -= dx * force * 0.02
                    this.y -= dy * force * 0.02
                }
            }

            draw() {
                if (!ctx) return
                ctx.fillStyle = 'rgba(59, 130, 246, 0.5)'
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        const init = () => {
            w = canvas.width = window.innerWidth
            h = canvas.height = window.innerHeight
            particles = []
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle())
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, w, h)

            particles.forEach((p, i) => {
                p.update()
                p.draw()

                // Connect particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j]
                    const dx = p.x - p2.x
                    const dy = p.y - p2.y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < connectionDistance) {
                        ctx.strokeStyle = `rgba(59, 130, 246, ${1 - dist / connectionDistance})`
                        ctx.lineWidth = 0.5
                        ctx.beginPath()
                        ctx.moveTo(p.x, p.y)
                        ctx.lineTo(p2.x, p2.y)
                        ctx.stroke()
                    }
                }

                // Connect to mouse
                const dxM = p.x - mouse.x
                const dyM = p.y - mouse.y
                const distM = Math.sqrt(dxM * dxM + dyM * dyM)
                if (distM < mouse.radius) {
                    ctx.strokeStyle = `rgba(139, 92, 246, ${1 - distM / mouse.radius})`
                    ctx.lineWidth = 1
                    ctx.beginPath()
                    ctx.moveTo(p.x, p.y)
                    ctx.lineTo(mouse.x, mouse.y)
                    ctx.stroke()
                }
            });

            requestAnimationFrame(animate)
        }

        const handleResize = () => init()
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX
            mouse.y = e.clientY
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('mousemove', handleMouseMove)

        init()
        animate()

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [mouseX, mouseY])

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden bg-black/5">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 block h-full w-full"
            />

            {/* Dynamic Glow Spotlight */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-[0.15] bg-blue-500/20 mix-blend-screen"
                style={{
                    x: glowX,
                    y: glowY,
                    left: -400,
                    top: -400,
                }}
            />

            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-[0.2] bg-purple-500/30 mix-blend-screen"
                style={{
                    x: glowX,
                    y: glowY,
                    left: -200,
                    top: -200,
                }}
            />

            {/* Floating Cursor Lead */}
            <motion.div
                className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                style={{
                    x: glowX,
                    y: glowY,
                    left: -0.5,
                    top: -0.5,
                }}
            />
        </div>
    )
}
