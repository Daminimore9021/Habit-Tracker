import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    headers()
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const date = searchParams.get('date') // Optional: to filter logs in the future

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const routines = await prisma.routine.findMany({
            where: { userId },
            include: {
                logs: date ? { where: { date } } : true
            },
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

        const routine = await prisma.routine.create({
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
        const { id, completed, userId, date } = body

        if (!date) {
            return NextResponse.json({ error: 'Date is required for routine tracking' }, { status: 400 })
        }

        let routineLog
        if (completed) {
            routineLog = await prisma.routineLog.upsert({
                where: {
                    date_routineId: {
                        date,
                        routineId: id
                    }
                },
                update: {},
                create: {
                    date,
                    routineId: id
                }
            })
        } else {
            await prisma.routineLog.deleteMany({
                where: {
                    date,
                    routineId: id
                }
            })
        }

        // Award XP if completed
        if (completed && userId) {
            await fetch('http://localhost:3000/api/user', {
                method: 'POST',
                body: JSON.stringify({ xpToAdd: 5, userId })
            })
        }

        return NextResponse.json({ success: true, completed })
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
