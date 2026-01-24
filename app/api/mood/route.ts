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

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const moods = await prisma.moodLog.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 30
        })

        return NextResponse.json(moods)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch moods' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { moodType, message, date, userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const mood = await prisma.moodLog.upsert({
            where: {
                date_userId: {
                    date,
                    userId
                }
            },
            update: {
                moodType,
                message
            },
            create: {
                date,
                moodType,
                message,
                userId
            }
        })

        return NextResponse.json(mood)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to save mood' }, { status: 500 })
    }
}
