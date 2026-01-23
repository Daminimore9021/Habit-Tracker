import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch user' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { xpToAdd, userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) throw new Error('User not found')

        const newXp = (user.xp || 0) + xpToAdd
        const newTotalXp = (user.totalXp || 0) + xpToAdd
        const newLevel = Math.floor(newXp / 100) + 1

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                xp: newXp,
                totalXp: newTotalXp,
                level: newLevel
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to update XP' }, { status: 500 })
    }
}
