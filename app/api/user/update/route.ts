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
        const { userId, name, password, avatar } = body

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const dataToUpdate: any = {}
        if (name) dataToUpdate.name = name
        if (avatar !== undefined) dataToUpdate.avatar = avatar // Allow clearing if null/empty
        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10)
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate
        })

        const { password: _, ...userWithoutPassword } = updatedUser

        return NextResponse.json(userWithoutPassword)

    } catch (error: any) {
        console.error('Update User Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 })
    }
}
