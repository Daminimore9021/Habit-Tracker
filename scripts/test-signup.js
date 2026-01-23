import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testSignup() {
    const username = 'testuser_' + Date.now()
    const password = 'password123'
    const name = 'Test User'

    console.log(`Testing signup for: ${username}`)

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                level: 1,
                xp: 0,
                totalXp: 0
            }
        })
        console.log('Signup Successful:', user.id)
    } catch (error) {
        console.error('Signup Failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

testSignup()
