import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
        }

        const user = await (prisma as any).user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Update user
        await (prisma as any).user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        })

        return NextResponse.json({ message: 'Password updated successfully!' })
    } catch (error: any) {
        console.error('Reset Password Error:', error)
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }
}
