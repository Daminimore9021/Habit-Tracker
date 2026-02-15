import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import prisma from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth-helpers'


export async function GET(request: NextRequest) {
    headers()
    console.log('--- Habits API hit [Vercel-Fix-Check] ---')
    try {
        // Get authenticated user from Supabase session
        const authResult = await getAuthenticatedUser(request)

        if (authResult.error) {
            return authResult.response
        }

        const habits = await prisma.habit.findMany({
            where: { userId: authResult.userId },
            include: { logs: true },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json(habits)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch habits' }, { status: 500 })
    }
}


export async function POST(request: NextRequest) {
    try {
        // Get authenticated user from Supabase session
        const authResult = await getAuthenticatedUser(request)

        if (authResult.error) {
            return authResult.response
        }

        const body = await request.json()
        const { title, emoji, color, description } = body

        const habit = await prisma.habit.create({
            data: {
                title,
                emoji,
                color,
                description,
                userId: authResult.userId!,
            }
        })

        return NextResponse.json(habit)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create habit' }, { status: 500 })
    }
}
export async function DELETE(request: NextRequest) {
    try {
        // Get authenticated user from Supabase session
        const authResult = await getAuthenticatedUser(request)

        if (authResult.error) {
            return authResult.response
        }

        const body = await request.json()
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: 'Habit ID is required' }, { status: 400 })
        }

        // Verify ownership before deleting
        const habit = await prisma.habit.delete({
            where: {
                id,
                userId: authResult.userId // Ensure user owns this habit
            }
        })

        return NextResponse.json({ success: true, habit })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete habit' }, { status: 500 })
    }
}
