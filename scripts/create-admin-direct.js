const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const username = 'admin'
    const password = 'password123'
    const name = 'Admin User'

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.upsert({
            where: { username },
            update: {
                password: hashedPassword,
                name
            },
            create: {
                username,
                password: hashedPassword,
                name,
                level: 1,
                xp: 0,
                totalXp: 0
            }
        })
        console.log('Admin user created/updated successfully:', user.id)
    } catch (error) {
        console.error('Error creating admin user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
