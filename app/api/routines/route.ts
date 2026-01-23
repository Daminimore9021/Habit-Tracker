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

        const routines = await (prisma as any).routine.findMany({
            where: { userId },
            orderBy: { order: 'asc' }
        })

        return NextResponse.json(routines)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch routines' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, time = "Daily", description, userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const routine = await (prisma as any).routine.create({
            data: {
                title,
                time,
                description,
                userId,
                completed: false,
                order: 99 // Put at end
            }
        })

        return NextResponse.json(routine)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create routine' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { id, completed, userId } = body

        const routine = await (prisma as any).routine.update({
            where: { id },
            data: { completed }
        })

        // Award XP if completed
        if (completed && userId) {
            await fetch('http://localhost:3000/api/user', {
                method: 'POST',
                body: JSON.stringify({ xpToAdd: 5, userId })
            })
        }

        return NextResponse.json(routine)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json()
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: 'Routine ID is required' }, { status: 400 })
        }

        const routine = await (prisma as any).routine.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, routine })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete routine' }, { status: 500 })
    }
}
