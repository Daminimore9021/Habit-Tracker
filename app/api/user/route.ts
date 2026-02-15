import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import prisma from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
    headers()
    try {
        // Get authenticated user from Supabase session
        const authResult = await getAuthenticatedUser(request)

        if (authResult.error) {
            return authResult.response
        }

        const user = await prisma.user.findUnique({
            where: { id: authResult.userId }
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


export async function POST(request: NextRequest) {
    try {
        // Get authenticated user from Supabase session
        const authResult = await getAuthenticatedUser(request)

        if (authResult.error) {
            return authResult.response
        }

        const body = await request.json()
        const { xpToAdd } = body

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: authResult.userId }
        })

        if (!user) throw new Error('User not found')

        const newXp = (user.xp || 0) + xpToAdd
        const newTotalXp = (user.totalXp || 0) + xpToAdd
        const newLevel = Math.floor(newXp / 100) + 1

        const updatedUser = await prisma.user.update({
            where: { id: authResult.userId },
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


export async function PATCH(request: NextRequest) {
    try {
        // Get authenticated user from Supabase session
        const authResult = await getAuthenticatedUser(request)

        if (authResult.error) {
            return authResult.response
        }

        const body = await request.json()
        const { name, avatar } = body

        const updatedUser = await prisma.user.update({
            where: { id: authResult.userId },
            data: {
                ...(name && { name }),
                ...(avatar !== undefined && { avatar })
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 })
    }
}
