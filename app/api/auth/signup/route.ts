import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { username, password, name } = body

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
        }

        // Check if user already exists
        const existingUser = await (prisma as any).user.findUnique({
            where: { username }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await (prisma as any).user.create({
            data: {
                username,
                password: hashedPassword,
                name: name || username,
                level: 1,
                xp: 0,
                totalXp: 0
            }
        })

        // Omit password from response
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json(userWithoutPassword)
    } catch (error: any) {
        console.error('Signup Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to create account' }, { status: 500 })
    }
}
