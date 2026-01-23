import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- DB Debug ---')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'Not Defined')

    try {
        const users = await prisma.user.findMany()
        console.log('User count:', users.length)
        console.log('Users:', JSON.stringify(users, null, 2))
    } catch (error) {
        console.error('Error fetching users:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
