import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    headers()
    try {
        const body = await request.json()
        const { username, password, name, email } = body

        if (!username || !password || !email) {
            return NextResponse.json({ error: 'Username, password, and email are required' }, { status: 400 })
        }

        // Check if user already exists (username or email)
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        })

        if (existingUser) {
            const field = existingUser.username === username ? 'Username' : 'Email'
            return NextResponse.json({ error: `${field} already exists` }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
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
