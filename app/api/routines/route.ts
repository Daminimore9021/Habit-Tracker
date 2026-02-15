import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import prisma from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth-helpers'


export async function GET(request: NextRequest) {
    headers()
    try {
        const authResult = await getAuthenticatedUser(request)
        if (authResult.error) return authResult.response

        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date')

        const routines = await prisma.routine.findMany({
            where: { userId: authResult.userId! },
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


export async function POST(request: NextRequest) {
    try {
        const authResult = await getAuthenticatedUser(request)
        if (authResult.error) return authResult.response

        const body = await request.json()
        const { title, time = "Daily", description } = body

        const routine = await prisma.routine.create({
            data: {
                title,
                time,
                description,
                userId: authResult.userId!,
                completed: false,
                order: 99
            }
        })

        return NextResponse.json(routine)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create routine' }, { status: 500 })
    }
}


export async function PATCH(request: NextRequest) {
    try {
        const authResult = await getAuthenticatedUser(request)
        if (authResult.error) return authResult.response

        const body = await request.json()
        const { id, completed, date } = body

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
        if (completed) {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
                body: JSON.stringify({ xpToAdd: 5 })
            })
        }

        return NextResponse.json({ success: true, completed })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}


export async function DELETE(request: NextRequest) {
    try {
        const authResult = await getAuthenticatedUser(request)
        if (authResult.error) return authResult.response

        const body = await request.json()
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: 'Routine ID is required' }, { status: 400 })
        }

        const routine = await (prisma as any).routine.delete({
            where: { id, userId: authResult.userId! }
        })

        return NextResponse.json({ success: true, routine })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete routine' }, { status: 500 })
    }
}
