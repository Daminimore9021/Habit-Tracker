import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { habitId, date, completed, userId } = body

        if (completed) {
            await prisma.habitLog.upsert({
                where: {
                    date_habitId: {
                        date,
                        habitId
                    }
                },
                update: {},
                create: {
                    date,
                    habitId
                }
            })

            // Update streak
            const habit = await prisma.habit.findUnique({
                where: { id: habitId },
                select: { streak: true }
            })
            await prisma.habit.update({
                where: { id: habitId },
                data: { streak: (habit?.streak || 0) + 1 }
            })

            // Award XP
            if (userId) {
                await fetch('http://localhost:3000/api/user', {
                    method: 'POST',
                    body: JSON.stringify({ xpToAdd: 20, userId })
                })
            }

        } else {
            await prisma.habitLog.deleteMany({
                where: { date, habitId }
            })

            // Update streak
            const habit = await prisma.habit.findUnique({
                where: { id: habitId },
                select: { streak: true }
            })
            await prisma.habit.update({
                where: { id: habitId },
                data: { streak: Math.max(0, (habit?.streak || 0) - 1) }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Log error:', error)
        return NextResponse.json({ error: error.message || 'Failed to toggle habit log' }, { status: 500 })
    }
}
