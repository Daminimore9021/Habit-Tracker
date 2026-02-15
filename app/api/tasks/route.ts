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

        const tasks = await (prisma as any).task.findMany({
            where: {
                userId: authResult.userId!,
                ...(date ? { date } : {})
            },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json(tasks)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch tasks' }, { status: 500 })
    }
}


export async function POST(request: NextRequest) {
    try {
        const authResult = await getAuthenticatedUser(request)
        if (authResult.error) return authResult.response

        const body = await request.json()
        const { title, date, description } = body

        const task = await (prisma as any).task.create({
            data: {
                title,
                date,
                description,
                userId: authResult.userId!,
                completed: false
            }
        })

        return NextResponse.json(task)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create task' }, { status: 500 })
    }
}


export async function PATCH(request: NextRequest) {
    try {
        const authResult = await getAuthenticatedUser(request)
        if (authResult.error) return authResult.response

        const body = await request.json()
        const { id, completed } = body

        const task = await (prisma as any).task.update({
            where: { id, userId: authResult.userId! },
            data: { completed }
        })

        // Award XP if completed (call internal API)
        if (completed) {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
                body: JSON.stringify({ xpToAdd: 10 })
            })
        }

        return NextResponse.json(task)
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
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
        }

        const task = await (prisma as any).task.delete({
            where: { id, userId: authResult.userId! }
        })

        return NextResponse.json({ success: true, task })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete task' }, { status: 500 })
    }
}
