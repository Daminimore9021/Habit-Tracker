import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date')
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const tasks = await (prisma as any).task.findMany({
            where: {
                userId,
                ...(date ? { date } : {})
            },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json(tasks)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch tasks' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, date, description, userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const task = await (prisma as any).task.create({
            data: {
                title,
                date, // YYYY-MM-DD
                description,
                userId,
                completed: false
            }
        })

        return NextResponse.json(task)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create task' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { id, completed, userId } = body

        const task = await (prisma as any).task.update({
            where: { id },
            data: { completed }
        })

        // Award XP if completed
        if (completed && userId) {
            await fetch('http://localhost:3000/api/user', {
                method: 'POST',
                body: JSON.stringify({ xpToAdd: 10, userId })
            })
        }

        return NextResponse.json(task)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
export async function DELETE(request: Request) {
    try {
        const body = await request.json()
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
        }

        const task = await (prisma as any).task.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, task })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete task' }, { status: 500 })
    }
}
