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
        const body = await request.json()

        // Distinguish between Creating a User (SignUp) and Updating XP (Game)
        // 1. XP Update (Game Loop)
        if (body.xpToAdd !== undefined) {
            // Get authenticated user from Supabase session
            const authResult = await getAuthenticatedUser(request)

            if (authResult.error) {
                return authResult.response
            }

            const { xpToAdd } = body

            // Get current user
            const user = await prisma.user.findUnique({
                where: { id: authResult.userId }
            })

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 })
            }

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
        }

        // 2. Create User (Sign Up)
        else {
            const { id, email, username, avatar } = body

            if (!id || !email) {
                return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { id }
            })

            if (existingUser) {
                return NextResponse.json({ error: 'User already exists' }, { status: 409 })
            }

            const newUser = await prisma.user.create({
                data: {
                    id,
                    email,
                    username: username || email.split('@')[0],
                    avatar,
                    level: 1,
                    xp: 0
                }
            })

            return NextResponse.json(newUser)
        }

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 })
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
