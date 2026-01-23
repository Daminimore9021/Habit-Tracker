import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const habits = await prisma.habit.findMany({
            where: { userId },
            include: { logs: true },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json(habits)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch habits' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, emoji, color, description, userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const habit = await prisma.habit.create({
            data: {
                title,
                emoji,
                color,
                description,
                userId,
            }
        })

        return NextResponse.json(habit)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create habit' }, { status: 500 })
    }
}
export async function DELETE(request: Request) {
    try {
        const body = await request.json()
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: 'Habit ID is required' }, { status: 400 })
        }

        const habit = await prisma.habit.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, habit })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete habit' }, { status: 500 })
    }
}
