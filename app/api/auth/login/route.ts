import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { username, password } = body

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
        }

        // Find user
        const user = await (prisma as any).user.findUnique({
            where: { username }
        })

        if (!user || !user.password) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
        }

        // Omit password from response
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json(userWithoutPassword)
    } catch (error: any) {
        console.error('Login Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to login' }, { status: 500 })
    }
}
